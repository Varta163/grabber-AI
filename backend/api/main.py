import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config.settings import CORS_ORIGINS
from db.connection import init_db
from api.routes import content, chat, admin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting GrabberAI...")
    init_db()
    logger.info("Database initialized")
    yield
    logger.info("Shutting down GrabberAI")


app = FastAPI(
    title="GrabberAI",
    description="AI-powered tech intelligence platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    logger.info("%s %s → %d (%sms)", request.method, request.url.path, response.status_code, duration)
    return response


@app.get("/health")
def health():
    return {"status": "ok", "service": "GrabberAI"}


app.include_router(content.router, prefix="/api", tags=["Content"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
