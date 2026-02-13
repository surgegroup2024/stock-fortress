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
import json
from datetime import datetime, timedelta
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the same directory as this script
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types

# ─── CONFIG ───
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")

app = FastAPI(title="Stock Fortress API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lock this down in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache (use Redis in production)
_cache = {}
CACHE_TTL = timedelta(hours=24)


def get_cache(key: str) -> Optional[dict]:
    if key in _cache:
        entry = _cache[key]
        if datetime.now() - entry["ts"] < CACHE_TTL:
            return entry["data"]
        del _cache[key]
    return None


def set_cache(key: str, data: dict):
    _cache[key] = {"data": data, "ts": datetime.now()}


# ─── GEMINI ANALYSIS (with Google Search Grounding) ───
SYSTEM_PROMPT = """You are the lead research analyst at Stock Fortress Research.

BRAND VOICE: Direct. Data-driven. No hype. No fluff. You protect investors from bad decisions.
AUDIENCE: New-to-intermediate retail investors who need to SLOW DOWN and think before trading.

You produce a structured "pre-trade checklist" forcing users to understand what they're buying.

Use Google Search to gather real-time financial data including:
- Current stock price, market cap, P/E ratio, 52-week range
- Recent quarterly earnings and revenue figures
- Balance sheet highlights (debt levels, cash position)
- Any regulatory or legal risks

FACTUAL PRECISION PROTOCOL:
- Differentiate between product forms. If a specific delivery method (e.g., "oral pill", "compounded pill") is mentioned as halted, do NOT report it as a general product halt.
- For every "Step 4: Red Flag", you MUST include the specific date of the event (Month Day, Year) and the precise scope of the news.
- Never "guess" a price or metric. If Google Search grounding provides conflicting data, prioritize official SEC filings or recent earnings PRs.
- Avoid vague terms like "discontinued" or "halted" unless the entire business line is affected. Be specific (e.g., "halted sales of the oral formulation only").

Return ONLY valid JSON (no markdown fences, no preamble) with this exact structure:

{
  "meta": {
    "ticker": "", "company_name": "", "sector": "", "current_price": "",
    "market_cap": "", "pe_ratio": "", "fifty_two_week_range": "",
    "avg_volume": "", "report_date": "", "data_freshness_note": ""
  },
  "step_1_know_what_you_own": {
    "one_liner": "What this company does - one sentence a 12yr old understands",
    "how_it_makes_money": "2-3 sentences on revenue model",
    "key_products_or_services": [""],
    "customer_type": "Who pays them",
    "pass_fail": "YES or NO - could you explain this to a friend?"
  },
  "step_2_check_the_financials": {
    "revenue_latest": "", "revenue_growth_yoy": "", "profitable": true,
    "net_income_latest": "", "gross_margin": "", "debt_level": "LOW|MODERATE|HIGH",
    "free_cash_flow": "", "financial_health_grade": "A|B|C|D|F",
    "red_flags": [""], "green_flags": [""]
  },
  "step_3_understand_the_story": {
    "bull_case": "2-3 sentences max",
    "bear_case": "2-3 sentences max",
    "what_must_go_right": [""],
    "what_could_go_wrong": [""],
    "is_this_priced_in": "What current price assumes"
  },
  "step_4_know_the_risks": {
    "top_3_risks": [{"risk": "", "severity": "LOW|MEDIUM|HIGH|CRITICAL", "explanation": ""}],
    "recent_red_flags": [""],
    "regulatory_exposure": "",
    "concentration_risk": ""
  },
  "step_5_check_the_competition": {
    "main_competitors": [{"name": "", "why_they_compete": "", "advantage_over_this_stock": ""}],
    "moat_strength": "NONE|WEAK|MODERATE|STRONG",
    "moat_explanation": ""
  },
  "step_6_valuation_reality_check": {
    "current_pe": "", "sector_avg_pe": "", "price_to_sales": "",
    "is_it_expensive": "CHEAP|FAIR|EXPENSIVE|SPECULATIVE",
    "valuation_context": "2 sentences",
    "bear_case_price": "", "base_case_price": "", "bull_case_price": ""
  },
  "step_7_verdict": {
    "action": "BUY|WATCH|AVOID",
    "confidence": "LOW|MEDIUM|HIGH",
    "one_line_reason": "",
    "what_would_change_this": "",
    "most_important_metric_to_track": "",
    "suggested_revisit_date": ""
  },
  "investor_gut_check": {
    "question_1": "Specific to this stock",
    "question_2": "Specific to this stock",
    "question_3": "Specific to this stock",
    "question_4": "Position sizing question",
    "mindset_reminder": "Specific to THIS stock's situation - no generic quotes"
  }
}"""


async def generate_report(ticker: str) -> dict:
    """Send ticker to Gemini with Google Search grounding to get structured analysis"""
    client = genai.Client(api_key=GEMINI_KEY)

    # For Gemini 3 / 2.5 Preview Models
    grounding_tool = types.Tool(
        google_search=types.GoogleSearch()
    )

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=[grounding_tool],
        temperature=0.4,
    )

    try:
        response = client.models.generate_content(
            model="gemini-3-pro-preview",
            contents=f"""Generate a Stock Fortress 7-Step Pre-Trade Research Report for {ticker}.

SEARCH REQUIREMENTS:
1. Current stock price, market cap, P/E ratio, and key metrics.
2. Latest quarterly earnings and revenue (look for the most recent 10-Q or 10-K).
3. Balance sheet highlights (specific debt/cash levels).
4. Recent news (last 30 days). CRITICAL: If you find news about product halts or lawsuits, verify the EXACT scope (e.g., pill vs. injection) and the specific date.
5. Competitive landscape and moat analysis.
6. Analyst estimates and price targets.
7. Regulatory, legal, or concentration risks.

Return ONLY the JSON structure specified in the system prompt. No markdown fences, no preamble.""",
            config=config,
        )
    except Exception as e:
        print(f"\n[GEMINI API ERROR]: {str(e)}\n")
        raise e

    # Extract and parse JSON from response
    full_text = response.text.strip()
    if full_text.startswith("```"):
        full_text = full_text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    return json.loads(full_text)


# ─── API ENDPOINTS ───
@app.get("/")
def root():
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
    return {"ticker": ticker, "cached": False, "report": report}


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "gemini_configured": bool(GEMINI_KEY),
        "cache_entries": len(_cache),
    }


# ─── RUN ───
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
