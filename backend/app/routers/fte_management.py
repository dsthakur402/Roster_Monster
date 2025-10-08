from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/fte",
    tags=["FTE Management"]
)

@router.post("/configurations/", response_model=schemas.FTEConfigurationResponse)
def create_fte_configuration(
    config: schemas.FTEConfigurationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create FTE configurations")
    
    db_config = models.FTEConfiguration(**config.dict())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@router.get("/configurations/", response_model=List[schemas.FTEConfigurationResponse])
def get_fte_configurations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    configurations = db.query(models.FTEConfiguration).filter(
        models.FTEConfiguration.active == True
    ).offset(skip).limit(limit).all()
    return configurations

@router.get("/configurations/{config_id}", response_model=schemas.FTEConfigurationResponse)
def get_fte_configuration(config_id: int, db: Session = Depends(get_db)):
    config = db.query(models.FTEConfiguration).filter(
        models.FTEConfiguration.id == config_id,
        models.FTEConfiguration.active == True
    ).first()
    
    if config is None:
        raise HTTPException(status_code=404, detail="FTE configuration not found")
    return config

@router.put("/configurations/{config_id}", response_model=schemas.FTEConfigurationResponse)
def update_fte_configuration(
    config_id: int,
    config: schemas.FTEConfigurationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update FTE configurations")
        
    db_config = db.query(models.FTEConfiguration).filter(
        models.FTEConfiguration.id == config_id
    ).first()
    
    if not db_config:
        raise HTTPException(status_code=404, detail="FTE configuration not found")
        
    for key, value in config.dict(exclude_unset=True).items():
        setattr(db_config, key, value)
    
    db.commit()
    db.refresh(db_config)
    return db_config

@router.delete("/configurations/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fte_configuration(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete FTE configurations")
        
    db_config = db.query(models.FTEConfiguration).filter(
        models.FTEConfiguration.id == config_id
    ).first()
    
    if not db_config:
        raise HTTPException(status_code=404, detail="FTE configuration not found")
        
    db_config.active = False
    db.commit()
    return None

# Staff FTE Management endpoints
@router.get("/staff/{staff_id}", response_model=schemas.StaffResponse)
def get_staff_fte(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(models.Staff).filter(
        models.Staff.id == staff_id,
        models.Staff.active == True
    ).first()
    
    if staff is None:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff

@router.put("/staff/{staff_id}", response_model=schemas.StaffResponse)
def update_staff_fte(
    staff_id: int,
    fte_update: schemas.StaffUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update staff FTE")
        
    db_staff = db.query(models.Staff).filter(
        models.Staff.id == staff_id
    ).first()
    
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    # Validate total FTE doesn't exceed 1.0
    new_fte_clinical = fte_update.fte_clinical if fte_update.fte_clinical is not None else db_staff.fte_clinical
    new_fte_research = fte_update.fte_research if fte_update.fte_research is not None else db_staff.fte_research
    new_fte_admin = fte_update.fte_admin if fte_update.fte_admin is not None else db_staff.fte_admin
    
    total_fte = new_fte_clinical + new_fte_research + new_fte_admin
    if total_fte > 1.0:
        raise HTTPException(
            status_code=400,
            detail="Total FTE cannot exceed 1.0"
        )
        
    for key, value in fte_update.dict(exclude_unset=True).items():
        setattr(db_staff, key, value)
    
    db.commit()
    db.refresh(db_staff)
    return db_staff

# FTE Contribution tracking endpoints
@router.get("/contributions/{staff_id}", response_model=float)
def get_staff_fte_contribution(
    staff_id: int,
    start_date: datetime,
    end_date: datetime,
    location_type: schemas.LocationType = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.RosterAssignment).filter(
        models.RosterAssignment.staff_id == staff_id,
        models.RosterAssignment.date >= start_date,
        models.RosterAssignment.date <= end_date,
        models.RosterAssignment.active == True
    )
    
    if location_type:
        query = query.join(models.Location).filter(
            models.Location.location_type == location_type
        )
    
    assignments = query.all()
    total_contribution = sum(assignment.fte_contribution for assignment in assignments)
    
    return total_contribution 