import hashlib
import logging
from datetime import datetime, timezone

import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from config.sources import SCRAPE_SOURCES
from db.models import RawContent, Source

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; GrabberAI/1.0; +https://github.com/grabber-ai)"
}


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


def scrape_source(db: Session, source_data: dict) -> int:
    """Scrape a single source. Returns number of new items saved."""
    source = _get_or_create_source(db, source_data)
    saved = 0

    try:
        with httpx.Client(headers=HEADERS, timeout=15, follow_redirects=True) as client:
            resp = client.get(source_data["url"])
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")
        items = soup.select(source_data.get("selector", "article"))[:20]

        for item in items:
            title_el = item.select_one("h1,h2,h3,a[href]")
            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            link = title_el.get("href", source_data["url"])
            if link.startswith("/"):
                from urllib.parse import urlparse
                parsed = urlparse(source_data["url"])
                link = f"{parsed.scheme}://{parsed.netloc}{link}"

            if not title:
                continue

            content_hash = hashlib.sha256(f"{link}{title}".encode()).hexdigest()
            if db.query(RawContent).filter(RawContent.content_hash == content_hash).first():
                continue

            paragraphs = item.select("p")
            content = " ".join(p.get_text(strip=True) for p in paragraphs)

            raw = RawContent(
                source_id=source.id,
                title=title,
                content=content[:10000],
                url=link,
                published_at=datetime.now(timezone.utc),
                content_hash=content_hash,
            )
            db.add(raw)
            saved += 1

        source.last_fetched = datetime.utcnow()
        db.commit()
        logger.info("Scraped %d new items from %s", saved, source_data["name"])

    except Exception as exc:
        db.rollback()
        logger.error("Error scraping %s: %s", source_data["url"], exc)

    return saved


def scrape_all(db: Session) -> dict:
    results = {"total_new": 0, "sources_scraped": 0, "errors": []}

    for source_data in SCRAPE_SOURCES:
        try:
            count = scrape_source(db, source_data)
            results["total_new"] += count
            results["sources_scraped"] += 1
        except Exception as exc:
            results["errors"].append({"source": source_data["name"], "error": str(exc)})

    return results
