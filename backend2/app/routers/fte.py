from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.schemas.fte import (
    FTEScale,
    FTEScaleCreate,
    FTEAssignment,
    FTEAssignmentCreate,
    FTEPagination
)
from app.services.fte_crud import (
    get_fte_scales,
    get_fte_scale,
    create_fte_scale,
    update_fte_scale,
    delete_fte_scale,
    get_fte_assignments,
    get_fte_assignment,
    create_fte_assignment,
    update_fte_assignment,
    delete_fte_assignment
)

router = APIRouter(
    prefix="/api/fte",
    tags=["fte"]
)

# FTE Scale endpoints
@router.get("/scales", response_model=List[FTEScale])
def read_fte_scales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    scales = get_fte_scales(db, skip=skip, limit=limit)
    return scales

@router.post("/scales", response_model=FTEScale)
def create_fte_scale_route(scale: FTEScaleCreate, db: Session = Depends(get_db)):
    return create_fte_scale(db=db, scale=scale)

@router.put("/scales/{scale_id}", response_model=FTEScale)
def update_fte_scale_route(scale_id: int, scale: FTEScaleCreate, db: Session = Depends(get_db)):
    db_scale = update_fte_scale(db=db, scale_id=scale_id, scale=scale)
    if db_scale is None:
        raise HTTPException(status_code=404, detail="FTE scale not found")
    return db_scale

@router.delete("/scales/{scale_id}")
def delete_fte_scale_route(scale_id: int, db: Session = Depends(get_db)):
    success = delete_fte_scale(db=db, scale_id=scale_id)
    if not success:
        raise HTTPException(status_code=404, detail="FTE scale not found")
    return {"message": "FTE scale deleted successfully"}

# FTE Assignment endpoints
@router.get("/assignments", response_model=FTEPagination)
def read_fte_assignments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    staff_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    assignments, total = get_fte_assignments(
        db,
        skip=skip,
        limit=limit,
        staff_id=staff_id,
        start_date=start_date,
        end_date=end_date
    )
    return FTEPagination(
        items=assignments,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.post("/assignments", response_model=FTEAssignment)
def create_fte_assignment_route(assignment: FTEAssignmentCreate, db: Session = Depends(get_db)):
    return create_fte_assignment(db=db, assignment=assignment)

@router.put("/assignments/{assignment_id}", response_model=FTEAssignment)
def update_fte_assignment_route(
    assignment_id: int,
    assignment: FTEAssignmentCreate,
    db: Session = Depends(get_db)
):
    db_assignment = update_fte_assignment(db=db, assignment_id=assignment_id, assignment=assignment)
    if db_assignment is None:
        raise HTTPException(status_code=404, detail="FTE assignment not found")
    return db_assignment

@router.delete("/assignments/{assignment_id}")
def delete_fte_assignment_route(assignment_id: int, db: Session = Depends(get_db)):
    success = delete_fte_assignment(db=db, assignment_id=assignment_id)
    if not success:
        raise HTTPException(status_code=404, detail="FTE assignment not found")
    return {"message": "FTE assignment deleted successfully"} 