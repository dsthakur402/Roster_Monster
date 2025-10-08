from sqlalchemy.orm import Session
from app.models.shift import Shift
from app.schemas.shift import ShiftCreate, ShiftUpdate
from typing import List, Optional

def get_shift(db: Session, shift_id: int) -> Optional[Shift]:
    return db.query(Shift).filter(Shift.id == shift_id).first()

def get_shifts(db: Session, skip: int = 0, limit: int = 100) -> List[Shift]:
    return db.query(Shift).offset(skip).limit(limit).all()

def create_shift(db: Session, shift: ShiftCreate) -> Shift:
    db_shift = Shift(**shift.dict())
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift

def update_shift(db: Session, shift_id: int, shift: ShiftUpdate) -> Optional[Shift]:
    db_shift = get_shift(db, shift_id)
    if db_shift:
        for key, value in shift.dict(exclude_unset=True).items():
            setattr(db_shift, key, value)
        db.commit()
        db.refresh(db_shift)
    return db_shift

def delete_shift(db: Session, shift_id: int) -> bool:
    db_shift = get_shift(db, shift_id)
    if db_shift:
        db.delete(db_shift)
        db.commit()
        return True
    return False 