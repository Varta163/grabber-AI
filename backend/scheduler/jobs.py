import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

from config.settings import FETCH_INTERVAL_HOURS
from db.connection import SessionLocal

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler(timezone="UTC")


def _fetch_job():
    from fetch.rss_fetcher import fetch_all_rss
    from fetch.scraper import scrape_all
    db = SessionLocal()
    try:
        rss = fetch_all_rss(db)
        scrape = scrape_all(db)
        logger.info("Scheduled fetch done — RSS: %d new, Scrape: %d new",
                    rss["total_new"], scrape["total_new"])
    except Exception as exc:
        logger.error("Fetch job error: %s", exc)
    finally:
        db.close()


def _process_job():
    from ai.analyzer import process_pending
    db = SessionLocal()
    try:
        result = process_pending(db, batch_size=30)
        logger.info("Scheduled processing done — %s", result)
    except Exception as exc:
        logger.error("Process job error: %s", exc)
    finally:
        db.close()


def _trends_job():
    from ai.analyzer import run_trend_detection
    db = SessionLocal()
    try:
        trends = run_trend_detection(db)
        logger.info("Trend detection done — %d trends found", len(trends))
    except Exception as exc:
        logger.error("Trends job error: %s", exc)
    finally:
        db.close()


def _brief_job():
    from ai.analyzer import build_daily_brief
    db = SessionLocal()
    try:
        result = build_daily_brief(db)
        logger.info("Daily brief %s", "generated" if result else "skipped (already exists)")
    except Exception as exc:
        logger.error("Brief job error: %s", exc)
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(
        _fetch_job,
        trigger=IntervalTrigger(hours=FETCH_INTERVAL_HOURS),
        id="fetch_all",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.add_job(
        _process_job,
        trigger=IntervalTrigger(hours=FETCH_INTERVAL_HOURS, minutes=30),
        id="process_all",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.add_job(
        _trends_job,
        trigger=IntervalTrigger(hours=12),
        id="detect_trends",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.add_job(
        _brief_job,
        trigger=CronTrigger(hour=7, minute=0),
        id="daily_brief",
        replace_existing=True,
        max_instances=1,
    )

    scheduler.start()
    logger.info("Scheduler started — fetch every %dh, brief at 07:00 UTC", FETCH_INTERVAL_HOURS)
    return scheduler


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")
