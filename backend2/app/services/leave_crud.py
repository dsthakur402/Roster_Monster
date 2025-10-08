from sqlalchemy.orm import Session
from app.models.leave import Leave
from app.schemas.leave import LeaveCreate, LeaveUpdate
from typing import List, Optional

def get_leave(db: Session, leave_id: int) -> Optional[Leave]:
    return db.query(Leave).filter(Leave.id == leave_id).first()

def get_leaves(db: Session, skip: int = 0, limit: int = 100) -> List[Leave]:
    return db.query(Leave).offset(skip).limit(limit).all()

def create_leave(db: Session, leave: LeaveCreate) -> Leave:
    db_leave = Leave(**leave.dict())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

def update_leave(db: Session, leave_id: int, leave: LeaveUpdate) -> Optional[Leave]:
    db_leave = get_leave(db, leave_id)
    if db_leave:
        for key, value in leave.dict(exclude_unset=True).items():
            setattr(db_leave, key, value)
        db.commit()
        db.refresh(db_leave)
    return db_leave

def delete_leave(db: Session, leave_id: int) -> bool:
    db_leave = get_leave(db, leave_id)
    if db_leave:
        db.delete(db_leave)
        db.commit()
        return True
    return False 