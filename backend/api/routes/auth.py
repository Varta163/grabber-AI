from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import jwt
from passlib.context import CryptContext

from config.settings import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS, ADMIN_EMAIL
from db.connection import get_db
from db.models import User
from api.dependencies import get_current_user

router = APIRouter()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthRequest(BaseModel):
    email: str
    password: str


def _make_token(user_id: int) -> str:
    return jwt.encode(
        {"sub": str(user_id), "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def _user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "subscription_status": user.subscription_status,
        "is_active": user.is_active,
    }


@router.post("/auth/signup")
def signup(req: AuthRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    is_admin = bool(ADMIN_EMAIL and req.email.lower() == ADMIN_EMAIL.lower())
    user = User(
        email=req.email.lower(),
        password_hash=pwd.hash(req.password),
        role="admin" if is_admin else "user",
        subscription_status="subscribed" if is_admin else "none",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": _make_token(user.id), "user": _user_dict(user)}


@router.post("/auth/login")
def login(req: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not pwd.verify(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    return {"token": _make_token(user.id), "user": _user_dict(user)}


@router.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return _user_dict(current_user)
