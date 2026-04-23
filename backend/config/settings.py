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
GEMINI_MODEL = "gemini-1.5-flash"

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
