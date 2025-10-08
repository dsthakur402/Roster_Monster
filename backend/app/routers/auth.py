from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from .. import schemas, models, utils, oauth2
from ..config import get_db
from ..service import user_password_verify

router = APIRouter(
    tags=["Authentication"]
)


@router.post("/api/login/", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = user_password_verify(user_credentials.username, user_credentials.password, db)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

    # Include role in token data
    token_data = {
        "user_id": user.id,
        "role": user.role
    }
    
    access_token = oauth2.create_access_token(data=token_data)
    refresh_token = oauth2.create_refresh_token(data=token_data)
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token, 
        "token_type": "bearer",
        "role": user.role
    }

@router.post("/api/refresh/")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"}
    )
    user_id = oauth2.verify_token(refresh_token, credentials_exception)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise credentials_exception
    new_access_token = oauth2.create_access_token({"user_id": user.id})
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.get("/api/check/")
def login():
    return {"message": "ready"}