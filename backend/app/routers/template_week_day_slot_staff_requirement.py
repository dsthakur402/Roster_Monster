from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-week-day-slot-staff-requirements",
    tags=["Template Week Day Slot Staff Requirements"]
)

@router.post("/", response_model=schemas.TemplateWeekDaySlotStaffRequirementResponse)
def create_template_week_day_slot_staff_requirement(
    requirement: schemas.TemplateWeekDaySlotStaffRequirementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template week day slot staff requirements")
        
    db_requirement = models.TemplateWeekDaySlotStaffRequirement(**requirement.dict())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@router.get("/", response_model=List[schemas.TemplateWeekDaySlotStaffRequirementResponse])
def get_template_week_day_slot_staff_requirements(
    skip: int = 0,
    limit: int = 100,
    slot_staff_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateWeekDaySlotStaffRequirement).filter(
        models.TemplateWeekDaySlotStaffRequirement.active == True
    )
    
    if slot_staff_id:
        query = query.filter(models.TemplateWeekDaySlotStaffRequirement.slot_staff_id == slot_staff_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{requirement_id}", response_model=schemas.TemplateWeekDaySlotStaffRequirementResponse)
def get_template_week_day_slot_staff_requirement(
    requirement_id: int,
    db: Session = Depends(get_db)
):
    requirement = db.query(models.TemplateWeekDaySlotStaffRequirement).filter(
        models.TemplateWeekDaySlotStaffRequirement.id == requirement_id,
        models.TemplateWeekDaySlotStaffRequirement.active == True
    ).first()
    
    if not requirement:
        raise HTTPException(status_code=404, detail="Template week day slot staff requirement not found")
    return requirement

@router.put("/{requirement_id}", response_model=schemas.TemplateWeekDaySlotStaffRequirementResponse)
def update_template_week_day_slot_staff_requirement(
    requirement_id: int,
    requirement_update: schemas.TemplateWeekDaySlotStaffRequirementUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template week day slot staff requirements")
        
    db_requirement = db.query(models.TemplateWeekDaySlotStaffRequirement).filter(
        models.TemplateWeekDaySlotStaffRequirement.id == requirement_id,
        models.TemplateWeekDaySlotStaffRequirement.active == True
    ).first()
    
    if not db_requirement:
        raise HTTPException(status_code=404, detail="Template week day slot staff requirement not found")
        
    for key, value in requirement_update.dict(exclude_unset=True).items():
        setattr(db_requirement, key, value)
    
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_week_day_slot_staff_requirement(
    requirement_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template week day slot staff requirements")
        
    db_requirement = db.query(models.TemplateWeekDaySlotStaffRequirement).filter(
        models.TemplateWeekDaySlotStaffRequirement.id == requirement_id,
        models.TemplateWeekDaySlotStaffRequirement.active == True
    ).first()
    
    if not db_requirement:
        raise HTTPException(status_code=404, detail="Template week day slot staff requirement not found")
        
    db_requirement.active = False
    db.commit()
    return None 