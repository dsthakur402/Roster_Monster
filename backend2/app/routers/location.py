from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.location import Location, LocationCreate, LocationUpdate
from app.services.location_crud import (
    get_location,
    get_locations,
    create_location,
    update_location,
    delete_location
)

router = APIRouter(
    prefix="/api/locations",
    tags=["locations"]
)

@router.get("/", response_model=List[Location])
def read_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    locations = get_locations(db, skip=skip, limit=limit)
    return locations

@router.get("/{location_id}", response_model=Location)
def read_location(location_id: int, db: Session = Depends(get_db)):
    db_location = get_location(db, location_id=location_id)
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_location

@router.post("/", response_model=Location, status_code=201)
def create_location_route(location: LocationCreate, db: Session = Depends(get_db)):
    return create_location(db=db, location=location)

@router.put("/{location_id}", response_model=Location)
def update_location_route(location_id: int, location: LocationUpdate, db: Session = Depends(get_db)):
    db_location = update_location(db=db, location_id=location_id, location=location)
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_location

@router.delete("/{location_id}")
def delete_location_route(location_id: int, db: Session = Depends(get_db)):
    success = delete_location(db=db, location_id=location_id)
    if not success:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted successfully"} 