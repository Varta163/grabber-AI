import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://grabber_user:grabber_pass@localhost:5432/grabber_ai"
)

# Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.5-flash"

# App
APP_ENV = os.getenv("APP_ENV", "development")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# Scheduler
FETCH_INTERVAL_HOURS = int(os.getenv("FETCH_INTERVAL_HOURS", "6"))

# Cache TTL (seconds)
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))

# Gemini rate limiting
MAX_TOKENS_PER_CHUNK = 3000
MAX_CONCURRENT_AI_CALLS = 5

# Auth
JWT_SECRET = os.getenv("JWT_SECRET", "changeme-set-a-real-secret-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "72"))
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")

# Email (for password reset)
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@grabberai.com")
APP_URL = os.getenv("APP_URL", "http://localhost:5173").strip()
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
