from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from app.models.base import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.EMPLOYEE

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

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
    user: User

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None 
class ShiftUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    break_duration: Optional[int] = None
    overtime_hours: Optional[int] = None

class Shift(ShiftBase):
    id: int
    user_id: int
    user: User

    class Config:
        from_attributes = True

# Leave Request schemas
class LeaveRequestBase(BaseModel):
    start_date: datetime
    end_date: datetime
    leave_type: str
    notes: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    user_id: int

class LeaveRequestUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class LeaveRequest(LeaveRequestBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    user: User

    class Config:
        from_attributes = True

# Availability schemas
class AvailabilityBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: str = Field(..., pattern=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    end_time: str = Field(..., pattern=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    is_available: bool = True
    notes: Optional[str] = None

class AvailabilityCreate(AvailabilityBase):
    user_id: int

class AvailabilityUpdate(BaseModel):
    start_time: Optional[str] = Field(None, pattern=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    end_time: Optional[str] = Field(None, pattern=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    is_available: Optional[bool] = None
    notes: Optional[str] = None

class Availability(AvailabilityBase):
    id: int
    user_id: int
    user: User

    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Response schemas
class PaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    pages: int
    items: List[dict]