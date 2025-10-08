from datetime import datetime
from typing import Optional
from .base import BaseSchema

class LeaveBase(BaseSchema):
    radiologistID: int
    startTime: datetime
    endTime: datetime
    remarks: Optional[str] = None
    approvedStatus: bool = False
    approvedBy: Optional[int] = None

class LeaveCreate(LeaveBase):
    pass

class LeaveUpdate(LeaveBase):
    radiologistID: Optional[int] = None
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
    remarks: Optional[str] = None
    approvedStatus: Optional[bool] = None
    approvedBy: Optional[int] = None

class Leave(LeaveBase):
    id: int
    updateDate: Optional[datetime] = None 