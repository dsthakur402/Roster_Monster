from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.shift import ScheduleRequest
from app.services.user_crud import create_user
from app.services.shift_crud import create_shift

router = APIRouter(
    prefix="/api/schedule",
    tags=["schedule"]
)

@router.post("/")
def create_schedule(schedule: ScheduleRequest, db: Session = Depends(get_db)):
    # Create users
    for user in schedule.users:
        create_user(db=db, user=user)
    
    # Create shifts
    for shift in schedule.shifts:
        create_shift(db=db, shift=shift)
    
    return {"message": "Schedule created successfully"} 