from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-week-day-slot-staff-requirement-groups",
    tags=["Template Week Day Slot Staff Requirement Groups"]
)

@router.post("/", response_model=schemas.TemplateWeekDaySlotStaffRequirementGroupResponse)
def create_template_week_day_slot_staff_requirement_group(
    group: schemas.TemplateWeekDaySlotStaffRequirementGroupCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template week day slot staff requirement groups")
        
    db_group = models.TemplateWeekDaySlotStaffRequirementGroup(**group.dict())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@router.get("/", response_model=List[schemas.TemplateWeekDaySlotStaffRequirementGroupResponse])
def get_template_week_day_slot_staff_requirement_groups(
    skip: int = 0,
    limit: int = 100,
    requirement_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateWeekDaySlotStaffRequirementGroup).filter(
        models.TemplateWeekDaySlotStaffRequirementGroup.active == True
    )
    
    if requirement_id:
        query = query.filter(models.TemplateWeekDaySlotStaffRequirementGroup.requirement_id == requirement_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{group_id}", response_model=schemas.TemplateWeekDaySlotStaffRequirementGroupResponse)
def get_template_week_day_slot_staff_requirement_group(
    group_id: int,
    db: Session = Depends(get_db)
):
    group = db.query(models.TemplateWeekDaySlotStaffRequirementGroup).filter(
        models.TemplateWeekDaySlotStaffRequirementGroup.id == group_id,
        models.TemplateWeekDaySlotStaffRequirementGroup.active == True
    ).first()
    
    if not group:
        raise HTTPException(status_code=404, detail="Template week day slot staff requirement group not found")
    return group

@router.put("/{group_id}", response_model=schemas.TemplateWeekDaySlotStaffRequirementGroupResponse)
def update_template_week_day_slot_staff_requirement_group(
    group_id: int,
    group_update: schemas.TemplateWeekDaySlotStaffRequirementGroupUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template week day slot staff requirement groups")
        
    db_group = db.query(models.TemplateWeekDaySlotStaffRequirementGroup).filter(
        models.TemplateWeekDaySlotStaffRequirementGroup.id == group_id,
        models.TemplateWeekDaySlotStaffRequirementGroup.active == True
    ).first()
    
    if not db_group:
        raise HTTPException(status_code=404, detail="Template week day slot staff requirement group not found")
        
    for key, value in group_update.dict(exclude_unset=True).items():
        setattr(db_group, key, value)
    
    db.commit()
    db.refresh(db_group)
    return db_group

@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_week_day_slot_staff_requirement_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template week day slot staff requirement groups")
        
    db_group = db.query(models.TemplateWeekDaySlotStaffRequirementGroup).filter(
        models.TemplateWeekDaySlotStaffRequirementGroup.id == group_id,
        models.TemplateWeekDaySlotStaffRequirementGroup.active == True
    ).first()
    
    if not db_group:
        raise HTTPException(status_code=404, detail="Template week day slot staff requirement group not found")
        
    db_group.active = False
    db.commit()
    return None 