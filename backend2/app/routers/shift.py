from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.shift import Shift, ShiftCreate, ShiftUpdate
from app.services.shift_crud import (
    get_shift,
    get_shifts,
    create_shift,
    update_shift,
    delete_shift
)

router = APIRouter(
    prefix="/api/shifts",
    tags=["shifts"]
)

@router.get("/", response_model=List[Shift])
def read_shifts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    shifts = get_shifts(db, skip=skip, limit=limit)
    return shifts

@router.get("/{shift_id}", response_model=Shift)
def read_shift(shift_id: int, db: Session = Depends(get_db)):
    db_shift = get_shift(db, shift_id=shift_id)
    if db_shift is None:
        raise HTTPException(status_code=404, detail="Shift not found")
    return db_shift

@router.post("/", response_model=Shift)
def create_shift_route(shift: ShiftCreate, db: Session = Depends(get_db)):
    return create_shift(db=db, shift=shift)

@router.put("/{shift_id}", response_model=Shift)
def update_shift_route(shift_id: int, shift: ShiftUpdate, db: Session = Depends(get_db)):
    db_shift = update_shift(db=db, shift_id=shift_id, shift=shift)
    if db_shift is None:
        raise HTTPException(status_code=404, detail="Shift not found")
    return db_shift

@router.delete("/{shift_id}")
def delete_shift_route(shift_id: int, db: Session = Depends(get_db)):
    success = delete_shift(db=db, shift_id=shift_id)
    if not success:
        raise HTTPException(status_code=404, detail="Shift not found")
    return {"message": "Shift deleted successfully"} 