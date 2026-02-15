"""
Stock Fortress — Blog Engine
Auto-generates Seeking Alpha-style blog articles from report data.
Prevents duplicates: one post per ticker per calendar day.
"""

import os
import json
import re
from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from ai_provider import ai_generate_blog

# ── Supabase client (service role — bypasses RLS) ──
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

_supabase = None
def _get_sb():
    global _supabase
    if not _supabase and SUPABASE_URL and SUPABASE_SERVICE_KEY:
        _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _supabase


router = APIRouter(prefix="/api/blog", tags=["blog"])


# ─── BLOG GENERATION PROMPT ───
BLOG_PROMPT = """You are a senior financial writer at Stock Fortress Research.

Convert the following structured stock analysis JSON into a SHORT TEASER blog article.
This is a PREVIEW — NOT the full analysis. The goal is to hook readers and drive them to sign up for the full 7-step institutional report.

REQUIREMENTS:
1. TITLE: Create a click-worthy but honest title. Examples:
   - "NVDA Stock: Is the AI King Still Worth Buying at $890?"
   - "HIMS: The $2B Telehealth Bet That Wall Street Is Sleeping On"
   - "TSLA Analysis: 3 Red Flags Every Investor Should Know"

2. EXCERPT: Write a 140-160 character SEO meta description that hooks the reader.

3. ARTICLE (300-450 words ONLY, markdown format):
   - **Opening Hook** (2-3 sentences): Lead with the most compelling finding
   - **Company Snapshot**: 2-3 sentences on what they do and why now
   - **Key Highlights**: 3-4 bullet points with HIGH-LEVEL metrics only (revenue trend, growth %, verdict). Do NOT include exact EPS, DCF, detailed balance sheet, or risk matrix.
   - **Our Verdict**: State the verdict (BUY/WATCH/AVOID) with ONE sentence of reasoning
   - **End with**: "Want the full 7-step institutional analysis — including detailed financials, risk assessment, valuation model, and earnings deep-dive? Run your own Stock Fortress report."

   CRITICAL — DO NOT INCLUDE:
   - Detailed financial tables or exact EPS/revenue numbers
   - DCF valuation or price targets
   - Risk matrix or detailed competitive analysis
   - Earnings guidance specifics
   - Balance sheet details
   These are PREMIUM content reserved for the full report.

4. TONE: Authoritative but accessible. Tease insights without giving away the full picture.

5. TAGS: Generate 3-5 relevant tags (e.g., ["NVDA", "Technology", "AI Stocks", "Large Cap"])

Return ONLY valid JSON (no markdown fences, no preamble):
{
  "title": "...",
  "excerpt": "...",
  "content": "... (short teaser markdown) ...",
  "tags": ["...", "..."]
}"""


def _make_slug(ticker: str, title: str) -> str:
    """Generate a URL-friendly slug from ticker and title."""
    base = f"{ticker}-{title}".lower()
    slug = re.sub(r'[^a-z0-9]+', '-', base).strip('-')
    # Add date for uniqueness
    today = date.today().strftime("%Y-%m-%d")
    return f"{slug}-{today}"[:120]


async def generate_blog_post(ticker: str, report_data: dict, report_id: str = None):
    """
    Generate a blog post from report data.
    Skips if a post for this ticker already exists today (prevents duplicates).
    """
    sb = _get_sb()
    if not sb:
        print("⚠️ Blog: Supabase not configured, skipping")
        return None

    # ── DUPLICATE CHECK ──
    today_str = date.today().isoformat()
    existing = sb.table("blog_posts") \
        .select("id") \
        .eq("ticker", ticker.upper()) \
        .gte("created_at", f"{today_str}T00:00:00Z") \
        .lte("created_at", f"{today_str}T23:59:59Z") \
        .execute()

    if existing.data:
        print(f"📝 Blog: Post for {ticker} already exists today, skipping")
        return existing.data[0]

    # ── GENERATE ARTICLE ──
    try:
        text = await ai_generate_blog(
            system_prompt=BLOG_PROMPT,
            user_prompt=f"Generate a blog article for ticker {ticker}. Here is the analysis data:\n\n{json.dumps(report_data, indent=2)}",
        )

        blog_data = json.loads(text)
    except Exception as e:
        print(f"❌ Blog generation failed for {ticker}: {e}")
        return None

    # ── EXTRACT VERDICT ──
    verdict = None
    try:
        verdict = report_data.get("step_7_verdict", {}).get("action", "WATCH")
    except Exception:
        verdict = "WATCH"

    # ── SAVE TO DB ──
    slug = _make_slug(ticker.upper(), blog_data.get("title", ticker))

    post = {
        "ticker": ticker.upper(),
        "title": blog_data.get("title", f"{ticker} Stock Analysis"),
        "slug": slug,
        "excerpt": blog_data.get("excerpt", "")[:200],
        "content": blog_data.get("content", ""),
        "verdict": verdict,
        "tags": blog_data.get("tags", [ticker.upper()]),
        "report_id": report_id,
    }

    try:
        result = sb.table("blog_posts").insert(post).execute()
        print(f"✅ Blog: Published '{post['title']}' → /blog/{slug}")
        return result.data[0] if result.data else post
    except Exception as e:
        # Handle unique constraint violation (duplicate)
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            print(f"📝 Blog: Duplicate detected for {ticker}, skipping")
            return None
        print(f"❌ Blog: DB insert failed: {e}")
        return None


# ─── API ENDPOINTS ───

@router.get("")
async def list_blog_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    verdict: Optional[str] = None,
    ticker: Optional[str] = None,
):
    """List published blog posts with pagination."""
    sb = _get_sb()
    if not sb:
        raise HTTPException(503, "Database not configured")

    query = sb.table("blog_posts") \
        .select("id, ticker, title, slug, excerpt, verdict, author_name, tags, views, created_at") \
        .order("created_at", desc=True)

    if verdict:
        query = query.eq("verdict", verdict.upper())
    if ticker:
        query = query.eq("ticker", ticker.upper())

    # Pagination
    offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    result = query.execute()

    # Get total count for pagination
    count_query = sb.table("blog_posts").select("id", count="exact")
    if verdict:
        count_query = count_query.eq("verdict", verdict.upper())
    if ticker:
        count_query = count_query.eq("ticker", ticker.upper())
    count_result = count_query.execute()

    return {
        "posts": result.data or [],
        "total": count_result.count or 0,
        "page": page,
        "limit": limit,
        "pages": max(1, -(-( count_result.count or 0) // limit)),  # ceil division
    }


@router.get("/{slug}")
async def get_blog_post(slug: str):
    """Get a single blog post by slug. Increments view count."""
    sb = _get_sb()
    if not sb:
        raise HTTPException(503, "Database not configured")

    result = sb.table("blog_posts") \
        .select("*") \
        .eq("slug", slug) \
        .execute()

    if not result.data:
        raise HTTPException(404, "Post not found")

    post = result.data[0]

    # Bump view count (fire and forget)
    try:
        sb.table("blog_posts") \
            .update({"views": post["views"] + 1}) \
            .eq("id", post["id"]) \
            .execute()
    except Exception:
        pass

    return post
