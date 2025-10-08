from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User, UserAttributes as UserAttributesModel
from ..schemas.user import (
    UserCreate, UserUpdate, UserResponse,
    UserAttributesCreate, UserAttributesUpdate, UserAttributes
)

router = APIRouter(
    prefix="/api/user",
    tags=["users"]
)

@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    user_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if user_type:
        query = query.filter(User.userType == user_type)
    return query.offset(skip).limit(limit).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["password"] = get_password_hash(update_data["password"])
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(db_user)
    db.commit()
    return None

# User Attributes endpoints
@router.get("/{user_id}/attributes", response_model=UserAttributes)
def get_user_attributes(user_id: int, db: Session = Depends(get_db)):
    attributes = db.query(UserAttributesModel).filter(
        UserAttributesModel.userId == user_id
    ).first()
    if not attributes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User attributes not found"
        )
    return attributes

@router.post("/{user_id}/attributes", response_model=UserAttributes)
def create_user_attributes(
    user_id: int,
    attributes: UserAttributesCreate,
    db: Session = Depends(get_db)
):
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if attributes already exist
    existing_attributes = db.query(UserAttributesModel).filter(
        UserAttributesModel.userId == user_id
    ).first()
    if existing_attributes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User attributes already exist"
        )
    
    # Create new attributes
    db_attributes = UserAttributesModel(**attributes.dict())
    db.add(db_attributes)
    db.commit()
    db.refresh(db_attributes)
    return db_attributes

@router.put("/{user_id}/attributes", response_model=UserAttributes)
def update_user_attributes(
    user_id: int,
    attributes: UserAttributesUpdate,
    db: Session = Depends(get_db)
):
    db_attributes = db.query(UserAttributesModel).filter(
        UserAttributesModel.userId == user_id
    ).first()
    if not db_attributes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User attributes not found"
        )
    
    # Update attributes
    update_data = attributes.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_attributes, field, value)
    
    db.commit()
    db.refresh(db_attributes)
    return db_attributes 