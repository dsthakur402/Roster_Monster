from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base

class FTEScale(Base):
    __tablename__ = "fte_scales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # hours, days, weeks
    baseValue = Column(Float, nullable=False)
    equivalentFTE = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    createDate = Column(DateTime(timezone=True), server_default=func.now())
    updateDate = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assignments = relationship("FTEAssignment", back_populates="scale")

class FTEAssignment(Base):
    __tablename__ = "fte_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scale_id = Column(Integer, ForeignKey("fte_scales.id"), nullable=False)
    target_type = Column(String(50), nullable=False)  # role, staff, group
    target_id = Column(Integer, nullable=False)  # ID of the role, staff, or group
    value = Column(Float, nullable=False)
    createDate = Column(DateTime(timezone=True), server_default=func.now())
    updateDate = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    scale = relationship("FTEScale", back_populates="assignments") 