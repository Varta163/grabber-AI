from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from db.connection import get_db
from db.models import User
from api.dependencies import require_admin

router = APIRouter()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class CreateUserRequest(BaseModel):
    email: str
    password: str
    subscription_status: str = "free"
    role: str = "user"


class UpdateUserRequest(BaseModel):
    subscription_status: Optional[str] = None  # none, free, subscribed
    is_active: Optional[bool] = None
    role: Optional[str] = None


def _row(u: User) -> dict:
    return {
        "id": u.id,
        "email": u.email,
        "role": u.role,
        "subscription_status": u.subscription_status,
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat(),
    }


@router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return [_row(u) for u in db.query(User).order_by(User.created_at.desc()).all()]


@router.post("/users")
def create_user(req: CreateUserRequest, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if db.query(User).filter(User.email == req.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=req.email.lower(),
        password_hash=pwd.hash(req.password),
        role=req.role,
        subscription_status=req.subscription_status,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _row(user)


@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    req: UpdateUserRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if req.subscription_status is not None:
        user.subscription_status = req.subscription_status
    if req.is_active is not None:
        user.is_active = req.is_active
    if req.role is not None:
        user.role = req.role
    db.commit()
    return _row(user)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"deleted": True}
