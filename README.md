# GrabberAI — Tech Intelligence Platform

AI-powered system that collects, processes, and delivers curated insights from across the tech internet.

## Stack
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **AI**: Google Gemini 1.5 Flash
- **Frontend**: React + Vite + Tailwind CSS
- **Scheduler**: APScheduler (fetch every 6h, brief at 07:00 UTC)

## Quick Start

### 1. Database Setup
Open `psql` as postgres and run:
```sql
CREATE DATABASE grabber_ai;
CREATE USER grabber_user WITH ENCRYPTED PASSWORD 'grabber_pass';
GRANT ALL PRIVILEGES ON DATABASE grabber_ai TO grabber_user;
```

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp ../.env.example ../.env  # then add your GEMINI_API_KEY
python run.py
```
Backend runs at http://localhost:8000

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173

### 4. First Run
Click **"Run Pipeline"** in the top-right of the UI to:
1. Fetch from 25+ RSS sources
2. Clean + deduplicate content
3. Analyze each item with Gemini
4. Detect trends
5. Generate today's brief

## API Endpoints
| Endpoint | Description |
|---|---|
| `GET /api/latest` | Paginated feed with filters |
| `GET /api/trending` | High-impact stories + detected trends |
| `GET /api/categories` | Breakdown by category |
| `GET /api/daily-brief` | AI-generated daily summary |
| `POST /api/chat` | Chat with AI using today's context |
| `POST /api/admin/run-all` | Trigger full pipeline |

## MVP Plan (4 Weeks)

**Week 1** — Infrastructure
- [x] Project structure, DB schema, config
- [ ] Set up PostgreSQL locally
- [ ] Get Gemini API key, test connection
- [ ] Run first fetch manually

**Week 2** — Data Pipeline
- [ ] Verify RSS fetching from all sources
- [ ] Test deduplication on real data
- [ ] Tune Gemini prompts for quality
- [ ] Validate impact scoring accuracy

**Week 3** — Frontend + UX
- [ ] Run frontend, verify Feed page loads
- [ ] Test Chat interface with real data
- [ ] Test Daily Brief generation
- [ ] Mobile responsiveness

**Week 4** — Polish + Git
- [ ] Add GitHub Actions CI
- [ ] Push to GitHub with clean history
- [ ] Set up automated daily brief at 7AM
- [ ] Monitor Gemini API costs

## Cost Optimization
- Gemini Flash = $0.075/1M input tokens (very cheap)
- Content truncated to 4000 chars before sending
- Deduplication prevents re-processing similar stories
- Daily brief cached in DB — generated once per day

## Folder Structure
```
grabber-AI/
├── backend/
│   ├── ai/            # Gemini client, analyzer, briefing
│   ├── api/           # FastAPI routes
│   ├── config/        # Settings, RSS sources
│   ├── db/            # Models, migrations
│   ├── fetch/         # RSS + scraper
│   ├── processing/    # Cleaner, deduplicator
│   ├── scheduler/     # APScheduler jobs
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/     # Feed, Trending, Brief, Chat
│       ├── services/  # API client
│       └── store/     # Zustand state
├── .env.example
├── .gitignore
└── README.md
```
