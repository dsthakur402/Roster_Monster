from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-week-day-slot-staff",
    tags=["Template Week Day Slot Staff"]
)

@router.post("/", response_model=schemas.TemplateWeekDaySlotStaffResponse)
def create_template_week_day_slot_staff(
    slot_staff: schemas.TemplateWeekDaySlotStaffCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template week day slot staff")
        
    db_slot_staff = models.TemplateWeekDaySlotStaff(**slot_staff.dict())
    db.add(db_slot_staff)
    db.commit()
    db.refresh(db_slot_staff)
    return db_slot_staff

@router.get("/", response_model=List[schemas.TemplateWeekDaySlotStaffResponse])
def get_template_week_day_slot_staff(
    skip: int = 0,
    limit: int = 100,
    day_slot_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateWeekDaySlotStaff).filter(
        models.TemplateWeekDaySlotStaff.active == True
    )
    
    if day_slot_id:
        query = query.filter(models.TemplateWeekDaySlotStaff.day_slot_id == day_slot_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{slot_staff_id}", response_model=schemas.TemplateWeekDaySlotStaffResponse)
def get_template_week_day_slot_staff_member(
    slot_staff_id: int,
    db: Session = Depends(get_db)
):
    slot_staff = db.query(models.TemplateWeekDaySlotStaff).filter(
        models.TemplateWeekDaySlotStaff.id == slot_staff_id,
        models.TemplateWeekDaySlotStaff.active == True
    ).first()
    
    if not slot_staff:
        raise HTTPException(status_code=404, detail="Template week day slot staff member not found")
    return slot_staff

@router.put("/{slot_staff_id}", response_model=schemas.TemplateWeekDaySlotStaffResponse)
def update_template_week_day_slot_staff(
    slot_staff_id: int,
    slot_staff_update: schemas.TemplateWeekDaySlotStaffUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template week day slot staff")
        
    db_slot_staff = db.query(models.TemplateWeekDaySlotStaff).filter(
        models.TemplateWeekDaySlotStaff.id == slot_staff_id,
        models.TemplateWeekDaySlotStaff.active == True
    ).first()
    
    if not db_slot_staff:
        raise HTTPException(status_code=404, detail="Template week day slot staff member not found")
        
    for key, value in slot_staff_update.dict(exclude_unset=True).items():
        setattr(db_slot_staff, key, value)
    
    db.commit()
    db.refresh(db_slot_staff)
    return db_slot_staff

@router.delete("/{slot_staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_week_day_slot_staff(
    slot_staff_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template week day slot staff")
        
    db_slot_staff = db.query(models.TemplateWeekDaySlotStaff).filter(
        models.TemplateWeekDaySlotStaff.id == slot_staff_id,
        models.TemplateWeekDaySlotStaff.active == True
    ).first()
    
    if not db_slot_staff:
        raise HTTPException(status_code=404, detail="Template week day slot staff member not found")
        
    db_slot_staff.active = False
    db.commit()
    return None 