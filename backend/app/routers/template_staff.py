from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-staff",
    tags=["Template Staff"]
)

@router.post("/", response_model=schemas.TemplateStaffResponse)
def create_template_staff(
    staff: schemas.TemplateStaffCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template staff")
        
    db_staff = models.TemplateStaff(**staff.dict())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.get("/", response_model=List[schemas.TemplateStaffResponse])
def get_template_staff(
    skip: int = 0,
    limit: int = 100,
    template_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateStaff).filter(
        models.TemplateStaff.active == True
    )
    
    if template_id:
        query = query.filter(models.TemplateStaff.template_id == template_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{staff_id}", response_model=schemas.TemplateStaffResponse)
def get_template_staff_member(
    staff_id: int,
    db: Session = Depends(get_db)
):
    staff = db.query(models.TemplateStaff).filter(
        models.TemplateStaff.id == staff_id,
        models.TemplateStaff.active == True
    ).first()
    
    if not staff:
        raise HTTPException(status_code=404, detail="Template staff member not found")
    return staff

@router.put("/{staff_id}", response_model=schemas.TemplateStaffResponse)
def update_template_staff(
    staff_id: int,
    staff_update: schemas.TemplateStaffUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template staff")
        
    db_staff = db.query(models.TemplateStaff).filter(
        models.TemplateStaff.id == staff_id,
        models.TemplateStaff.active == True
    ).first()
    
    if not db_staff:
        raise HTTPException(status_code=404, detail="Template staff member not found")
        
    for key, value in staff_update.dict(exclude_unset=True).items():
        setattr(db_staff, key, value)
    
    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template staff")
        
    db_staff = db.query(models.TemplateStaff).filter(
        models.TemplateStaff.id == staff_id,
        models.TemplateStaff.active == True
    ).first()
    
    if not db_staff:
        raise HTTPException(status_code=404, detail="Template staff member not found")
        
    db_staff.active = False
    db.commit()
    return None 