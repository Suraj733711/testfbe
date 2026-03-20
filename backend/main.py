from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base
from routers import tasks, chat
from logger import logger

# Create tables
logger.info("Ensuring database tables exist.")
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TestProject Task Board API",
    description="A modular FastAPI backend with Gemini AI capabilities",
    version="3.0.0",
)

origins = [
    "http://localhost:5173",      
    "http://localhost:3000",      
    "https://testfbe.onrender.com",
    "https://testfbe.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root/health routes
@app.get("/")
def root():
    logger.debug("Root endpoint accessed.")
    return {
        "message": "Welcome to the Task Board API 🚀",
        "database": "PostgreSQL" if "postgresql" in engine.url.drivername else "SQLite",
        "endpoints": ["/api/tasks", "/api/chat", "/api/health"]
    }

@app.get("/api/health")
def health_check():
    logger.debug("Health check pinged.")
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Include routers
logger.info("Mounting API routers...")
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])
logger.info("Application startup sequence complete.")
