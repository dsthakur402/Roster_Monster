from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/template-slots",
    tags=["Template Slots"]
)

@router.post("/", response_model=schemas.TemplateSlotResponse)
def create_template_slot(
    slot: schemas.TemplateSlotCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create template slots")
        
    db_slot = models.TemplateSlot(**slot.dict())
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot

@router.get("/", response_model=List[schemas.TemplateSlotResponse])
def get_template_slots(
    skip: int = 0,
    limit: int = 100,
    template_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.TemplateSlot).filter(
        models.TemplateSlot.active == True
    )
    
    if template_id:
        query = query.filter(models.TemplateSlot.template_id == template_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{slot_id}", response_model=schemas.TemplateSlotResponse)
def get_template_slot(
    slot_id: int,
    db: Session = Depends(get_db)
):
    slot = db.query(models.TemplateSlot).filter(
        models.TemplateSlot.id == slot_id,
        models.TemplateSlot.active == True
    ).first()
    
    if not slot:
        raise HTTPException(status_code=404, detail="Template slot not found")
    return slot

@router.put("/{slot_id}", response_model=schemas.TemplateSlotResponse)
def update_template_slot(
    slot_id: int,
    slot_update: schemas.TemplateSlotUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update template slots")
        
    db_slot = db.query(models.TemplateSlot).filter(
        models.TemplateSlot.id == slot_id,
        models.TemplateSlot.active == True
    ).first()
    
    if not db_slot:
        raise HTTPException(status_code=404, detail="Template slot not found")
        
    for key, value in slot_update.dict(exclude_unset=True).items():
        setattr(db_slot, key, value)
    
    db.commit()
    db.refresh(db_slot)
    return db_slot

@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete template slots")
        
    db_slot = db.query(models.TemplateSlot).filter(
        models.TemplateSlot.id == slot_id,
        models.TemplateSlot.active == True
    ).first()
    
    if not db_slot:
        raise HTTPException(status_code=404, detail="Template slot not found")
        
    db_slot.active = False
    db.commit()
    return None 