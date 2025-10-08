from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from .base import BaseSchema

class RoleBase(BaseSchema):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    createDate: datetime
    updateDate: Optional[datetime] = None

    class Config:
        from_attributes = True

class DepartmentBase(BaseSchema):
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseSchema):
    name: Optional[str] = None
    description: Optional[str] = None

class Department(DepartmentBase):
    id: int
    createDate: datetime
    updateDate: Optional[datetime] = None

    class Config:
        from_attributes = True

class StaffGroupBase(BaseSchema):
    name: str
    description: Optional[str] = None

class StaffGroupCreate(StaffGroupBase):
    pass

class StaffGroup(StaffGroupBase):
    id: int
    createDate: datetime
    updateDate: Optional[datetime] = None

    class Config:
        from_attributes = True

class StaffBase(BaseSchema):
    name: str
    email: EmailStr
    department_id: Optional[int] = None
    group_id: Optional[int] = None
    points_monthly: Optional[int] = 0
    points_total: Optional[int] = 0

class StaffCreate(StaffBase):
    role_ids: Optional[List[int]] = None

class StaffUpdate(BaseSchema):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None
    group_id: Optional[int] = None
    points_monthly: Optional[int] = None
    points_total: Optional[int] = None
    role_ids: Optional[List[int]] = None

class Staff(StaffBase):
    id: int
    createDate: datetime
    updateDate: Optional[datetime] = None
    department: Optional[Department] = None
    group: Optional[StaffGroup] = None
    roles: List[Role] = []

    class Config:
        from_attributes = True 