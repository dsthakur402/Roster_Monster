from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, UniqueConstraint, Boolean, Index, Float, Enum
from .config import Base
from sqlalchemy.sql.expression import text
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import LONGTEXT
import uuid
import enum

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    institution_id = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False, default='user')
    date_created = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    date_modified = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))
    active = Column(Boolean, default=True)

    staff = relationship("Staff", back_populates="user")

class LeaveType(enum.Enum):
    FORECAST = "forecast"
    NON_URGENT = "non_urgent"
    URGENT = "urgent"

class LocationType(enum.Enum):
    CLINICAL = "clinical"
    RESEARCH = "research"
    ADMIN = "admin"

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(300))
    date_created = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    date_modified = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))
    active = Column(Boolean, default=True)

class StaffGroup(Base):
    __tablename__ = "staff_groups"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(300))
    date_created = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    date_modified = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))
    active = Column(Boolean, default=True)

class Staff(Base):
    __tablename__ = "staff"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("staff_groups.id"))
    fte_clinical = Column(Float, default=1.0)
    fte_research = Column(Float, default=0.0)
    fte_admin = Column(Float, default=0.0)
    date_created = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    date_modified = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))
    active = Column(Boolean, default=True)

    user = relationship("User", back_populates="staff")
    role = relationship("Role", foreign_keys=[role_id])
    group = relationship("StaffGroup", foreign_keys=[group_id])

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(300))
    location_type = Column(Enum(LocationType), nullable=False, default=LocationType.CLINICAL)
    priority = Column(Integer, default=0)
    priority_group = Column(String(100))
    min_staff_required = Column(Integer, default=1)
    fte_points = Column(Float, default=0.1)
    allows_double_station = Column(Boolean, default=False)
    date_created = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    date_modified = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))
    active = Column(Boolean, default=True)

class LocationTimeSlot(Base):
    __tablename__ = "location_time_slots"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    start_time = Column(String(5), nullable=False)  # Format: "HH:MM"
    end_time = Column(String(5), nullable=False)    # Format: "HH:MM"
    days_of_week = Column(String(50), nullable=False)  # Comma-separated days: "1,2,3,4,5"
    date_created = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    date_modified = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))
    active = Column(Boolean, default=True)

    location = relationship("Location", foreign_keys=[location_id])

class LocationStaffRequirement(Base):
    __tablename__ = "location_staff_requirements"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    group_id = Column(Integer, ForeignKey("staff_groups.id"))
    min_staff = Column(Integer, default=1)
    date_created = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    date_modified = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))
    active = Column(Boolean, default=True)

    location = relationship("Location", foreign_keys=[location_id])
    role = relationship("Role", foreign_keys=[role_id])
    group = relationship("StaffGroup", foreign_keys=[group_id])

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(TIMESTAMP(timezone=True), nullable=False)
    end_date = Column(TIMESTAMP(timezone=True), nullable=False)
    status = Column(String(20), default="pending")  # pending, approved, rejected
    date_created = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    date_modified = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))
    active = Column(Boolean, default=True)

    staff = relationship("Staff", foreign_keys=[staff_id])

class RosterAssignment(Base):
    __tablename__ = "roster_assignments"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    time_slot_id = Column(Integer, ForeignKey("location_time_slots.id"), nullable=False)
    date = Column(TIMESTAMP(timezone=True), nullable=False)
    is_double_stationed = Column(Boolean, default=False)
    double_station_pair_id = Column(Integer, ForeignKey("roster_assignments.id"))
    fte_contribution = Column(Float, nullable=False)
    date_created = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    date_modified = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))
    active = Column(Boolean, default=True)

    staff = relationship("Staff", foreign_keys=[staff_id])
    location = relationship("Location", foreign_keys=[location_id])
    time_slot = relationship("LocationTimeSlot", foreign_keys=[time_slot_id])
    double_station_pair = relationship("RosterAssignment", remote_side=[id])

class FTEConfiguration(Base):
    __tablename__ = "fte_configurations"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(String(300))
    shifts_per_week = Column(Float, nullable=False)
    hours_per_shift = Column(Float, nullable=False)
    date_created = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    date_modified = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'), onupdate=text('now()'))
    active = Column(Boolean, default=True)