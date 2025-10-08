from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-time-slots",
    tags=["Template Time Slots"]
)

@router.post("/", response_model=schemas.TemplateTimeSlotResponse)
def create_template_time_slot(
    time_slot: schemas.TemplateTimeSlotCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template time slots")
        
    db_time_slot = models.TemplateTimeSlot(**time_slot.dict())
    db.add(db_time_slot)
    db.commit()
    db.refresh(db_time_slot)
    return db_time_slot

@router.get("/", response_model=List[schemas.TemplateTimeSlotResponse])
def get_template_time_slots(
    skip: int = 0,
    limit: int = 100,
    template_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateTimeSlot).filter(
        models.TemplateTimeSlot.active == True
    )
    
    if template_id:
        query = query.filter(models.TemplateTimeSlot.template_id == template_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{time_slot_id}", response_model=schemas.TemplateTimeSlotResponse)
def get_template_time_slot(
    time_slot_id: int,
    db: Session = Depends(get_db)
):
    time_slot = db.query(models.TemplateTimeSlot).filter(
        models.TemplateTimeSlot.id == time_slot_id,
        models.TemplateTimeSlot.active == True
    ).first()
    
    if not time_slot:
        raise HTTPException(status_code=404, detail="Template time slot not found")
    return time_slot

@router.put("/{time_slot_id}", response_model=schemas.TemplateTimeSlotResponse)
def update_template_time_slot(
    time_slot_id: int,
    time_slot_update: schemas.TemplateTimeSlotUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template time slots")
        
    db_time_slot = db.query(models.TemplateTimeSlot).filter(
        models.TemplateTimeSlot.id == time_slot_id,
        models.TemplateTimeSlot.active == True
    ).first()
    
    if not db_time_slot:
        raise HTTPException(status_code=404, detail="Template time slot not found")
        
    for key, value in time_slot_update.dict(exclude_unset=True).items():
        setattr(db_time_slot, key, value)
    
    db.commit()
    db.refresh(db_time_slot)
    return db_time_slot

@router.delete("/{time_slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_time_slot(
    time_slot_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template time slots")
        
    db_time_slot = db.query(models.TemplateTimeSlot).filter(
        models.TemplateTimeSlot.id == time_slot_id,
        models.TemplateTimeSlot.active == True
    ).first()
    
    if not db_time_slot:
        raise HTTPException(status_code=404, detail="Template time slot not found")
        
    db_time_slot.active = False
    db.commit()
    return None 