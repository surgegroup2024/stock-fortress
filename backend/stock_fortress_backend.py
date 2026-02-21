"""
Stock Fortress API Backend
Deploy on Railway / Render / Vercel Serverless

Architecture:
  1. User enters ticker → Frontend calls /api/report/{ticker}
  2. Backend sends ticker + analysis prompt to Gemini API (with Google Search grounding)
  3. Gemini searches the web for real-time financial data
  4. Gemini returns structured JSON report
  5. Backend caches result (24h) and returns to frontend

Requirements:
  pip install fastapi uvicorn google-genai

Environment Variables:
  GEMINI_API_KEY=your-gemini-key
  REDIS_URL=redis://... (optional, for caching)
"""

import os
import asyncio
import json
from datetime import datetime, timedelta
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the same directory as this script
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)


from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response

# AI Provider (configurable: gemini, openai, anthropic, perplexity)
from ai_provider import ai_generate, AI_PROVIDER, AI_MODEL

# ─── CONFIG ───
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")

app = FastAPI(title="Stock Fortress API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lock this down in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Billing Router (Stripe) ──
try:
    from stripe_billing import router as billing_router
    app.include_router(billing_router)
    print("✅ Billing routes mounted at /api/billing/*")
except ImportError as e:
    print(f"⚠️ Billing module not loaded: {e}")

# ── Market Data Router ──
try:
    from market_data import router as market_router
    app.include_router(market_router)
    print("✅ Market Data routes mounted at /api/market-data/*")
except ImportError as e:
    print(f"⚠️ Market Data module not loaded: {e}")

# ── Blog Engine Router ──
try:
    from blog_engine import router as blog_router, generate_blog_post
    app.include_router(blog_router)
    print("✅ Blog routes mounted at /api/blog/*")
except ImportError as e:
    generate_blog_post = None
    print(f"⚠️ Blog module not loaded: {e}")


import redis

# Simple in-memory cache (fallback)
_cache = {}
CACHE_TTL = timedelta(hours=24)

# Redis Connection
REDIS_URL = os.environ.get("REDIS_URL", "")
redis_client = None
if REDIS_URL and "YOUR_PASSWORD_HERE" not in REDIS_URL:
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=5)
        print("✅ Redis client initialized")
    except Exception as e:
        print(f"⚠️ Redis init failed: {e}")

def get_cache(key: str) -> Optional[dict]:
    # 1. Try Redis
    if redis_client:
        try:
            data = redis_client.get(key)
            if data:
                return json.loads(data)
        except Exception as e:
            print(f"⚠️ Redis read error: {e}")

    # 2. Fallback to Memory
    if key in _cache:
        entry = _cache[key]
        if datetime.now() - entry["ts"] < CACHE_TTL:
            return entry["data"]
        del _cache[key]
    return None


def set_cache(key: str, data: dict):
    # 1. Try Redis
    if redis_client:
        try:
            redis_client.setex(key, int(CACHE_TTL.total_seconds()), json.dumps(data))
        except Exception as e:
            print(f"⚠️ Redis write error: {e}")

    # 2. Always write to Memory (as backup/layered cache)
    _cache[key] = {"data": data, "ts": datetime.now()}

# ─── GEMINI ANALYSIS (with Google Search Grounding) ───
SYSTEM_PROMPT = """You are the lead research analyst at Stock Fortress Research.

BRAND VOICE: Direct. Data-driven. No hype. No fluff. Protect investors from bad decisions by forcing clarity and caution. Act like a cynical institutional risk manager vetting a portfolio manager's pitch.
AUDIENCE: New-to-intermediate retail investors who need to SLOW DOWN, understand risks, and think before trading.

Produce a structured "pre-trade checklist" that demands users grasp the business, numbers, story, risks, and valuation before acting.

Use Google Search to gather real-time, sourced data including:
- Current stock price, market cap, P/E (trailing & forward), 52-week range, beta, volume (cite Yahoo Finance / official source + date)
- Latest quarterly earnings: revenue actual vs. estimate, EPS beat/miss, net income, guidance ranges (cite earnings release date & transcript/PR)
- Balance sheet: cash, debt, key ratios (current/quick, debt-to-equity)
- Cash flow: operating cash flow, FCF trends
- Institutional/insider activity if notable (13F/Form 4 trends)
- Regulatory/legal risks or recent red flags with exact dates and scope
- Macro context: rates/inflation impact on sector, upcoming catalysts (earnings date, Fed events)
- For valuation: Peer multiples, historical ranges, analyst targets; use simple DCF assumptions if FCF data available (e.g., 5-year growth from guidance, 3% terminal, 10% discount rate — flag as [ASSUMPTION])

FACTUAL PRECISION PROTOCOL:
- Cite sources and dates for EVERY metric (e.g., 'Q3 2025 earnings release Nov 3, 2025', 'Yahoo Finance as of Feb 13, 2026').
- Flag forward-looking items as [FORWARD-LOOKING] or [ASSUMPTION].
- Differentiate product-specific vs. company-wide issues (e.g., 'halted oral formulation only' — do NOT generalize).
- Never guess prices/metrics. If data conflicts, prioritize official SEC filings, earnings PRs, or investor relations.
- Flag uncertainty explicitly (e.g., data >30 days old, conflicting sources).
- Write like capital is at risk: be conservative, highlight what could go wrong.
- For DCF/P/E: Use reported FCF/EPS; calculate P/E as price / EPS; for DCF, use basic formula with sourced inputs — do not overcomplicate for retail audience.

Return ONLY valid JSON (no markdown, no preamble, no extra text) with this exact structure:

{
  "meta": {
    "ticker": "",
    "company_name": "",
    "sector": "",
    "current_price": "",
    "market_cap": "",
    "trailing_pe": "",
    "forward_pe": "",
    "fifty_two_week_range": "",
    "avg_volume": "",
    "beta": "",
    "report_date": "",
    "data_freshness_note": "e.g., Most data as of Feb 13, 2026; next earnings Feb 23, 2026"
  },
  "step_1_know_what_you_own": {
    "one_liner": "One-sentence explanation a 12-year-old understands",
    "how_it_makes_money": "2-3 sentences on core revenue model and drivers",
    "key_products_or_services": [""],
    "customer_type": "Primary payers/users",
    "pass_fail": "YES or NO - could you explain this clearly to a friend? If NO, why?"
  },
  "step_2_check_the_financials": {
    "latest_quarter": "e.g., Q3 2025 (Nov 3, 2025 release)",
    "revenue_latest": "",
    "revenue_growth_yoy": "",
    "revenue_beat_miss": "e.g., Beat by $X (Y%) — cite source",
    "eps_latest": "",
    "eps_beat_miss": "e.g., Miss by $Z (W%) — cite source",
    "net_income_latest": "",
    "profitable": true,
    "gross_margin": "",
    "operating_margin_trend": "e.g., expanding / compressing over last 4 quarters",
    "debt_level": "LOW|MODERATE|HIGH",
    "free_cash_flow_latest": "",
    "cash_position": "",
    "financial_health_grade": "A|B|C|D|F",
    "red_flags": ["Bullet each with source/date"],
    "green_flags": ["Bullet each with source/date"],
    "revenue_breakdown": [
      {"segment": "e.g., iPhone", "percentage": 50, "revenue": "$200B"}
    ]
  },
  "step_2a_earnings_and_guidance_review": {
    "one_time_items": "Any adjustments or GAAP vs. adjusted differences (cite transcript)",
    "segment_breakdown": "Performance by key segments/products (growth %, contribution to results — cite PR)",
    "guidance_changes": "Next Q/FY revenue & EPS ranges; raise/lower/maintain vs. prior [FORWARD-LOOKING]",
    "management_tone": "Confident/cautious/defensive/uncertain — with 1-2 exact quotes from call transcript (cite date)",
    "analyst_reaction": "Post-earnings upgrades/downgrades if any (cite firm/date)",
    "forward_statements_note": "All guidance and outlook flagged as [FORWARD-LOOKING] or [ASSUMPTION] with uncertainty"
  },
  "step_3_understand_the_story": {
    "bull_case": "2-3 sentences max",
    "base_case": "2-3 sentences max",
    "bear_case": "2-3 sentences max",
    "what_must_go_right": [""],
    "what_could_break_the_story": [""],
    "macro_overlay": "Key macro tailwinds/headwinds (rates, inflation, sector rotation)",
    "catalyst_timeline": ["Next 1-3 months", "Medium-term (3-12 months)"]
  },
  "step_4_know_the_risks": {
    "top_risks": [
      {"risk": "", "severity": "LOW|MEDIUM|HIGH|CRITICAL", "likelihood": "LOW|MEDIUM|HIGH", "explanation": ""}
    ],
    "ownership_signals": "e.g., Insider selling trend, short interest %, institutional changes (cite dates)",
    "regulatory_exposure": "",
    "concentration_risk": ""
  },
  "step_5_check_the_competition": {
    "main_competitors": [{"name": "", "why_compete": "", "their_advantage": ""}],
    "moat_strength": "NONE|WEAK|MODERATE|STRONG",
    "moat_explanation": ""
  },
  "step_6_valuation_reality_check": {
    "current_pe": "Trailing P/E calculation (price / trailing EPS — cite EPS source)",
    "forward_pe": "Forward P/E (price / consensus EPS [FORWARD-LOOKING])",
    "sector_or_peer_avg_pe": "Average for 4-6 peers (cite date/source)",
    "price_to_sales": "",
    "ev_ebitda_if_relevant": "",
    "simple_dcf_implied_value": "Basic DCF: Use TTM FCF, assume 5-yr growth from guidance/historical avg [ASSUMPTION], 3% terminal [ASSUMPTION], 8-12% discount rate based on beta [ASSUMPTION]. CRITICAL: Calculate Total Implied Value, then DIVIDE by Shares Outstanding to get 'Implied Share Price'. Label final result as 'Implied Share Price: $X'.",
    "is_it_expensive": "CHEAP|FAIR|EXPENSIVE|SPECULATIVE",
    "valuation_context": "2 sentences including historical 3-5 yr P/E range and scenario upside/downside %",
    "base_case_target": "",
    "bull_case_target": "",
    "bear_case_target": ""
  },
  "step_7_verdict": {
    "action": "BUY|WATCH|AVOID",
    "confidence": "LOW|MEDIUM|HIGH",
    "one_line_reason": "",
    "what_signal_would_change_this": "",
    "most_important_metric_to_track": "",
    "suggested_revisit_date": "e.g., After next earnings or specific event"
  },
  "investor_gut_check": {
    "question_1": "Specific question about the single biggest company-specific risk (e.g., 'Am I comfortable holding if the DOJ lawsuit breaks up the Services division?')",
    "question_2": "Specific question about valuation vs. reality (e.g., 'Is a 30x P/E sustainable if iPhone growth is flat for 2 years?')",
    "question_3": "Specific question about the competitive threat (e.g., 'What happens to margins if competitor X releases their cheaper AI model?')",
    "question_4": "Specific question about position sizing given the specific volatility (e.g., 'Can I handle a 20% drawdown given the high 1.5 beta?')",
    "question_5": "ignored",
    "mindset_reminder": "Stock-specific warning based on the current setup (e.g., 'Great company, but priced for perfection.')"
  }
}"""


async def generate_report(ticker: str) -> dict:
    """Send ticker to AI provider to get structured analysis."""

    user_prompt = f"""Generate a Stock Fortress 7-Step Pre-Trade Research Report for {ticker}.

SEARCH REQUIREMENTS:
1. Current stock price, market cap, P/E ratio, and key metrics.
2. Latest quarterly earnings and revenue (look for the most recent 10-Q or 10-K).
3. Balance sheet highlights (specific debt/cash levels).
4. Recent news (last 30 days). CRITICAL: If you find news about product halts or lawsuits, verify the EXACT scope (e.g., pill vs. injection) and the specific date.
5. Competitive landscape and moat analysis.
6. Analyst estimates and price targets.
7. Regulatory, legal, or concentration risks.

Return ONLY the JSON structure specified in the system prompt. No markdown fences, no preamble."""

    try:
        # use_grounding=True enables Google Search when provider is Gemini
        full_text = await ai_generate(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            use_grounding=True,
        )
    except Exception as e:
        print(f"\n[AI API ERROR]: {str(e)}\n")
        raise e

    return json.loads(full_text)


# ─── API ENDPOINTS ───
@app.get("/")
def root():
    # In production, serve the frontend; in dev, return API info
    index = Path(__file__).parent / "static" / "index.html"
    if index.exists():
        return FileResponse(index)
    return {"service": "Stock Fortress API", "version": "1.0", "status": "active"}


@app.get("/api/report/{ticker}")
async def get_report(ticker: str):
    """
    Generate a Stock Fortress research report for any ticker.

    Gemini uses Google Search grounding to gather real-time financial data and
    produces a structured 7-step pre-trade checklist.
    Cached for 24 hours per ticker.
    """
    ticker = ticker.upper().strip()
    if not ticker or len(ticker) > 10:
        raise HTTPException(400, "Invalid ticker")

    # Check cache
    cache_key = f"report:{ticker}"
    cached = get_cache(cache_key)
    if cached:
        # Auto-generate blog post in background (even if cached)
        if generate_blog_post:
            asyncio.create_task(generate_blog_post(ticker, cached))
        return {"ticker": ticker, "cached": True, "report": cached}

    # Generate Gemini analysis (with Google Search grounding)
    try:
        report = await generate_report(ticker)
    except json.JSONDecodeError:
        raise HTTPException(502, "Failed to parse AI analysis - retry")
    except Exception as e:
        raise HTTPException(502, f"Analysis generation failed: {str(e)}")

    # Cache and return
    set_cache(cache_key, report)

    # Auto-generate blog post in background (non-blocking)
    if generate_blog_post:
        asyncio.create_task(generate_blog_post(ticker, report))

    return {"ticker": ticker, "cached": False, "report": report}


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "gemini_configured": bool(GEMINI_KEY),
        "cache_entries": len(_cache),
    }


# ─── SEO ENDPOINTS ───
# NOTE: These MUST be registered before the SPA catch-all /{path:path}
# so they are matched first. FastAPI matches routes in registration order.

async def _build_sitemap_xml():
    """Build sitemap XML content (shared by both /sitemap.xml and /api/sitemap.xml)."""
    from blog_engine import _get_sb
    sb = _get_sb()

    # Static pages
    today = datetime.now().strftime("%Y-%m-%d")
    urls = [
        {"loc": "https://stockfortress.com/", "changefreq": "daily", "priority": "1.0", "lastmod": today},
        {"loc": "https://stockfortress.com/blog", "changefreq": "daily", "priority": "0.9", "lastmod": today},
        {"loc": "https://stockfortress.com/pricing", "changefreq": "weekly", "priority": "0.7", "lastmod": today},
    ]

    # Blog posts from database
    if sb:
        try:
            result = sb.table("blog_posts") \
                .select("slug, created_at") \
                .order("created_at", desc=True) \
                .execute()
            for post in (result.data or []):
                lastmod = post["created_at"][:10] if post.get("created_at") else today
                urls.append({
                    "loc": f"https://stockfortress.com/blog/{post['slug']}",
                    "changefreq": "weekly",
                    "priority": "0.8",
                    "lastmod": lastmod,
                })
        except Exception as e:
            print(f"⚠️ Sitemap: Failed to fetch blog posts: {e}")

    # Build XML
    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_parts.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for u in urls:
        xml_parts.append("  <url>")
        xml_parts.append(f"    <loc>{u['loc']}</loc>")
        if u.get("lastmod"):
            xml_parts.append(f"    <lastmod>{u['lastmod']}</lastmod>")
        xml_parts.append(f"    <changefreq>{u['changefreq']}</changefreq>")
        xml_parts.append(f"    <priority>{u['priority']}</priority>")
        xml_parts.append("  </url>")
    xml_parts.append("</urlset>")

    return "\n".join(xml_parts)


@app.get("/sitemap.xml")
async def sitemap_root():
    """Serve sitemap at the standard root path Google expects."""
    xml = await _build_sitemap_xml()
    return Response(content=xml, media_type="application/xml")


@app.get("/api/sitemap.xml")
async def sitemap_api():
    """Also serve sitemap at /api/ path for backwards compatibility."""
    xml = await _build_sitemap_xml()
    return Response(content=xml, media_type="application/xml")


@app.get("/robots.txt")
def serve_robots():
    """Dynamic robots.txt with sitemap reference."""
    content = """User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/

Sitemap: https://stockfortress.com/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")


# ─── WWW REDIRECT MIDDLEWARE ───
# 301 redirect www.stockfortress.com → stockfortress.com
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import RedirectResponse

class WwwRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        host = request.headers.get("host", "")
        if host.startswith("www."):
            # Build the non-www URL and 301 redirect
            new_url = str(request.url).replace("://www.", "://", 1)
            return RedirectResponse(url=new_url, status_code=301)
        return await call_next(request)

app.add_middleware(WwwRedirectMiddleware)


# ─── STATIC FILE SERVING (Production) ───
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.exists():
    # Serve built frontend assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    # Files that should NEVER be served by the SPA fallback
    # (they have their own dedicated routes above)
    SEO_FILES = {"sitemap.xml", "robots.txt"}

    @app.get("/{path:path}")
    async def serve_spa(path: str):
        # Never intercept SEO files — they have dedicated handlers above
        if path in SEO_FILES:
            # This shouldn't normally be reached (dedicated routes match first),
            # but as a safety net, return the correct response
            if path == "sitemap.xml":
                xml = await _build_sitemap_xml()
                return Response(content=xml, media_type="application/xml")
            if path == "robots.txt":
                return serve_robots()

        file_path = STATIC_DIR / path
        if file_path.is_file():
            return FileResponse(file_path)
        # SPA fallback: serve index.html for all unmatched routes
        return FileResponse(STATIC_DIR / "index.html")


# ─── RUN ───
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
