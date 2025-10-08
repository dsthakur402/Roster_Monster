from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional, List
from .models import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = ""
    role: UserRole = UserRole.EMPLOYEE

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True

class ShiftBase(BaseModel):
    start_time: datetime
    end_time: datetime
    status: str
    notes: Optional[str] = None

class ShiftCreate(ShiftBase):
    user_id: int

class Shift(ShiftBase):
    id: int
    user_id: int
    user: Optional[User] = None

    class Config:
        from_attributes = True

class LeaveRequestBase(BaseModel):
    start_date: date
    end_date: date
    type: str  # sick, vacation, personal, etc.
    notes: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    user_id: int

class LeaveRequest(LeaveRequestBase):
    id: int
    user_id: int
    status: str  # pending, approved, rejected
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AvailabilityBase(BaseModel):
    day_of_week: int  # 0-6 (Monday-Sunday)
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    is_available: bool

class AvailabilityCreate(AvailabilityBase):
    user_id: int

class Availability(AvailabilityBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
