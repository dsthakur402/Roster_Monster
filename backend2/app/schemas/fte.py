from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class FTEScaleBase(BaseModel):
    name: str
    value: float
    description: Optional[str] = None

class FTEScaleCreate(FTEScaleBase):
    pass

class FTEScale(FTEScaleBase):
    id: int

    class Config:
        from_attributes = True

class FTEAssignmentBase(BaseModel):
    staff_id: int
    scale_id: int
    start_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = None

class FTEAssignmentCreate(FTEAssignmentBase):
    pass

class FTEAssignment(FTEAssignmentBase):
    id: int
    created_at: date
    updated_at: date

    class Config:
        from_attributes = True

class FTEPagination(BaseModel):
    items: List[FTEAssignment]
    total: int
    page: int
    size: int
    pages: int 