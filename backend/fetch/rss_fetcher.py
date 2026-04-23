import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional

import feedparser
import httpx
from sqlalchemy.orm import Session

from config.sources import RSS_SOURCES
from db.models import RawContent, Source

logger = logging.getLogger(__name__)


def _get_or_create_source(db: Session, source_data: dict) -> Source:
    source = db.query(Source).filter(Source.url == source_data["url"]).first()
    if not source:
        source = Source(
            name=source_data["name"],
            url=source_data["url"],
            category=source_data["category"],
        )
        db.add(source)
        db.commit()
        db.refresh(source)
    return source


def _make_hash(url: str, title: str) -> str:
    return hashlib.sha256(f"{url}{title}".encode()).hexdigest()


def _parse_date(entry) -> Optional[datetime]:
    for attr in ("published_parsed", "updated_parsed"):
        val = getattr(entry, attr, None)
        if val:
            try:
                return datetime(*val[:6], tzinfo=timezone.utc)
            except Exception:
                pass
    return datetime.now(timezone.utc)


def _extract_content(entry) -> str:
    if hasattr(entry, "content") and entry.content:
        return entry.content[0].get("value", "")
    if hasattr(entry, "summary"):
        return entry.summary
    return ""


def fetch_rss_source(db: Session, source_data: dict) -> int:
    """Fetch a single RSS source. Returns number of new items saved."""
    source = _get_or_create_source(db, source_data)
    saved = 0

    try:
        feed = feedparser.parse(source_data["url"])
        if feed.bozo and not feed.entries:
            logger.warning("Bad feed: %s", source_data["url"])
            return 0

        for entry in feed.entries[:30]:
            url = getattr(entry, "link", "")
            title = getattr(entry, "title", "").strip()
            if not url or not title:
                continue

            content_hash = _make_hash(url, title)
            existing = db.query(RawContent).filter(
                RawContent.content_hash == content_hash
            ).first()
            if existing:
                continue

            content = _extract_content(entry)
            raw = RawContent(
                source_id=source.id,
                title=title,
                content=content[:10000],
                url=url,
                published_at=_parse_date(entry),
                content_hash=content_hash,
            )
            db.add(raw)
            saved += 1

        source.last_fetched = datetime.utcnow()
        source.fetch_count += 1
        db.commit()
        logger.info("Fetched %d new items from %s", saved, source_data["name"])

    except Exception as exc:
        db.rollback()
        logger.error("Error fetching %s: %s", source_data["url"], exc)

    return saved


def fetch_all_rss(db: Session) -> dict:
    """Fetch all configured RSS sources. Returns summary."""
    results = {"total_new": 0, "sources_fetched": 0, "errors": []}

    for source_data in RSS_SOURCES:
        try:
            count = fetch_rss_source(db, source_data)
            results["total_new"] += count
            results["sources_fetched"] += 1
        except Exception as exc:
            results["errors"].append({"source": source_data["name"], "error": str(exc)})

    return results
