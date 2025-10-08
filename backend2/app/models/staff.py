from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base

# Association table for staff and roles
staff_roles = Table(
    "staff_roles",
    Base.metadata,
    Column("staff_id", Integer, ForeignKey("staff.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
)

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    group_id = Column(Integer, ForeignKey("staff_groups.id"))
    points_monthly = Column(Integer, default=0)
    points_total = Column(Integer, default=0)
    createDate = Column(DateTime(timezone=True), server_default=func.now())
    updateDate = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    department = relationship("Department", back_populates="staff")
    group = relationship("StaffGroup", back_populates="staff")
    roles = relationship("Role", secondary=staff_roles, back_populates="staff")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    createDate = Column(DateTime(timezone=True), server_default=func.now())
    updateDate = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    staff = relationship("Staff", secondary=staff_roles, back_populates="roles")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    createDate = Column(DateTime(timezone=True), server_default=func.now())
    updateDate = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    staff = relationship("Staff", back_populates="department")

class StaffGroup(Base):
    __tablename__ = "staff_groups"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    createDate = Column(DateTime(timezone=True), server_default=func.now())
    updateDate = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    staff = relationship("Staff", back_populates="group") 