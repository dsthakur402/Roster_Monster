from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .api.v1.api import api_router

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Roster Monster API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root test endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to Roster Monster API"}

# Direct test endpoint without using the router
@app.post("/test-signup")
def test_signup(email: str = Body(...), password: str = Body(...)):
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
