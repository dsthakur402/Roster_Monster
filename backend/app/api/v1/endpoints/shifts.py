from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, auth
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Shift)
def create_shift(
    shift: schemas.ShiftCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_shift = models.Shift(**shift.dict())
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift

@router.get("/", response_model=List[schemas.Shift])
def read_shifts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    shifts = db.query(models.Shift).offset(skip).limit(limit).all()
    return shifts

@router.get("/{shift_id}", response_model=schemas.Shift)
def read_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    shift = db.query(models.Shift).filter(models.Shift.id == shift_id).first()
    if shift is None:
        raise HTTPException(status_code=404, detail="Shift not found")
    return shift
