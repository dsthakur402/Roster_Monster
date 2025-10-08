from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-requirements",
    tags=["Template Requirements"]
)

@router.post("/", response_model=schemas.TemplateRequirementResponse)
def create_template_requirement(
    requirement: schemas.TemplateRequirementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template requirements")
        
    db_requirement = models.TemplateRequirement(**requirement.dict())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@router.get("/", response_model=List[schemas.TemplateRequirementResponse])
def get_template_requirements(
    skip: int = 0,
    limit: int = 100,
    template_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateRequirement).filter(
        models.TemplateRequirement.active == True
    )
    
    if template_id:
        query = query.filter(models.TemplateRequirement.template_id == template_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{requirement_id}", response_model=schemas.TemplateRequirementResponse)
def get_template_requirement(
    requirement_id: int,
    db: Session = Depends(get_db)
):
    requirement = db.query(models.TemplateRequirement).filter(
        models.TemplateRequirement.id == requirement_id,
        models.TemplateRequirement.active == True
    ).first()
    
    if not requirement:
        raise HTTPException(status_code=404, detail="Template requirement not found")
    return requirement

@router.put("/{requirement_id}", response_model=schemas.TemplateRequirementResponse)
def update_template_requirement(
    requirement_id: int,
    requirement_update: schemas.TemplateRequirementUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template requirements")
        
    db_requirement = db.query(models.TemplateRequirement).filter(
        models.TemplateRequirement.id == requirement_id,
        models.TemplateRequirement.active == True
    ).first()
    
    if not db_requirement:
        raise HTTPException(status_code=404, detail="Template requirement not found")
        
    for key, value in requirement_update.dict(exclude_unset=True).items():
        setattr(db_requirement, key, value)
    
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_requirement(
    requirement_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template requirements")
        
    db_requirement = db.query(models.TemplateRequirement).filter(
        models.TemplateRequirement.id == requirement_id,
        models.TemplateRequirement.active == True
    ).first()
    
    if not db_requirement:
        raise HTTPException(status_code=404, detail="Template requirement not found")
        
    db_requirement.active = False
    db.commit()
    return None 