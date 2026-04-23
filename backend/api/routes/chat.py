from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ai.gemini_client import chat_with_context
from db.connection import get_db
from db.models import ProcessedContent

router = APIRouter()


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    context_used: int


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(hours=48)
    context_items = (
        db.query(ProcessedContent)
        .filter(ProcessedContent.processed_at >= cutoff)
        .order_by(ProcessedContent.impact_score.desc())
        .limit(15)
        .all()
    )

    context = [
        {
            "title": p.title,
            "summary": p.summary,
            "category": p.category,
            "impact_score": p.impact_score,
            "why_it_matters": p.why_it_matters,
        }
        for p in context_items
    ]

    answer = chat_with_context(req.question, context)
    return ChatResponse(answer=answer, context_used=len(context))
