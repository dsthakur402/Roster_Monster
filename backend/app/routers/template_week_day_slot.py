from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-week-day-slots",
    tags=["Template Week Day Slots"]
)

@router.post("/", response_model=schemas.TemplateWeekDaySlotResponse)
def create_template_week_day_slot(
    day_slot: schemas.TemplateWeekDaySlotCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template week day slots")
        
    db_day_slot = models.TemplateWeekDaySlot(**day_slot.dict())
    db.add(db_day_slot)
    db.commit()
    db.refresh(db_day_slot)
    return db_day_slot

@router.get("/", response_model=List[schemas.TemplateWeekDaySlotResponse])
def get_template_week_day_slots(
    skip: int = 0,
    limit: int = 100,
    week_day_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateWeekDaySlot).filter(
        models.TemplateWeekDaySlot.active == True
    )
    
    if week_day_id:
        query = query.filter(models.TemplateWeekDaySlot.week_day_id == week_day_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{day_slot_id}", response_model=schemas.TemplateWeekDaySlotResponse)
def get_template_week_day_slot(
    day_slot_id: int,
    db: Session = Depends(get_db)
):
    day_slot = db.query(models.TemplateWeekDaySlot).filter(
        models.TemplateWeekDaySlot.id == day_slot_id,
        models.TemplateWeekDaySlot.active == True
    ).first()
    
    if not day_slot:
        raise HTTPException(status_code=404, detail="Template week day slot not found")
    return day_slot

@router.put("/{day_slot_id}", response_model=schemas.TemplateWeekDaySlotResponse)
def update_template_week_day_slot(
    day_slot_id: int,
    day_slot_update: schemas.TemplateWeekDaySlotUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template week day slots")
        
    db_day_slot = db.query(models.TemplateWeekDaySlot).filter(
        models.TemplateWeekDaySlot.id == day_slot_id,
        models.TemplateWeekDaySlot.active == True
    ).first()
    
    if not db_day_slot:
        raise HTTPException(status_code=404, detail="Template week day slot not found")
        
    for key, value in day_slot_update.dict(exclude_unset=True).items():
        setattr(db_day_slot, key, value)
    
    db.commit()
    db.refresh(db_day_slot)
    return db_day_slot

@router.delete("/{day_slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_week_day_slot(
    day_slot_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template week day slots")
        
    db_day_slot = db.query(models.TemplateWeekDaySlot).filter(
        models.TemplateWeekDaySlot.id == day_slot_id,
        models.TemplateWeekDaySlot.active == True
    ).first()
    
    if not db_day_slot:
        raise HTTPException(status_code=404, detail="Template week day slot not found")
        
    db_day_slot.active = False
    db.commit()
    return None 