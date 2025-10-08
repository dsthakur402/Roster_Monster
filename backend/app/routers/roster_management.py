from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/roster",
    tags=["Roster Management"]
)

# Role endpoints
@router.post("/roles/", response_model=schemas.RoleResponse)
def create_role(role: schemas.RoleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create roles")
    db_role = models.Role(**role.dict())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.get("/roles/", response_model=List[schemas.RoleResponse])
def get_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    roles = db.query(models.Role).filter(models.Role.active == True).offset(skip).limit(limit).all()
    return roles

# Staff Group endpoints
@router.post("/groups/", response_model=schemas.StaffGroupResponse)
def create_staff_group(group: schemas.StaffGroupCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create staff groups")
    db_group = models.StaffGroup(**group.dict())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@router.get("/groups/", response_model=List[schemas.StaffGroupResponse])
def get_staff_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    groups = db.query(models.StaffGroup).filter(models.StaffGroup.active == True).offset(skip).limit(limit).all()
    return groups

# Staff endpoints
@router.post("/staff/", response_model=schemas.StaffResponse)
def create_staff(staff: schemas.StaffCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create staff")
    db_staff = models.Staff(**staff.dict())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.get("/staff/", response_model=List[schemas.StaffResponse])
def get_staff(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    staff = db.query(models.Staff).filter(models.Staff.active == True).offset(skip).limit(limit).all()
    return staff

@router.get("/staff/{staff_id}", response_model=schemas.StaffResponse)
def get_staff_by_id(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id, models.Staff.active == True).first()
    if staff is None:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff

# Leave Request endpoints
@router.post("/leave/", response_model=schemas.LeaveRequestResponse)
def create_leave_request(leave: schemas.LeaveRequestCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify the staff member belongs to the current user
    staff = db.query(models.Staff).filter(models.Staff.id == leave.staff_id, models.Staff.user_id == current_user.id).first()
    if not staff and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create leave request for this staff member")
    
    db_leave = models.LeaveRequest(**leave.dict())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

@router.get("/leave/", response_model=List[schemas.LeaveRequestResponse])
def get_leave_requests(
    skip: int = 0, 
    limit: int = 100, 
    staff_id: int = None,
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.LeaveRequest).filter(models.LeaveRequest.active == True)
    
    if staff_id:
        query = query.filter(models.LeaveRequest.staff_id == staff_id)
    if start_date:
        query = query.filter(models.LeaveRequest.start_date >= start_date)
    if end_date:
        query = query.filter(models.LeaveRequest.end_date <= end_date)
        
    return query.offset(skip).limit(limit).all()

@router.put("/leave/{leave_id}", response_model=schemas.LeaveRequestResponse)
def update_leave_request(
    leave_id: int,
    leave: schemas.LeaveRequestUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    # Only admin can update status, owner can update other fields
    if current_user.role != "admin":
        staff = db.query(models.Staff).filter(
            models.Staff.id == db_leave.staff_id,
            models.Staff.user_id == current_user.id
        ).first()
        if not staff:
            raise HTTPException(status_code=403, detail="Not authorized to update this leave request")
        if leave.status is not None:
            raise HTTPException(status_code=403, detail="Not authorized to update leave status")

    for key, value in leave.dict(exclude_unset=True).items():
        setattr(db_leave, key, value)
    
    db.commit()
    db.refresh(db_leave)
    return db_leave

# Roster Generation endpoint
@router.post("/generate/", response_model=List[schemas.RosterAssignmentResponse])
def generate_roster(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to generate roster")
        
    # TODO: Implement the roster generation algorithm
    # This will be a complex algorithm that needs to consider:
    # 1. Staff FTE requirements
    # 2. Location priorities and requirements
    # 3. Leave requests
    # 4. Double station assignments
    # 5. Fair distribution of work
    
    # For now, return an empty list
    return []

# Roster Assignment endpoints
@router.get("/assignments/", response_model=List[schemas.RosterAssignmentResponse])
def get_roster_assignments(
    skip: int = 0,
    limit: int = 100,
    start_date: datetime = None,
    end_date: datetime = None,
    location_id: int = None,
    staff_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.RosterAssignment).filter(models.RosterAssignment.active == True)
    
    if start_date:
        query = query.filter(models.RosterAssignment.date >= start_date)
    if end_date:
        query = query.filter(models.RosterAssignment.date <= end_date)
    if location_id:
        query = query.filter(models.RosterAssignment.location_id == location_id)
    if staff_id:
        query = query.filter(models.RosterAssignment.staff_id == staff_id)
        
    return query.offset(skip).limit(limit).all()

@router.put("/assignments/{assignment_id}", response_model=schemas.RosterAssignmentResponse)
def update_roster_assignment(
    assignment_id: int,
    assignment: schemas.RosterAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update roster assignments")
        
    db_assignment = db.query(models.RosterAssignment).filter(
        models.RosterAssignment.id == assignment_id
    ).first()
    
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Roster assignment not found")
        
    for key, value in assignment.dict(exclude_unset=True).items():
        setattr(db_assignment, key, value)
    
    db.commit()
    db.refresh(db_assignment)
    return db_assignment 