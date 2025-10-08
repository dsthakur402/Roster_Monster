from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from .base import BaseSchema

class Timing(BaseSchema):
    startTime: str
    endTime: str

class SessionDetail(BaseSchema):
    title: str
    timings: List[Timing]

class Session(BaseSchema):
    type: str
    sessions: List[SessionDetail]

class UserRequirement(BaseSchema):
    userId: str
    count: int

class LocationBase(BaseSchema):
    name: str
    department: str
    type: str
    requiredUsers: List[UserRequirement]
    requiredRoles: List[str]
    requiredGroups: List[str]
    minStaffCount: int
    priority: int
    sessions: List[Session]
    dateOverrides: List[dict]  # Can be refined based on specific requirements

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseSchema):
    name: Optional[str] = None
    department: Optional[str] = None
    type: Optional[str] = None
    requiredUsers: Optional[List[UserRequirement]] = None
    requiredRoles: Optional[List[str]] = None
    requiredGroups: Optional[List[str]] = None
    minStaffCount: Optional[int] = None
    priority: Optional[int] = None
    sessions: Optional[List[Session]] = None
    dateOverrides: Optional[List[dict]] = None

class Location(LocationBase):
    id: int
    createDate: datetime
    updateDate: Optional[datetime] = None 