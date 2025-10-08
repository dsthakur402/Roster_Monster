from sqlalchemy.orm import Session
from app.models.fte import FTEScale, FTEAssignment
from app.schemas.fte import FTEScaleCreate, FTEAssignmentCreate
from typing import List, Optional, Tuple
from datetime import date

def get_fte_scale(db: Session, scale_id: int) -> Optional[FTEScale]:
    return db.query(FTEScale).filter(FTEScale.id == scale_id).first()

def get_fte_scales(db: Session, skip: int = 0, limit: int = 100) -> List[FTEScale]:
    return db.query(FTEScale).offset(skip).limit(limit).all()

def create_fte_scale(db: Session, scale: FTEScaleCreate) -> FTEScale:
    db_scale = FTEScale(**scale.dict())
    db.add(db_scale)
    db.commit()
    db.refresh(db_scale)
    return db_scale

def update_fte_scale(db: Session, scale_id: int, scale: FTEScaleCreate) -> Optional[FTEScale]:
    db_scale = get_fte_scale(db, scale_id)
    if db_scale:
        for key, value in scale.dict(exclude_unset=True).items():
            setattr(db_scale, key, value)
        db.commit()
        db.refresh(db_scale)
    return db_scale

def delete_fte_scale(db: Session, scale_id: int) -> bool:
    db_scale = get_fte_scale(db, scale_id)
    if db_scale:
        db.delete(db_scale)
        db.commit()
        return True
    return False

def get_fte_assignment(db: Session, assignment_id: int) -> Optional[FTEAssignment]:
    return db.query(FTEAssignment).filter(FTEAssignment.id == assignment_id).first()

def get_fte_assignments(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    staff_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> Tuple[List[FTEAssignment], int]:
    query = db.query(FTEAssignment)
    
    if staff_id:
        query = query.filter(FTEAssignment.target_id == staff_id, FTEAssignment.target_type == "staff")
    
    if start_date:
        query = query.filter(FTEAssignment.createDate >= start_date)
    
    if end_date:
        query = query.filter(FTEAssignment.createDate <= end_date)
    
    total = query.count()
    assignments = query.offset(skip).limit(limit).all()
    
    return assignments, total

def create_fte_assignment(db: Session, assignment: FTEAssignmentCreate) -> FTEAssignment:
    db_assignment = FTEAssignment(**assignment.dict())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def update_fte_assignment(
    db: Session,
    assignment_id: int,
    assignment: FTEAssignmentCreate
) -> Optional[FTEAssignment]:
    db_assignment = get_fte_assignment(db, assignment_id)
    if db_assignment:
        for key, value in assignment.dict(exclude_unset=True).items():
            setattr(db_assignment, key, value)
        db.commit()
        db.refresh(db_assignment)
    return db_assignment

def delete_fte_assignment(db: Session, assignment_id: int) -> bool:
    db_assignment = get_fte_assignment(db, assignment_id)
    if db_assignment:
        db.delete(db_assignment)
        db.commit()
        return True
    return False 