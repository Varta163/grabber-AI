import json
import logging
import time
from typing import Optional

from google import genai
from google.genai import types

from config.settings import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

_client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=types.HttpOptions(api_version="v1"),
)

_ANALYSIS_PROMPT = """Analyze this tech/AI content and return ONLY valid JSON with no markdown formatting.

Title: {title}
Source: {source}
Content: {content}

Return exactly this JSON structure:
{{
  "summary": "2-3 sentence summary focused on what is new or significant",
  "category": "one of: AI | Dev | Design | Jobs | Market",
  "impact_score": <integer 1-10 based on significance to developers/designers>,
  "why_it_matters": "1-2 sentences explaining the practical significance",
  "action_items": ["specific actionable step 1", "specific actionable step 2"]
}}

Be concrete and practical. impact_score 8-10 = major shift, 5-7 = notable, 1-4 = minor update."""

_TREND_PROMPT = """Analyze these {count} recent tech/AI items and identify the top 3 trends.
Return ONLY valid JSON, no markdown.

Items:
{items}

Return:
[
  {{
    "topic": "trend name",
    "category": "AI | Dev | Design | Jobs | Market",
    "summary": "What is happening and why it matters",
    "avg_impact_score": <float>
  }}
]"""

_BRIEF_PROMPT = """Create a daily intelligence brief from these {count} tech items for developers and designers.
Return ONLY valid JSON, no markdown.

Items (sorted by impact):
{items}

Return:
{{
  "top_stories": [
    {{"title": "...", "summary": "...", "impact_score": <int>, "category": "..."}}
  ],
  "key_trends": ["trend 1", "trend 2", "trend 3"],
  "action_plan": [
    "Specific thing to do today based on today's news",
    "Specific thing to learn this week",
    "Tool or resource to check out"
  ],
  "category_breakdown": {{"AI": <count>, "Dev": <count>, "Design": <count>, "Jobs": <count>, "Market": <count>}}
}}"""

_CHAT_PROMPT = """You are GrabberAI, an intelligent assistant for developers and designers.
You have access to today's curated tech news and insights.

Recent context (top stories):
{context}

User question: {question}

Answer concisely and practically. Reference specific items from the context when relevant.
Suggest concrete tools, resources, or actions. Keep it under 200 words."""


def _call_gemini(prompt: str, retries: int = 3) -> Optional[str]:
    for attempt in range(retries):
        try:
            response = _client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )
            return response.text
        except Exception as exc:
            if attempt < retries - 1:
                wait = 2 ** attempt
                logger.warning("Gemini retry %d after %ds: %s", attempt + 1, wait, exc)
                time.sleep(wait)
            else:
                logger.error("Gemini failed after %d retries: %s", retries, exc)
    return None


def analyze_content(title: str, content: str, source: str) -> Optional[dict]:
    prompt = _ANALYSIS_PROMPT.format(title=title, source=source, content=content[:3500])
    raw = _call_gemini(prompt)
    if not raw:
        return None
    try:
        cleaned = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.error("JSON parse error for '%s': %s\nRaw: %s", title, exc, raw[:200])
        return None


def detect_trends(items: list[dict]) -> list[dict]:
    if not items:
        return []
    formatted = "\n".join(
        f"- [{i['category']}] {i['title']}: {i['summary']}"
        for i in items[:30]
    )
    prompt = _TREND_PROMPT.format(count=len(items), items=formatted)
    raw = _call_gemini(prompt)
    if not raw:
        return []
    try:
        cleaned = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(cleaned)
    except Exception as exc:
        logger.error("Trend parse error: %s", exc)
        return []


def generate_daily_brief(items: list[dict]) -> Optional[dict]:
    if not items:
        return None
    sorted_items = sorted(items, key=lambda x: x.get("impact_score", 0), reverse=True)
    formatted = "\n".join(
        f"- [{i['category']}] (score:{i.get('impact_score',5)}) {i['title']}: {i['summary']}"
        for i in sorted_items[:20]
    )
    prompt = _BRIEF_PROMPT.format(count=len(sorted_items), items=formatted)
    raw = _call_gemini(prompt)
    if not raw:
        return None
    try:
        cleaned = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(cleaned)
    except Exception as exc:
        logger.error("Brief parse error: %s", exc)
        return None


def chat_with_context(question: str, context_items: list[dict]) -> str:
    context = "\n".join(
        f"- [{i['category']}] {i['title']}: {i['summary']}"
        for i in context_items[:10]
    )
    prompt = _CHAT_PROMPT.format(context=context, question=question)
    response = _call_gemini(prompt)
    return response or "I couldn't process your question right now. Please try again."
