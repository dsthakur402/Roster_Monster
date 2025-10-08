from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from .base import Base

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    radiologistID = Column(Integer, ForeignKey("users.id"), nullable=False)
    startTime = Column(DateTime(timezone=True), nullable=False)
    endTime = Column(DateTime(timezone=True), nullable=False)
    updateDate = Column(DateTime(timezone=True), onupdate=func.now())
    remarks = Column(Text, nullable=True)
    approvedStatus = Column(Boolean, default=False)
    approvedBy = Column(Integer, ForeignKey("users.id"), nullable=True)
    createDate = Column(DateTime(timezone=True), server_default=func.now()) 