from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-week-day-slot-staff-requirement-group-staff",
    tags=["Template Week Day Slot Staff Requirement Group Staff"]
)

@router.post("/", response_model=schemas.TemplateWeekDaySlotStaffRequirementGroupStaffResponse)
def create_template_week_day_slot_staff_requirement_group_staff(
    group_staff: schemas.TemplateWeekDaySlotStaffRequirementGroupStaffCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template week day slot staff requirement group staff")
        
    db_group_staff = models.TemplateWeekDaySlotStaffRequirementGroupStaff(**group_staff.dict())
    db.add(db_group_staff)
    db.commit()
    db.refresh(db_group_staff)
    return db_group_staff

@router.get("/", response_model=List[schemas.TemplateWeekDaySlotStaffRequirementGroupStaffResponse])
def get_template_week_day_slot_staff_requirement_group_staff(
    skip: int = 0,
    limit: int = 100,
    group_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateWeekDaySlotStaffRequirementGroupStaff).filter(
        models.TemplateWeekDaySlotStaffRequirementGroupStaff.active == True
    )
    
    if group_id:
        query = query.filter(models.TemplateWeekDaySlotStaffRequirementGroupStaff.group_id == group_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{group_staff_id}", response_model=schemas.TemplateWeekDaySlotStaffRequirementGroupStaffResponse)
def get_template_week_day_slot_staff_requirement_group_staff_member(
    group_staff_id: int,
    db: Session = Depends(get_db)
):
    group_staff = db.query(models.TemplateWeekDaySlotStaffRequirementGroupStaff).filter(
        models.TemplateWeekDaySlotStaffRequirementGroupStaff.id == group_staff_id,
        models.TemplateWeekDaySlotStaffRequirementGroupStaff.active == True
    ).first()
    
    if not group_staff:
        raise HTTPException(status_code=404, detail="Template week day slot staff requirement group staff member not found")
    return group_staff

@router.put("/{group_staff_id}", response_model=schemas.TemplateWeekDaySlotStaffRequirementGroupStaffResponse)
def update_template_week_day_slot_staff_requirement_group_staff(
    group_staff_id: int,
    group_staff_update: schemas.TemplateWeekDaySlotStaffRequirementGroupStaffUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template week day slot staff requirement group staff")
        
    db_group_staff = db.query(models.TemplateWeekDaySlotStaffRequirementGroupStaff).filter(
        models.TemplateWeekDaySlotStaffRequirementGroupStaff.id == group_staff_id,
        models.TemplateWeekDaySlotStaffRequirementGroupStaff.active == True
    ).first()
    
    if not db_group_staff:
        raise HTTPException(status_code=404, detail="Template week day slot staff requirement group staff member not found")
        
    for key, value in group_staff_update.dict(exclude_unset=True).items():
        setattr(db_group_staff, key, value)
    
    db.commit()
    db.refresh(db_group_staff)
    return db_group_staff

@router.delete("/{group_staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_week_day_slot_staff_requirement_group_staff(
    group_staff_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template week day slot staff requirement group staff")
        
    db_group_staff = db.query(models.TemplateWeekDaySlotStaffRequirementGroupStaff).filter(
        models.TemplateWeekDaySlotStaffRequirementGroupStaff.id == group_staff_id,
        models.TemplateWeekDaySlotStaffRequirementGroupStaff.active == True
    ).first()
    
    if not db_group_staff:
        raise HTTPException(status_code=404, detail="Template week day slot staff requirement group staff member not found")
        
    db_group_staff.active = False
    db.commit()
    return None 