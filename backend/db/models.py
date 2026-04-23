from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime,
    ForeignKey, Boolean, JSON, Index
)
from sqlalchemy.orm import relationship
from db.connection import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(1000), unique=True, nullable=False)
    category = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    last_fetched = Column(DateTime, nullable=True)
    fetch_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    raw_contents = relationship("RawContent", back_populates="source")

    __table_args__ = (Index("ix_sources_category", "category"),)


class RawContent(Base):
    __tablename__ = "raw_content"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    title = Column(String(1000), nullable=False)
    content = Column(Text, nullable=True)
    url = Column(String(2000), unique=True, nullable=False)
    published_at = Column(DateTime, nullable=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)
    content_hash = Column(String(64), unique=True, nullable=False)
    is_processed = Column(Boolean, default=False)

    source = relationship("Source", back_populates="raw_contents")
    processed = relationship("ProcessedContent", back_populates="raw", uselist=False)

    __table_args__ = (
        Index("ix_raw_content_source_id", "source_id"),
        Index("ix_raw_content_published_at", "published_at"),
        Index("ix_raw_content_is_processed", "is_processed"),
    )


class ProcessedContent(Base):
    __tablename__ = "processed_content"

    id = Column(Integer, primary_key=True, index=True)
    raw_id = Column(Integer, ForeignKey("raw_content.id"), unique=True, nullable=False)
    title = Column(String(1000), nullable=False)
    summary = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    impact_score = Column(Float, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    action_items = Column(JSON, nullable=False, default=list)
    source_name = Column(String(255), nullable=False)
    source_url = Column(String(2000), nullable=False)
    published_at = Column(DateTime, nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow)
    is_trending = Column(Boolean, default=False)

    raw = relationship("RawContent", back_populates="processed")

    __table_args__ = (
        Index("ix_processed_category", "category"),
        Index("ix_processed_impact_score", "impact_score"),
        Index("ix_processed_published_at", "published_at"),
        Index("ix_processed_is_trending", "is_trending"),
    )


class Trend(Base):
    __tablename__ = "trends"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(500), nullable=False)
    category = Column(String(50), nullable=False)
    mention_count = Column(Integer, default=1)
    avg_impact_score = Column(Float, nullable=False)
    summary = Column(Text, nullable=False)
    related_content_ids = Column(JSON, default=list)
    detected_at = Column(DateTime, default=datetime.utcnow)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)

    __table_args__ = (
        Index("ix_trends_category", "category"),
        Index("ix_trends_detected_at", "detected_at"),
        Index("ix_trends_mention_count", "mention_count"),
    )


class DailyBrief(Base):
    __tablename__ = "daily_briefs"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False, unique=True)
    top_stories = Column(JSON, default=list)
    key_trends = Column(JSON, default=list)
    action_plan = Column(JSON, default=list)
    category_breakdown = Column(JSON, default=dict)
    generated_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (Index("ix_daily_briefs_date", "date"),)
