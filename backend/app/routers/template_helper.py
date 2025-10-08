from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-helpers",
    tags=["Template Helpers"]
)

@router.post("/", response_model=schemas.TemplateHelperResponse)
def create_template_helper(
    helper: schemas.TemplateHelperCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template helpers")
        
    db_helper = models.TemplateHelper(**helper.dict())
    db.add(db_helper)
    db.commit()
    db.refresh(db_helper)
    return db_helper

@router.get("/", response_model=List[schemas.TemplateHelperResponse])
def get_template_helpers(
    skip: int = 0,
    limit: int = 100,
    template_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateHelper).filter(
        models.TemplateHelper.active == True
    )
    
    if template_id:
        query = query.filter(models.TemplateHelper.template_id == template_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{helper_id}", response_model=schemas.TemplateHelperResponse)
def get_template_helper(
    helper_id: int,
    db: Session = Depends(get_db)
):
    helper = db.query(models.TemplateHelper).filter(
        models.TemplateHelper.id == helper_id,
        models.TemplateHelper.active == True
    ).first()
    
    if not helper:
        raise HTTPException(status_code=404, detail="Template helper not found")
    return helper

@router.put("/{helper_id}", response_model=schemas.TemplateHelperResponse)
def update_template_helper(
    helper_id: int,
    helper_update: schemas.TemplateHelperUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template helpers")
        
    db_helper = db.query(models.TemplateHelper).filter(
        models.TemplateHelper.id == helper_id,
        models.TemplateHelper.active == True
    ).first()
    
    if not db_helper:
        raise HTTPException(status_code=404, detail="Template helper not found")
        
    for key, value in helper_update.dict(exclude_unset=True).items():
        setattr(db_helper, key, value)
    
    db.commit()
    db.refresh(db_helper)
    return db_helper

@router.delete("/{helper_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_helper(
    helper_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template helpers")
        
    db_helper = db.query(models.TemplateHelper).filter(
        models.TemplateHelper.id == helper_id,
        models.TemplateHelper.active == True
    ).first()
    
    if not db_helper:
        raise HTTPException(status_code=404, detail="Template helper not found")
        
    db_helper.active = False
    db.commit()
    return None 