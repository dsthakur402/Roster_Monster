from pydantic import BaseModel
from .base import BaseSchema
from .user import User, UserCreate, UserBase, UserType, UserLogin
from .location import Location, LocationCreate, LocationBase
from .leave import Leave, LeaveCreate, LeaveBase
from .shift import Shift, ShiftCreate, ShiftBase, ScheduleRequest
from .staff import (
    Staff, StaffCreate, StaffUpdate, StaffBase,
    Role, RoleCreate, RoleBase,
    Department, DepartmentCreate, DepartmentUpdate, DepartmentBase,
    StaffGroup, StaffGroupCreate, StaffGroupBase
)
from typing import Optional, List

__all__ = [
    "BaseSchema",
    "User", "UserCreate", "UserBase", "UserType", "UserLogin", 
    "Location", "LocationCreate", "LocationBase",
    "Leave", "LeaveCreate", "LeaveBase",
    "Shift", "ShiftCreate", "ShiftBase", "ScheduleRequest",
    "Staff", "StaffCreate", "StaffUpdate", "StaffBase",
    "Role", "RoleCreate", "RoleBase",
    "Department", "DepartmentCreate", "DepartmentUpdate", "DepartmentBase",
    "StaffGroup", "StaffGroupCreate", "StaffGroupBase"
]

class StaffGroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    members: Optional[List[int]] = None
    roles: Optional[List[int]] = None
    locations: Optional[List[int]] = None

    class Config:
        from_attributes = True 