"""
Stock Fortress — Configurable AI Provider
==========================================
Universal adapter supporting Gemini, OpenAI, Claude, Perplexity, and any LiteLLM-supported model.

Usage:
    from ai_provider import ai_generate, ai_generate_blog

Configuration via .env:
    AI_PROVIDER=gemini              # gemini | openai | anthropic | perplexity
    AI_MODEL=gemini-2.5-flash       # Model for reports
    AI_BLOG_MODEL=gemini-2.5-flash  # Model for blog teasers (defaults to AI_MODEL)
    AI_TEMPERATURE=0.4              # Default temperature
"""

import os
import json
from typing import Optional

# ─── CONFIG ───
AI_PROVIDER = os.environ.get("AI_PROVIDER", "gemini").lower()
AI_MODEL = os.environ.get("AI_MODEL", "gemini-2.5-flash")
AI_BLOG_MODEL = os.environ.get("AI_BLOG_MODEL", AI_MODEL)
AI_TEMPERATURE = float(os.environ.get("AI_TEMPERATURE", "0.4"))

# API Keys
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
PERPLEXITY_KEY = os.environ.get("PERPLEXITY_API_KEY", "")

print(f"🤖 AI Provider: {AI_PROVIDER} | Report Model: {AI_MODEL} | Blog Model: {AI_BLOG_MODEL}")


# ─── GEMINI NATIVE (with Google Search Grounding) ───

def _gemini_generate(system_prompt: str, user_prompt: str, model: str,
                     temperature: float, use_grounding: bool = False) -> str:
    """Generate content using the native Google GenAI SDK."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=GEMINI_KEY)

    tools = []
    if use_grounding:
        tools.append(types.Tool(google_search=types.GoogleSearch()))

    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        tools=tools if tools else None,
        temperature=temperature,
    )

    response = client.models.generate_content(
        model=model,
        contents=user_prompt,
        config=config,
    )

    text = response.text.strip()
    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return text


# ─── LITELLM UNIVERSAL (OpenAI, Claude, Perplexity, etc.) ───

def _litellm_generate(system_prompt: str, user_prompt: str, model: str,
                      temperature: float) -> str:
    """Generate content using LiteLLM (supports 100+ providers)."""
    import litellm

    # Set appropriate API keys
    if OPENAI_KEY:
        os.environ["OPENAI_API_KEY"] = OPENAI_KEY
    if ANTHROPIC_KEY:
        os.environ["ANTHROPIC_API_KEY"] = ANTHROPIC_KEY
    if PERPLEXITY_KEY:
        os.environ["PERPLEXITY_API_KEY"] = PERPLEXITY_KEY

    # LiteLLM model naming convention:
    # OpenAI: "gpt-4o", "gpt-4o-mini"
    # Claude: "anthropic/claude-3-5-sonnet-20241022"
    # Perplexity: "perplexity/sonar-pro"

    response = litellm.completion(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
    )

    text = response.choices[0].message.content.strip()
    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return text


# ─── PUBLIC API ───

async def ai_generate(system_prompt: str, user_prompt: str,
                      temperature: Optional[float] = None,
                      use_grounding: bool = False) -> str:
    """
    Generate AI content for REPORTS (heavy analysis).

    Args:
        system_prompt: The system instruction
        user_prompt: The user message
        temperature: Override default temperature
        use_grounding: Enable Google Search (Gemini only)

    Returns:
        Raw text response from the model
    """
    temp = temperature if temperature is not None else AI_TEMPERATURE
    model = AI_MODEL

    if AI_PROVIDER == "gemini":
        return _gemini_generate(system_prompt, user_prompt, model, temp, use_grounding)
    else:
        return _litellm_generate(system_prompt, user_prompt, model, temp)


async def ai_generate_blog(system_prompt: str, user_prompt: str,
                           temperature: Optional[float] = None) -> str:
    """
    Generate AI content for BLOG posts (light writing, no grounding).

    Args:
        system_prompt: The blog generation prompt
        user_prompt: Report JSON data to summarize

    Returns:
        Raw text response from the model
    """
    temp = temperature if temperature is not None else 0.6  # slightly creative for blogs
    model = AI_BLOG_MODEL

    if AI_PROVIDER == "gemini":
        return _gemini_generate(system_prompt, user_prompt, model, temp, use_grounding=False)
    else:
        return _litellm_generate(system_prompt, user_prompt, model, temp)
