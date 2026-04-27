import logging
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import jwt
from passlib.context import CryptContext

from config.settings import (
    JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS, ADMIN_EMAIL,
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, APP_URL, RESEND_API_KEY,
)
from db.connection import get_db
from db.models import User
from api.dependencies import get_current_user

router = APIRouter()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)


def _send_via_resend(to_email: str, reset_link: str):
    import resend
    resend.api_key = RESEND_API_KEY
    resend.Emails.send({
        "from": f"GrabberAI <{FROM_EMAIL}>",
        "to": [to_email],
        "subject": "Reset your GrabberAI password",
        "html": f"""
<html><body style="font-family:sans-serif;color:#1a1a1a">
<h2>Reset your GrabberAI password</h2>
<p>Click the button below to choose a new password. The link expires in 1 hour.</p>
<a href="{reset_link}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
<p style="margin-top:16px;font-size:12px;color:#666">If you didn't request this, you can ignore this email.</p>
</body></html>""",
    })


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


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


def _send_reset_email(to_email: str, token: str):
    reset_link = f"{APP_URL}?reset_token={token}"
    logger.info("🔑 PASSWORD RESET LINK for %s: %s", to_email, reset_link)

    if RESEND_API_KEY:
        try:
            _send_via_resend(to_email, reset_link)
            logger.info("Reset email sent via Resend to %s", to_email)
        except Exception as exc:
            logger.error("❌ Resend failed for %s: %s", to_email, exc)
        return

    if not SMTP_HOST:
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your GrabberAI password"
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email
    plain = f"Reset your password: {reset_link}\n\nThis link expires in 1 hour."
    html = f"""\
<html><body style="font-family:sans-serif;color:#1a1a1a">
<h2>Reset your GrabberAI password</h2>
<p>Click the button below to choose a new password. The link expires in 1 hour.</p>
<a href="{reset_link}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
<p style="margin-top:16px;font-size:12px;color:#666">If you didn't request this, you can ignore this email.</p>
</body></html>"""
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=8) as server:
            server.ehlo()
            server.starttls()
            if SMTP_USER:
                server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())
        logger.info("Reset email sent via SMTP to %s", to_email)
    except Exception as exc:
        logger.error("❌ SMTP failed for %s: %s", to_email, exc)


@router.post("/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if user and user.is_active:
        token = jwt.encode(
            {"sub": str(user.id), "purpose": "password_reset",
             "exp": datetime.utcnow() + timedelta(hours=1)},
            JWT_SECRET,
            algorithm=JWT_ALGORITHM,
        )
        _send_reset_email(user.email, token)
    # Always return the same message to avoid revealing whether email exists
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/auth/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(req.token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("purpose") != "password_reset":
            raise ValueError("wrong purpose")
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    user.password_hash = pwd.hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
