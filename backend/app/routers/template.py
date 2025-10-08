from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/templates",
    tags=["Templates"]
)

@router.post("/", response_model=schemas.TemplateListItems)
def create_template(
    template: schemas.TemplateCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create templates")
        
    db_template = models.Template(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.get("/", response_model=List[schemas.TemplateListItems])
def get_templates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    templates = db.query(models.Template).filter(
        models.Template.active == True
    ).offset(skip).limit(limit).all()
    return templates

@router.get("/{template_id}", response_model=schemas.TemplateListItems)
def get_template(
    template_id: int,
    db: Session = Depends(get_db)
):
    template = db.query(models.Template).filter(
        models.Template.id == template_id,
        models.Template.active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.put("/{template_id}", response_model=schemas.TemplateListItems)
def update_template(
    template_id: int,
    template_update: schemas.TemplateCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update templates")
        
    db_template = db.query(models.Template).filter(
        models.Template.id == template_id,
        models.Template.active == True
    ).first()
    
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    for key, value in template_update.dict().items():
        setattr(db_template, key, value)
    
    db.commit()
    db.refresh(db_template)
    return db_template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete templates")
        
    db_template = db.query(models.Template).filter(
        models.Template.id == template_id,
        models.Template.active == True
    ).first()
    
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    db_template.active = False
    db.commit()
    return None 