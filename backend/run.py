import uvicorn
from scheduler.jobs import start_scheduler

if __name__ == "__main__":
    start_scheduler()
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
