import logging
from datetime import datetime

from sqlalchemy.orm import Session

from ai.gemini_client import analyze_content, detect_trends, generate_daily_brief
from db.models import DailyBrief, ProcessedContent, RawContent, Trend
from processing.cleaner import clean_content, truncate_for_ai
from processing.deduplicator import get_unprocessed_deduplicated

logger = logging.getLogger(__name__)


def process_pending(db: Session, batch_size: int = 20) -> dict:
    """Process unprocessed raw content through Gemini. Returns summary."""
    items = get_unprocessed_deduplicated(db, limit=batch_size)
    processed = 0
    skipped = 0

    for raw in items:
        try:
            clean = clean_content(raw.content or "")
            truncated = truncate_for_ai(f"{raw.title}\n\n{clean}")
            source_name = raw.source.name if raw.source else "Unknown"

            result = analyze_content(
                title=raw.title,
                content=truncated,
                source=source_name,
            )

            if not result:
                skipped += 1
                raw.is_processed = True
                db.commit()
                continue

            pc = ProcessedContent(
                raw_id=raw.id,
                title=raw.title,
                summary=result.get("summary", ""),
                category=result.get("category", "Market"),
                impact_score=float(result.get("impact_score", 5)),
                why_it_matters=result.get("why_it_matters", ""),
                action_items=result.get("action_items", []),
                source_name=source_name,
                source_url=raw.url,
                published_at=raw.published_at,
            )
            db.add(pc)
            raw.is_processed = True
            db.commit()
            processed += 1

        except Exception as exc:
            db.rollback()
            logger.error("Error processing raw id=%d: %s", raw.id, exc)
            skipped += 1

    logger.info("Processed %d items, skipped %d", processed, skipped)
    return {"processed": processed, "skipped": skipped}


def run_trend_detection(db: Session, hours: int = 24) -> list:
    """Detect trends from recent processed content."""
    from datetime import timedelta

    cutoff = datetime.utcnow() - timedelta(hours=hours)
    recent = (
        db.query(ProcessedContent)
        .filter(ProcessedContent.processed_at >= cutoff)
        .order_by(ProcessedContent.impact_score.desc())
        .limit(50)
        .all()
    )

    if not recent:
        return []

    items = [
        {
            "title": p.title,
            "summary": p.summary,
            "category": p.category,
            "impact_score": p.impact_score,
        }
        for p in recent
    ]

    trends_data = detect_trends(items)
    saved = []

    period_start = cutoff
    period_end = datetime.utcnow()

    for td in trends_data:
        trend = Trend(
            topic=td.get("topic", ""),
            category=td.get("category", "Market"),
            avg_impact_score=float(td.get("avg_impact_score", 5.0)),
            summary=td.get("summary", ""),
            related_content_ids=[p.id for p in recent[:5]],
            period_start=period_start,
            period_end=period_end,
        )
        db.add(trend)
        saved.append(td)

    db.commit()
    return saved


def build_daily_brief(db: Session) -> dict | None:
    """Build today's daily brief from processed content."""
    from datetime import timedelta

    cutoff = datetime.utcnow() - timedelta(hours=24)
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    existing = db.query(DailyBrief).filter(DailyBrief.date == today).first()
    if existing:
        return {
            "top_stories": existing.top_stories,
            "key_trends": existing.key_trends,
            "action_plan": existing.action_plan,
            "category_breakdown": existing.category_breakdown,
        }

    recent = (
        db.query(ProcessedContent)
        .filter(ProcessedContent.processed_at >= cutoff)
        .order_by(ProcessedContent.impact_score.desc())
        .limit(30)
        .all()
    )

    if not recent:
        return None

    items = [
        {
            "title": p.title,
            "summary": p.summary,
            "category": p.category,
            "impact_score": p.impact_score,
            "source_name": p.source_name,
        }
        for p in recent
    ]

    brief_data = generate_daily_brief(items)
    if not brief_data:
        return None

    brief = DailyBrief(
        date=today,
        top_stories=brief_data.get("top_stories", []),
        key_trends=brief_data.get("key_trends", []),
        action_plan=brief_data.get("action_plan", []),
        category_breakdown=brief_data.get("category_breakdown", {}),
    )
    db.add(brief)
    db.commit()
    return brief_data
