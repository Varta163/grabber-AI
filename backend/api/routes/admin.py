from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from db.connection import get_db, SessionLocal
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


def _run_pipeline_bg():
    db = SessionLocal()
    try:
        fetch_all_rss(db)
        scrape_all(db)
        process_pending(db, batch_size=50)
        run_trend_detection(db)
        build_daily_brief(db)
    finally:
        db.close()


@router.post("/run-all")
def run_full_pipeline(background_tasks: BackgroundTasks):
    """Kick off the full pipeline in the background and return immediately."""
    background_tasks.add_task(_run_pipeline_bg)
    return {"status": "pipeline started"}
