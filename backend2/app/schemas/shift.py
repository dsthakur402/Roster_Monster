from datetime import datetime
from typing import List, Optional
from .base import BaseSchema
from .user import UserCreate

class ShiftBase(BaseSchema):
    startTime: datetime
    endTime: datetime
    location: int
    specializationRequired: str

class ShiftCreate(ShiftBase):
    pass

class ShiftUpdate(ShiftBase):
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
    location: Optional[int] = None
    specializationRequired: Optional[str] = None

class Shift(ShiftBase):
    id: int

class ScheduleRequest(BaseSchema):
    users: List[UserCreate]
    shifts: List[ShiftCreate] 