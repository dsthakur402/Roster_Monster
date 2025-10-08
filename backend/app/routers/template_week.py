from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-weeks",
    tags=["Template Weeks"]
)

@router.post("/", response_model=schemas.TemplateWeekResponse)
def create_template_week(
    week: schemas.TemplateWeekCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template weeks")
        
    db_week = models.TemplateWeek(**week.dict())
    db.add(db_week)
    db.commit()
    db.refresh(db_week)
    return db_week

@router.get("/", response_model=List[schemas.TemplateWeekResponse])
def get_template_weeks(
    skip: int = 0,
    limit: int = 100,
    template_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateWeek).filter(
        models.TemplateWeek.active == True
    )
    
    if template_id:
        query = query.filter(models.TemplateWeek.template_id == template_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{week_id}", response_model=schemas.TemplateWeekResponse)
def get_template_week(
    week_id: int,
    db: Session = Depends(get_db)
):
    week = db.query(models.TemplateWeek).filter(
        models.TemplateWeek.id == week_id,
        models.TemplateWeek.active == True
    ).first()
    
    if not week:
        raise HTTPException(status_code=404, detail="Template week not found")
    return week

@router.put("/{week_id}", response_model=schemas.TemplateWeekResponse)
def update_template_week(
    week_id: int,
    week_update: schemas.TemplateWeekUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template weeks")
        
    db_week = db.query(models.TemplateWeek).filter(
        models.TemplateWeek.id == week_id,
        models.TemplateWeek.active == True
    ).first()
    
    if not db_week:
        raise HTTPException(status_code=404, detail="Template week not found")
        
    for key, value in week_update.dict(exclude_unset=True).items():
        setattr(db_week, key, value)
    
    db.commit()
    db.refresh(db_week)
    return db_week

@router.delete("/{week_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_week(
    week_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template weeks")
        
    db_week = db.query(models.TemplateWeek).filter(
        models.TemplateWeek.id == week_id,
        models.TemplateWeek.active == True
    ).first()
    
    if not db_week:
        raise HTTPException(status_code=404, detail="Template week not found")
        
    db_week.active = False
    db.commit()
    return None 