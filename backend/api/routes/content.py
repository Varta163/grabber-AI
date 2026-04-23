from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.connection import get_db
from db.models import DailyBrief, ProcessedContent, Trend

router = APIRouter()


def _serialize_item(p: ProcessedContent) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "summary": p.summary,
        "category": p.category,
        "impact_score": p.impact_score,
        "why_it_matters": p.why_it_matters,
        "action_items": p.action_items,
        "source_name": p.source_name,
        "source_url": p.source_url,
        "published_at": p.published_at.isoformat() if p.published_at else None,
        "processed_at": p.processed_at.isoformat() if p.processed_at else None,
        "is_trending": p.is_trending,
    }


@router.get("/latest")
def get_latest(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = Query(None),
    min_impact: Optional[float] = Query(None, ge=1, le=10),
    db: Session = Depends(get_db),
):
    query = db.query(ProcessedContent).order_by(ProcessedContent.processed_at.desc())

    if category:
        query = query.filter(ProcessedContent.category == category)
    if min_impact:
        query = query.filter(ProcessedContent.impact_score >= min_impact)

    total = query.count()
    items = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "items": [_serialize_item(i) for i in items],
    }


@router.get("/trending")
def get_trending(
    limit: int = Query(10, ge=1, le=50),
    hours: int = Query(24, ge=1, le=168),
    db: Session = Depends(get_db),
):
    cutoff = datetime.utcnow() - timedelta(hours=hours)

    items = (
        db.query(ProcessedContent)
        .filter(
            ProcessedContent.processed_at >= cutoff,
            ProcessedContent.impact_score >= 7.0,
        )
        .order_by(ProcessedContent.impact_score.desc())
        .limit(limit)
        .all()
    )

    trends = (
        db.query(Trend)
        .filter(Trend.detected_at >= cutoff)
        .order_by(Trend.avg_impact_score.desc())
        .limit(5)
        .all()
    )

    return {
        "trending_stories": [_serialize_item(i) for i in items],
        "detected_trends": [
            {
                "id": t.id,
                "topic": t.topic,
                "category": t.category,
                "summary": t.summary,
                "avg_impact_score": t.avg_impact_score,
                "mention_count": t.mention_count,
                "detected_at": t.detected_at.isoformat(),
            }
            for t in trends
        ],
    }


@router.get("/categories")
def get_categories(
    hours: int = Query(24, ge=1, le=168),
    db: Session = Depends(get_db),
):
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    categories = ["AI", "Dev", "Design", "Jobs", "Market"]
    result = {}

    for cat in categories:
        items = (
            db.query(ProcessedContent)
            .filter(
                ProcessedContent.category == cat,
                ProcessedContent.processed_at >= cutoff,
            )
            .order_by(ProcessedContent.impact_score.desc())
            .limit(5)
            .all()
        )
        result[cat] = {
            "count": len(items),
            "top_items": [_serialize_item(i) for i in items],
        }

    return result


@router.get("/daily-brief")
def get_daily_brief(db: Session = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    brief = db.query(DailyBrief).filter(DailyBrief.date >= today).first()

    if not brief:
        from ai.analyzer import build_daily_brief
        data = build_daily_brief(db)
        if not data:
            raise HTTPException(status_code=404, detail="No data available yet. Run a fetch first.")
        return data

    return {
        "top_stories": brief.top_stories,
        "key_trends": brief.key_trends,
        "action_plan": brief.action_plan,
        "category_breakdown": brief.category_breakdown,
        "generated_at": brief.generated_at.isoformat(),
    }


@router.get("/item/{item_id}")
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ProcessedContent).filter(ProcessedContent.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return _serialize_item(item)
