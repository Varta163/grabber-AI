import re
from difflib import SequenceMatcher
from typing import List

from sqlalchemy.orm import Session

from db.models import RawContent


def _normalize_title(title: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", title.lower()).strip()


def _similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def is_duplicate_title(title: str, existing_titles: List[str], threshold: float = 0.85) -> bool:
    normalized = _normalize_title(title)
    for existing in existing_titles:
        if _similarity(normalized, _normalize_title(existing)) >= threshold:
            return True
    return False


def get_unprocessed_deduplicated(db: Session, limit: int = 50) -> List[RawContent]:
    """
    Return unprocessed raw content with near-duplicate titles filtered out.
    Keeps the most recent version of similar titles.
    """
    candidates = (
        db.query(RawContent)
        .filter(RawContent.is_processed == False)  # noqa: E712
        .order_by(RawContent.fetched_at.desc())
        .limit(limit * 3)
        .all()
    )

    seen_titles: List[str] = []
    unique: List[RawContent] = []

    for item in candidates:
        if not is_duplicate_title(item.title, seen_titles):
            unique.append(item)
            seen_titles.append(_normalize_title(item.title))
        if len(unique) >= limit:
            break

    return unique
