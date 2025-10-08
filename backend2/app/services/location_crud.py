from sqlalchemy.orm import Session
from app.models.location import Location
from app.schemas.location import LocationCreate, LocationUpdate
from typing import List, Optional

def get_location(db: Session, location_id: int) -> Optional[Location]:
    return db.query(Location).filter(Location.id == location_id).first()

def get_locations(db: Session, skip: int = 0, limit: int = 100) -> List[Location]:
    return db.query(Location).offset(skip).limit(limit).all()

def create_location(db: Session, location: LocationCreate) -> Location:
    db_location = Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

def update_location(db: Session, location_id: int, location: LocationUpdate) -> Optional[Location]:
    db_location = get_location(db, location_id)
    if db_location:
        for key, value in location.dict(exclude_unset=True).items():
            setattr(db_location, key, value)
        db.commit()
        db.refresh(db_location)
    return db_location

def delete_location(db: Session, location_id: int) -> bool:
    db_location = get_location(db, location_id)
    if db_location:
        db.delete(db_location)
        db.commit()
        return True
    return False 