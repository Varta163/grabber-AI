from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.connection import get_db
from fetch.rss_fetcher import fetch_all_rss
from fetch.scraper import scrape_all
from ai.analyzer import process_pending, run_trend_detection, build_daily_brief

router = APIRouter()


@router.post("/fetch")
def trigger_fetch(db: Session = Depends(get_db)):
    rss = fetch_all_rss(db)
    scrape = scrape_all(db)
    return {"rss": rss, "scrape": scrape}


@router.post("/process")
def trigger_process(batch_size: int = 20, db: Session = Depends(get_db)):
    return process_pending(db, batch_size=batch_size)


@router.post("/trends")
def trigger_trends(hours: int = 24, db: Session = Depends(get_db)):
    trends = run_trend_detection(db, hours=hours)
    return {"trends_detected": len(trends), "trends": trends}


@router.post("/brief")
def trigger_brief(db: Session = Depends(get_db)):
    return build_daily_brief(db)


@router.post("/run-all")
def run_full_pipeline(db: Session = Depends(get_db)):
    """Run entire pipeline: fetch → process → trends → brief."""
    rss = fetch_all_rss(db)
    scrape = scrape_all(db)
    processing = process_pending(db, batch_size=50)
    trends = run_trend_detection(db)
    brief = build_daily_brief(db)
    return {
        "fetch": {"rss": rss, "scrape": scrape},
        "processing": processing,
        "trends_detected": len(trends),
        "brief_generated": brief is not None,
    }
