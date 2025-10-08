from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from . import models
from .database import engine
from .api.v1.api import api_router
from .config.config import settings

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="A comprehensive workforce management and scheduling platform for healthcare institutions",
    debug=settings.debug
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"] if settings.debug else ["localhost", "127.0.0.1"]
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=settings.allowed_methods,
    allow_headers=settings.allowed_headers,
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": settings.version,
        "app_name": settings.app_name
    }

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Roster Monster API",
        "version": settings.version,
        "docs": "/docs",
        "health": "/health"
    }

# Direct test endpoint without using the router
@app.post("/test-signup")
def test_signup(email: str = Body(...), password: str = Body(...)):
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    return {
        "message": "Test signup endpoint works!",
        "email": email,
        "password_length": len(password)
    }

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Print all routes for debugging
@app.on_event("startup")
async def startup_event():
    print("\nAll registered routes:")
    for route in app.routes:
        print(f"{route.path} - {route.methods}")
