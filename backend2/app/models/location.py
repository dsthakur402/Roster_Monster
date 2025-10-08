from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.sql import func
from .base import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    requiredUsers = Column(JSON, nullable=False, default=list)
    requiredRoles = Column(JSON, nullable=False, default=list)
    requiredGroups = Column(JSON, nullable=False, default=list)
    minStaffCount = Column(Integer, nullable=False, default=0)
    priority = Column(Integer, nullable=False, default=1)
    sessions = Column(JSON, nullable=False, default=list)
    dateOverrides = Column(JSON, nullable=False, default=list)
    createDate = Column(DateTime(timezone=True), server_default=func.now())
    updateDate = Column(DateTime(timezone=True), onupdate=func.now()) 