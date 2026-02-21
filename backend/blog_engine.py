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
BLOG_PROMPT = """You are a senior financial copywriter at Stock Fortress Research.

Your job: Write a SHORT TEASER that creates FOMO. The reader should feel they NEED the full report.

GOLDEN RULE: Give them the STORY, not the DATA. Tease the conclusion, withhold the evidence.

REQUIREMENTS:
1. TITLE: Click-worthy but honest. Examples:
   - "NVDA Stock: Is the AI King Still Worth Buying at $890?"
   - "TSLA Analysis: 3 Red Flags Every Investor Should Know"

2. EXCERPT: 140-160 character SEO meta description.

3. ARTICLE (200-300 words MAX, markdown format):
   - **Opening Hook** (2-3 sentences): Lead with the most provocative finding. Use emotion, not numbers.
   - **The Setup** (2-3 sentences): What the company does and why NOW matters.
   - **The Tease** (3-4 bullet points): Use QUALITATIVE language only. Examples:
     ✅ "Revenue growth is accelerating — but one segment is dragging"
     ✅ "Margins are expanding faster than Wall Street expected"
     ✅ "The balance sheet tells a different story than the headlines"
     ❌ "Revenue was $24.9B, beating estimates by 0.6%" ← NEVER DO THIS
     ❌ "P/E of 379x, Forward P/E of 223x" ← NEVER DO THIS
   - **Our Verdict**: State BUY/WATCH/AVOID with ONE vague sentence. Do NOT explain why in detail.
   - **CTA**: "Want the full picture? Run your own Stock Fortress report."

HARD RULES — VIOLATING THESE IS A FAILURE:
- ABSOLUTELY NO markdown tables (no | pipes)
- NO exact dollar amounts, percentages, P/E ratios, EPS, margins, or revenue figures
- NO financial snapshots or metric grids
- NO price targets or DCF values
- NO balance sheet numbers
- Keep it UNDER 300 words. Shorter is better.
- Write like a movie trailer: show the genre, hide the plot twist

4. TONE: Confident, slightly mysterious. Make them curious, not informed.

5. TAGS: 3-5 relevant tags.

Return ONLY valid JSON (no markdown fences, no preamble):
{
  "title": "...",
  "excerpt": "...",
  "content": "... (short narrative teaser, NO tables, NO exact numbers) ...",
  "tags": ["...", "..."]
}"""


def _make_slug(ticker: str) -> str:
    """Generate a clean, SEO-friendly slug from ticker."""
    return f"{ticker.lower()}-stock-analysis"


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

        # ── SAFETY NET: Strip leaked financial data ──
        content = blog_data.get("content", "")
        # Remove markdown tables (lines with | pipes)
        content = "\n".join(
            line for line in content.split("\n")
            if not (line.strip().startswith("|") and line.strip().endswith("|"))
        )
        # Remove lines that are purely table separators
        content = re.sub(r'\n\s*\|[\s:\-|]+\|\s*\n', '\n', content)
        blog_data["content"] = content.strip()

    except Exception as e:
        print(f"❌ Blog generation failed for {ticker}: {e}")
        return None

    # ── EXTRACT VERDICT & COMPANY NAME ──
    verdict = None
    company_name = ""
    try:
        verdict = report_data.get("step_7_verdict", {}).get("action", "WATCH")
    except Exception:
        verdict = "WATCH"
    try:
        company_name = report_data.get("meta", {}).get("company_name", "")
    except Exception:
        company_name = ""

    # ── SAVE TO DB ──
    slug = _make_slug(ticker.upper())

    post = {
        "ticker": ticker.upper(),
        "title": blog_data.get("title", f"{ticker} Stock Analysis"),
        "slug": slug,
        "excerpt": blog_data.get("excerpt", "")[:200],
        "content": blog_data.get("content", ""),
        "verdict": verdict,
        "company_name": company_name,
        "tags": blog_data.get("tags", [ticker.upper()]),
        "report_id": report_id,
    }

    try:
        # Upsert: if slug already exists, update the post instead of failing
        result = sb.table("blog_posts").upsert(
            post, on_conflict="slug"
        ).execute()
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
# NOTE: Specific routes MUST come before the /{slug} catch-all

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
        .select("id, ticker, title, slug, excerpt, verdict, company_name, author_name, tags, views, created_at") \
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


@router.get("/all-slugs")
async def all_slugs():
    """Return all blog post slugs with tickers and dates (for sitemap generation)."""
    sb = _get_sb()
    if not sb:
        return {"posts": []}

    result = sb.table("blog_posts") \
        .select("ticker, slug, company_name, verdict, created_at") \
        .order("created_at", desc=True) \
        .execute()

    return {"posts": result.data or []}


@router.post("/migrate-slugs")
async def migrate_slugs():
    """
    One-time migration: update all existing blog post slugs
    from old format (ticker-title-date) to new format (ticker-stock-analysis).
    """
    sb = _get_sb()
    if not sb:
        raise HTTPException(503, "Database not configured")

    # Fetch all posts
    all_posts = sb.table("blog_posts").select("id, ticker, slug").execute()
    updated = 0
    skipped = 0

    for post in (all_posts.data or []):
        new_slug = _make_slug(post["ticker"])
        if post["slug"] == new_slug:
            skipped += 1
            continue
        try:
            sb.table("blog_posts") \
                .update({"slug": new_slug}) \
                .eq("id", post["id"]) \
                .execute()
            updated += 1
            print(f"  ✅ {post['slug']} → {new_slug}")
        except Exception as e:
            # Slug conflict — another post already has this slug (same ticker)
            print(f"  ⚠️ Conflict for {new_slug}: {e}")
            skipped += 1

    return {
        "message": f"Migration complete. Updated: {updated}, Skipped: {skipped}",
        "updated": updated,
        "skipped": skipped,
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


@router.get("/{slug}/related")
async def get_related_posts(slug: str):
    """Get 3-5 related blog posts (most recent, excluding current ticker)."""
    sb = _get_sb()
    if not sb:
        return {"posts": []}

    # Get current post's ticker
    current = sb.table("blog_posts").select("ticker").eq("slug", slug).execute()
    current_ticker = current.data[0]["ticker"] if current.data else None

    # Get recent posts excluding current ticker
    query = sb.table("blog_posts") \
        .select("ticker, title, slug, verdict, company_name, created_at") \
        .order("created_at", desc=True) \
        .limit(5)

    if current_ticker:
        query = query.neq("ticker", current_ticker)

    result = query.execute()
    return {"posts": result.data or []}
