 
from fastapi import APIRouter
from app.api.v1.endpoints import auth, shifts, leave_requests, availability

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(shifts.router, prefix="/shifts", tags=["shifts"])
api_router.include_router(leave_requests.router, prefix="/leave-requests", tags=["leave-requests"])
api_router.include_router(availability.router, prefix="/availability", tags=["availability"])
