import re
from bs4 import BeautifulSoup


_AD_PATTERNS = re.compile(
    r"(subscribe now|click here|advertisement|sponsored|sign up for|newsletter"
    r"|follow us|share this|cookie policy|privacy policy|terms of service"
    r"|all rights reserved|copyright \d{4})",
    re.IGNORECASE,
)


def strip_html(text: str) -> str:
    if not text:
        return ""
    return BeautifulSoup(text, "html.parser").get_text(separator=" ", strip=True)


def remove_ads(text: str) -> str:
    lines = text.splitlines()
    cleaned = [line for line in lines if not _AD_PATTERNS.search(line)]
    return "\n".join(cleaned).strip()


def normalize_whitespace(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def clean_content(raw_text: str) -> str:
    text = strip_html(raw_text)
    text = remove_ads(text)
    text = normalize_whitespace(text)
    return text


def truncate_for_ai(text: str, max_chars: int = 4000) -> str:
    """Truncate content to fit within Gemini token budget."""
    if len(text) <= max_chars:
        return text
    # Cut at last sentence boundary
    truncated = text[:max_chars]
    last_period = truncated.rfind(".")
    if last_period > max_chars * 0.7:
        return truncated[: last_period + 1]
    return truncated + "..."
