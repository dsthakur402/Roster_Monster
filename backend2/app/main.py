from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import (
    user_router, 
    location_router, 
    leave_router, 
    shift_router, 
    schedule_router, 
    auth_router, 
    subscription_router, 
    staff_router,
    fte_router
)
from .config import settings
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Radiology Shift Scheduler")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting Radiology Shift Scheduler API")
    logger.info("📚 API Documentation available at /docs")
    logger.info("🔍 Swagger UI available at /docs")
    logger.info("📝 ReDoc available at /redoc")

# Include routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(location_router)
app.include_router(leave_router)
app.include_router(shift_router)
app.include_router(schedule_router)
app.include_router(subscription_router)
app.include_router(staff_router)
app.include_router(fte_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Radiology Scheduler API"} 