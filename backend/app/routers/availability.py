from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from .. import models, schemas, oauth2
from ..config.database import get_db

router = APIRouter(
    prefix="/availability",
    tags=['Availability']
)

@router.get("/", response_model=List[schemas.StaffAvailability])
async def get_availability(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(oauth2.get_current_user)
):
    try:
        # Get the staff record for the current user
        staff = db.query(models.Staff).filter(
            models.Staff.user_id == current_user.id,
            models.Staff.active == True
        ).first()
        
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff record not found"
            )

        # Get availability records for the date range
        availability = db.query(models.StaffAvailability).filter(
            models.StaffAvailability.staff_id == staff.id,
            models.StaffAvailability.date >= start_date,
            models.StaffAvailability.date <= end_date,
            models.StaffAvailability.active == True
        ).all()

        return availability
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/", response_model=schemas.StaffAvailability)
def create_availability(
    availability: schemas.StaffAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(oauth2.get_current_user)
):
    # Get the staff record for the current user
    staff = db.query(models.Staff).filter(
        models.Staff.user_id == current_user.id,
        models.Staff.active == True
    ).first()
    
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff record not found"
        )

    # Check if availability record already exists
    existing_availability = db.query(models.StaffAvailability).filter(
        models.StaffAvailability.staff_id == staff.id,
        models.StaffAvailability.date == availability.date,
        models.StaffAvailability.shift_type == availability.shift_type,
        models.StaffAvailability.active == True
    ).first()

    if existing_availability:
        # Update existing record
        for key, value in availability.dict().items():
            setattr(existing_availability, key, value)
        db.commit()
        db.refresh(existing_availability)
        return existing_availability

    # Create new availability record
    new_availability = models.StaffAvailability(
        staff_id=staff.id,
        **availability.dict()
    )
    db.add(new_availability)
    db.commit()
    db.refresh(new_availability)
    return new_availability

@router.put("/{availability_id}", response_model=schemas.StaffAvailability)
def update_availability(
    availability_id: int,
    availability_update: schemas.StaffAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(oauth2.get_current_user)
):
    # Get the staff record for the current user
    staff = db.query(models.Staff).filter(
        models.Staff.user_id == current_user.id,
        models.Staff.active == True
    ).first()
    
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff record not found"
        )

    # Get the availability record
    availability_query = db.query(models.StaffAvailability).filter(
        models.StaffAvailability.id == availability_id,
        models.StaffAvailability.active == True
    )
    availability = availability_query.first()

    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability record not found"
        )

    if availability.staff_id != staff.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this availability record"
        )

    # Update the availability record
    for key, value in availability_update.dict(exclude_unset=True).items():
        setattr(availability, key, value)

    db.commit()
    db.refresh(availability)
    return availability

@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    availability_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(oauth2.get_current_user)
):
    # Get the staff record for the current user
    staff = db.query(models.Staff).filter(
        models.Staff.user_id == current_user.id,
        models.Staff.active == True
    ).first()
    
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff record not found"
        )

    # Get the availability record
    availability_query = db.query(models.StaffAvailability).filter(
        models.StaffAvailability.id == availability_id,
        models.StaffAvailability.active == True
    )
    availability = availability_query.first()

    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability record not found"
        )

    if availability.staff_id != staff.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this availability record"
        )

    # Soft delete the availability record
    availability.active = False
    db.commit()

    return None 