from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
import enum
from .base import Base
from sqlalchemy.orm import relationship

class UserType(enum.Enum):
    RADIOLOGIST = "Radiologist"
    ADMIN = "Admin"
    OTHER = "Other"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    createDate = Column(DateTime(timezone=True), server_default=func.now())
    updateDate = Column(DateTime(timezone=True), onupdate=func.now())
    userType = Column(Enum(UserType), nullable=False, default=UserType.RADIOLOGIST)
    lastActivateTime = Column(DateTime(timezone=True), server_default=func.now())
    subscriptions = relationship("Subscription", back_populates="user")
    attributes = relationship("UserAttributes", back_populates="user")


class UserAttributes(Base):
    __tablename__ = "user_attributes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("users.id"))
    locationId = Column(Integer, ForeignKey("locations.id"))
    specializations = Column(Text)
    createDate = Column(DateTime(timezone=True), server_default=func.now())
    updateDate = Column(DateTime(timezone=True), onupdate=func.now())
    user = relationship("User", back_populates="attributes")
