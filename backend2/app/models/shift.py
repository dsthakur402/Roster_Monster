from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.sql import func
from .base import Base

class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    startTime = Column(DateTime(timezone=True), nullable=False)
    endTime = Column(DateTime(timezone=True), nullable=False)
    location = Column(Integer, ForeignKey("locations.id"), nullable=False)
    specializationRequired = Column(String(255), nullable=False)
    createDate = Column(DateTime(timezone=True), server_default=func.now())
    updateDate = Column(DateTime(timezone=True), onupdate=func.now()) 