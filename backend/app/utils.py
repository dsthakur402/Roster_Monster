from passlib.context import CryptContext
from . import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash(password: str):
    return pwd_context.hash(password)


def verify(username, plain_password, db):
    user = db.query(models.User).filter(models.User.email == username).first()
    if not user:
        return False
    if not verify_password(plain_password, user.password):
        return False
    return user.id


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)