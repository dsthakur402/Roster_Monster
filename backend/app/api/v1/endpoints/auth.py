from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from app import models, schemas, auth
from app.database import get_db
from app.models.base import User
router = APIRouter()

@router.get("/test")
def test_endpoint():
    return {"message": "Test endpoint works!"}

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Simplified version for testing
    return {"message": "User creation endpoint reached", "email": user.email}

@router.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: User = Depends(auth.get_current_user)):
    return current_user
