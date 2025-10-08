from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class LeaveType(str, Enum):
    FORECAST = "forecast"
    NON_URGENT = "non_urgent"
    URGENT = "urgent"

class LocationType(str, Enum):
    CLINICAL = "clinical"
    RESEARCH = "research"
    ADMIN = "admin"

# Base schemas
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class StaffGroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class StaffBase(BaseModel):
    role_id: int
    group_id: Optional[int] = None
    fte_clinical: float = 1.0
    fte_research: float = 0.0
    fte_admin: float = 0.0

class LocationBase(BaseModel):
    name: str
    description: Optional[str] = None
    location_type: LocationType = LocationType.CLINICAL
    priority: int = 0
    priority_group: Optional[str] = None
    min_staff_required: int = 1
    fte_points: float = 0.1
    allows_double_station: bool = False

class LocationTimeSlotBase(BaseModel):
    location_id: int
    start_time: str  # Format: "HH:MM"
    end_time: str    # Format: "HH:MM"
    days_of_week: str  # Comma-separated days: "1,2,3,4,5"

class LocationStaffRequirementBase(BaseModel):
    location_id: int
    role_id: Optional[int] = None
    group_id: Optional[int] = None
    min_staff: int = 1

class LeaveRequestBase(BaseModel):
    staff_id: int
    leave_type: LeaveType
    start_date: datetime
    end_date: datetime

class RosterAssignmentBase(BaseModel):
    staff_id: int
    location_id: int
    time_slot_id: int
    date: datetime
    is_double_stationed: bool = False
    double_station_pair_id: Optional[int] = None
    fte_contribution: float

class FTEConfigurationBase(BaseModel):
    name: str
    description: Optional[str] = None
    shifts_per_week: float
    hours_per_shift: float

# Create schemas
class RoleCreate(RoleBase):
    pass

class StaffGroupCreate(StaffGroupBase):
    pass

class StaffCreate(StaffBase):
    user_id: int

class LocationCreate(LocationBase):
    pass

class LocationTimeSlotCreate(LocationTimeSlotBase):
    pass

class LocationStaffRequirementCreate(LocationStaffRequirementBase):
    pass

class LeaveRequestCreate(LeaveRequestBase):
    pass

class RosterAssignmentCreate(RosterAssignmentBase):
    pass

class FTEConfigurationCreate(FTEConfigurationBase):
    pass

# Update schemas
class RoleUpdate(RoleBase):
    pass

class StaffGroupUpdate(StaffGroupBase):
    pass

class StaffUpdate(BaseModel):
    role_id: Optional[int] = None
    group_id: Optional[int] = None
    fte_clinical: Optional[float] = None
    fte_research: Optional[float] = None
    fte_admin: Optional[float] = None

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location_type: Optional[LocationType] = None
    priority: Optional[int] = None
    priority_group: Optional[str] = None
    min_staff_required: Optional[int] = None
    fte_points: Optional[float] = None
    allows_double_station: Optional[bool] = None

class LocationTimeSlotUpdate(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    days_of_week: Optional[str] = None

class LocationStaffRequirementUpdate(BaseModel):
    role_id: Optional[int] = None
    group_id: Optional[int] = None
    min_staff: Optional[int] = None

class LeaveRequestUpdate(BaseModel):
    leave_type: Optional[LeaveType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None

class RosterAssignmentUpdate(BaseModel):
    is_double_stationed: Optional[bool] = None
    double_station_pair_id: Optional[int] = None
    fte_contribution: Optional[float] = None

class FTEConfigurationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    shifts_per_week: Optional[float] = None
    hours_per_shift: Optional[float] = None

# Response schemas
class RoleResponse(RoleBase):
    id: int
    date_created: datetime
    date_modified: datetime
    active: bool

    class Config:
        from_attributes = True

class StaffGroupResponse(StaffGroupBase):
    id: int
    date_created: datetime
    date_modified: datetime
    active: bool

    class Config:
        from_attributes = True

class StaffResponse(StaffBase):
    id: int
    user_id: int
    date_created: datetime
    date_modified: datetime
    active: bool

    class Config:
        from_attributes = True

class LocationResponse(LocationBase):
    id: int
    date_created: datetime
    date_modified: datetime
    active: bool

    class Config:
        from_attributes = True

class LocationTimeSlotResponse(LocationTimeSlotBase):
    id: int
    date_created: datetime
    date_modified: datetime
    active: bool

    class Config:
        from_attributes = True

class LocationStaffRequirementResponse(LocationStaffRequirementBase):
    id: int
    date_created: datetime
    date_modified: datetime
    active: bool

    class Config:
        from_attributes = True

class LeaveRequestResponse(LeaveRequestBase):
    id: int
    status: str
    date_created: datetime
    date_modified: datetime
    active: bool

    class Config:
        from_attributes = True

class RosterAssignmentResponse(RosterAssignmentBase):
    id: int
    date_created: datetime
    date_modified: datetime
    active: bool

    class Config:
        from_attributes = True

class FTEConfigurationResponse(FTEConfigurationBase):
    id: int
    date_created: datetime
    date_modified: datetime
    active: bool

    class Config:
        from_attributes = True 