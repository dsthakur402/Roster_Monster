from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/locations",
    tags=["Location Management"]
)

# Location endpoints
@router.post("/", response_model=schemas.LocationResponse)
def create_location(
    location: schemas.LocationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create locations")
    
    db_location = models.Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@router.get("/", response_model=List[schemas.LocationResponse])
def get_locations(
    skip: int = 0,
    limit: int = 100,
    location_type: schemas.LocationType = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Location).filter(models.Location.active == True)
    
    if location_type:
        query = query.filter(models.Location.location_type == location_type)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{location_id}", response_model=schemas.LocationResponse)
def get_location(location_id: int, db: Session = Depends(get_db)):
    location = db.query(models.Location).filter(
        models.Location.id == location_id,
        models.Location.active == True
    ).first()
    
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.put("/{location_id}", response_model=schemas.LocationResponse)
def update_location(
    location_id: int,
    location: schemas.LocationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update locations")
        
    db_location = db.query(models.Location).filter(
        models.Location.id == location_id
    ).first()
    
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
        
    for key, value in location.dict(exclude_unset=True).items():
        setattr(db_location, key, value)
    
    db.commit()
    db.refresh(db_location)
    return db_location

@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete locations")
        
    db_location = db.query(models.Location).filter(
        models.Location.id == location_id
    ).first()
    
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
        
    db_location.active = False
    db.commit()
    return None

# Location Time Slot endpoints
@router.post("/{location_id}/time-slots/", response_model=schemas.LocationTimeSlotResponse)
def create_location_time_slot(
    location_id: int,
    time_slot: schemas.LocationTimeSlotCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create time slots")
        
    # Verify location exists
    location = db.query(models.Location).filter(
        models.Location.id == location_id,
        models.Location.active == True
    ).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
        
    db_time_slot = models.LocationTimeSlot(**time_slot.dict())
    db.add(db_time_slot)
    db.commit()
    db.refresh(db_time_slot)
    return db_time_slot

@router.get("/{location_id}/time-slots/", response_model=List[schemas.LocationTimeSlotResponse])
def get_location_time_slots(
    location_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    time_slots = db.query(models.LocationTimeSlot).filter(
        models.LocationTimeSlot.location_id == location_id,
        models.LocationTimeSlot.active == True
    ).offset(skip).limit(limit).all()
    return time_slots

# Location Staff Requirements endpoints
@router.post("/{location_id}/requirements/", response_model=schemas.LocationStaffRequirementResponse)
def create_location_requirement(
    location_id: int,
    requirement: schemas.LocationStaffRequirementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create staff requirements")
        
    # Verify location exists
    location = db.query(models.Location).filter(
        models.Location.id == location_id,
        models.Location.active == True
    ).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
        
    # Verify role exists if provided
    if requirement.role_id:
        role = db.query(models.Role).filter(
            models.Role.id == requirement.role_id,
            models.Role.active == True
        ).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
            
    # Verify group exists if provided
    if requirement.group_id:
        group = db.query(models.StaffGroup).filter(
            models.StaffGroup.id == requirement.group_id,
            models.StaffGroup.active == True
        ).first()
        if not group:
            raise HTTPException(status_code=404, detail="Staff group not found")
        
    db_requirement = models.LocationStaffRequirement(**requirement.dict())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@router.get("/{location_id}/requirements/", response_model=List[schemas.LocationStaffRequirementResponse])
def get_location_requirements(
    location_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    requirements = db.query(models.LocationStaffRequirement).filter(
        models.LocationStaffRequirement.location_id == location_id,
        models.LocationStaffRequirement.active == True
    ).offset(skip).limit(limit).all()
    return requirements

@router.put("/requirements/{requirement_id}", response_model=schemas.LocationStaffRequirementResponse)
def update_location_requirement(
    requirement_id: int,
    requirement: schemas.LocationStaffRequirementUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update staff requirements")
        
    db_requirement = db.query(models.LocationStaffRequirement).filter(
        models.LocationStaffRequirement.id == requirement_id
    ).first()
    
    if not db_requirement:
        raise HTTPException(status_code=404, detail="Staff requirement not found")
        
    # Verify role exists if being updated
    if requirement.role_id:
        role = db.query(models.Role).filter(
            models.Role.id == requirement.role_id,
            models.Role.active == True
        ).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
            
    # Verify group exists if being updated
    if requirement.group_id:
        group = db.query(models.StaffGroup).filter(
            models.StaffGroup.id == requirement.group_id,
            models.StaffGroup.active == True
        ).first()
        if not group:
            raise HTTPException(status_code=404, detail="Staff group not found")
        
    for key, value in requirement.dict(exclude_unset=True).items():
        setattr(db_requirement, key, value)
    
    db.commit()
    db.refresh(db_requirement)
    return db_requirement 