from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.leave import Leave, LeaveCreate, LeaveUpdate
from app.services.leave_crud import (
    get_leave,
    get_leaves,
    create_leave,
    update_leave,
    delete_leave
)

router = APIRouter(
    prefix="/api/leaves",
    tags=["leaves"]
)

@router.get("/", response_model=List[Leave])
def read_leaves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    leaves = get_leaves(db, skip=skip, limit=limit)
    return leaves

@router.get("/{leave_id}", response_model=Leave)
def read_leave(leave_id: int, db: Session = Depends(get_db)):
    db_leave = get_leave(db, leave_id=leave_id)
    if db_leave is None:
        raise HTTPException(status_code=404, detail="Leave not found")
    return db_leave

@router.post("/", response_model=Leave)
def create_leave_route(leave: LeaveCreate, db: Session = Depends(get_db)):
    return create_leave(db=db, leave=leave)

@router.put("/{leave_id}", response_model=Leave)
def update_leave_route(leave_id: int, leave: LeaveUpdate, db: Session = Depends(get_db)):
    db_leave = update_leave(db=db, leave_id=leave_id, leave=leave)
    if db_leave is None:
        raise HTTPException(status_code=404, detail="Leave not found")
    return db_leave

@router.delete("/{leave_id}")
def delete_leave_route(leave_id: int, db: Session = Depends(get_db)):
    success = delete_leave(db=db, leave_id=leave_id)
    if not success:
        raise HTTPException(status_code=404, detail="Leave not found")
    return {"message": "Leave deleted successfully"} 