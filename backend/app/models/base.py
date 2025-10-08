from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import LONGTEXT

from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    shifts = relationship("Shift", back_populates="user")

class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(String(50))  # scheduled, completed, cancelled
    notes = Column(String(500))
    
    # Relationships
    user = relationship("User", back_populates="shifts") 
    status = Column(String(50))  # scheduled, completed, cancelled
    notes = Column(LONGTEXT, nullable=True)
    break_duration = Column(Integer, nullable=True)  # in minutes
    overtime_hours = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="shifts")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    leave_type = Column(String(50))  # vacation, sick, personal, etc.
    status = Column(String(50))  # pending, approved, rejected
    notes = Column(LONGTEXT, nullable=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="leave_requests")

class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    day_of_week = Column(Integer)  # 0-6 for Monday-Sunday
    start_time = Column(String(5))  # HH:MM format
    end_time = Column(String(5))    # HH:MM format
    is_available = Column(Boolean, default=True)
    notes = Column(LONGTEXT, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="availability")