from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-week-days",
    tags=["Template Week Days"]
)

@router.post("/", response_model=schemas.TemplateWeekDayResponse)
def create_template_week_day(
    week_day: schemas.TemplateWeekDayCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template week days")
        
    db_week_day = models.TemplateWeekDay(**week_day.dict())
    db.add(db_week_day)
    db.commit()
    db.refresh(db_week_day)
    return db_week_day

@router.get("/", response_model=List[schemas.TemplateWeekDayResponse])
def get_template_week_days(
    skip: int = 0,
    limit: int = 100,
    week_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateWeekDay).filter(
        models.TemplateWeekDay.active == True
    )
    
    if week_id:
        query = query.filter(models.TemplateWeekDay.week_id == week_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{week_day_id}", response_model=schemas.TemplateWeekDayResponse)
def get_template_week_day(
    week_day_id: int,
    db: Session = Depends(get_db)
):
    week_day = db.query(models.TemplateWeekDay).filter(
        models.TemplateWeekDay.id == week_day_id,
        models.TemplateWeekDay.active == True
    ).first()
    
    if not week_day:
        raise HTTPException(status_code=404, detail="Template week day not found")
    return week_day

@router.put("/{week_day_id}", response_model=schemas.TemplateWeekDayResponse)
def update_template_week_day(
    week_day_id: int,
    week_day_update: schemas.TemplateWeekDayUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template week days")
        
    db_week_day = db.query(models.TemplateWeekDay).filter(
        models.TemplateWeekDay.id == week_day_id,
        models.TemplateWeekDay.active == True
    ).first()
    
    if not db_week_day:
        raise HTTPException(status_code=404, detail="Template week day not found")
        
    for key, value in week_day_update.dict(exclude_unset=True).items():
        setattr(db_week_day, key, value)
    
    db.commit()
    db.refresh(db_week_day)
    return db_week_day

@router.delete("/{week_day_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_week_day(
    week_day_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template week days")
        
    db_week_day = db.query(models.TemplateWeekDay).filter(
        models.TemplateWeekDay.id == week_day_id,
        models.TemplateWeekDay.active == True
    ).first()
    
    if not db_week_day:
        raise HTTPException(status_code=404, detail="Template week day not found")
        
    db_week_day.active = False
    db.commit()
    return None 