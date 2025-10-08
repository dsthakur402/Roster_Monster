from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from ..models.user import UserType

class UserBase(BaseModel):
    name: str
    email: EmailStr
    userType: UserType = UserType.RADIOLOGIST

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    userType: Optional[UserType] = None

class UserAttributesBase(BaseModel):
    locationId: Optional[int] = None
    specializations: Optional[str] = None

class UserAttributesCreate(UserAttributesBase):
    userId: int

class UserAttributesUpdate(UserAttributesBase):
    pass

class UserAttributes(UserAttributesBase):
    id: int
    userId: int
    createDate: datetime
    updateDate: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    createDate: datetime
    updateDate: Optional[datetime] = None
    lastActivateTime: datetime
    attributes: Optional[UserAttributes] = None

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    userType: UserType
    createDate: datetime
    updateDate: Optional[datetime] = None
    lastActivateTime: Optional[datetime] = None
    attributes: Optional[List[UserAttributes]] = []

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class TokenData(BaseModel):
    email: Optional[str] = None
    userType: Optional[UserType] = None

class UserLogin(BaseModel):
    username: str
    password: str