from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    id: str
    email: str
    name: str
    role: str

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str = "user"

class UserUpdate(BaseModel):
    email: str | None = None
    name: str | None = None
    role: str | None = None 