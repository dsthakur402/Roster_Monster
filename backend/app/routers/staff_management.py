from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..config.database import get_db
from .. import models, schemas, oauth2
from datetime import datetime

router = APIRouter(
    prefix="/api/staff",
    tags=['Staff Management']
)

# Role Management
@router.post("/roles", response_model=schemas.RoleResponse)
def create_role(role: schemas.RoleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create roles")
    
    new_role = models.Role(**role.model_dump())
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

@router.get("/roles", response_model=List[schemas.RoleResponse])
def get_roles(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    roles = db.query(models.Role).filter(models.Role.active == True).all()
    return roles

@router.delete("/roles/{role_id}", status_code=204)
def delete_role(role_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete roles")
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()
    return

# Staff Group Management
@router.post("/groups", response_model=schemas.StaffGroupResponse)
def create_staff_group(group: schemas.StaffGroupCreate, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create staff groups")
    
    new_group = models.StaffGroup(**group.model_dump())
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group

@router.get("/groups", response_model=List[schemas.StaffGroupResponse])
def get_staff_groups(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    groups = db.query(models.StaffGroup).filter(models.StaffGroup.active == True).all()
    return groups

# Staff Management
@router.post("/", response_model=schemas.StaffResponse)
def create_staff(staff: schemas.StaffCreate, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create staff")
    
    # Create user account first
    from ..utils import hash
    user = models.User(
        email=staff.email,
        password=hash("temporary_password"),  # Hash the temporary password
        institution_id=current_user.institution_id,
        role="staff"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create staff profile
    new_staff = models.Staff(
        user_id=user.id,
        role_id=staff.role_id,
        group_id=staff.group_id,
        fte_clinical=staff.fte_clinical,
        fte_research=staff.fte_research,
        fte_admin=staff.fte_admin
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)
    return new_staff

@router.get("/", response_model=List[schemas.StaffResponse])
def get_staff(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    staff = db.query(models.Staff).filter(models.Staff.active == True).all()
    return staff

@router.get("/{id}", response_model=schemas.StaffResponse)
def get_staff_by_id(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    staff = db.query(models.Staff).filter(models.Staff.id == id, models.Staff.active == True).first()
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Staff with id {id} not found")
    return staff

@router.put("/{id}", response_model=schemas.StaffResponse)
def update_staff(id: int, staff_update: schemas.StaffUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    if current_user.role != "admin" and current_user.id != id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this staff member")
    
    staff_query = db.query(models.Staff).filter(models.Staff.id == id, models.Staff.active == True)
    staff = staff_query.first()
    
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Staff with id {id} not found")
    
    staff_query.update(staff_update.model_dump(exclude_unset=True), synchronize_session=False)
    db.commit()
    return staff_query.first()

# Leave Request Management
@router.post("/leave", response_model=schemas.LeaveRequestResponse)
def create_leave_request(leave_request: schemas.LeaveRequestCreate, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    staff = db.query(models.Staff).filter(models.Staff.user_id == current_user.id, models.Staff.active == True).first()
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff profile not found")
    
    new_leave_request = models.LeaveRequest(
        staff_id=staff.id,
        **leave_request.model_dump()
    )
    db.add(new_leave_request)
    db.commit()
    db.refresh(new_leave_request)
    return new_leave_request

@router.get("/leave", response_model=List[schemas.LeaveRequestResponse])
def get_leave_requests(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    if current_user.role == "admin":
        leave_requests = db.query(models.LeaveRequest).filter(models.LeaveRequest.active == True).all()
    else:
        staff = db.query(models.Staff).filter(models.Staff.user_id == current_user.id, models.Staff.active == True).first()
        if not staff:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff profile not found")
        leave_requests = db.query(models.LeaveRequest).filter(
            models.LeaveRequest.staff_id == staff.id,
            models.LeaveRequest.active == True
        ).all()
    return leave_requests

@router.put("/leave/{id}", response_model=schemas.LeaveRequestResponse)
def update_leave_request(id: int, leave_update: schemas.LeaveRequestUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    leave_query = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == id, models.LeaveRequest.active == True)
    leave_request = leave_query.first()
    
    if not leave_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Leave request with id {id} not found")
    
    # Only admin can update status, owner can update other details
    if current_user.role != "admin":
        staff = db.query(models.Staff).filter(models.Staff.user_id == current_user.id, models.Staff.active == True).first()
        if not staff or staff.id != leave_request.staff_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this leave request")
        if leave_update.status is not None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update leave request status")
    
    leave_query.update(leave_update.model_dump(exclude_unset=True), synchronize_session=False)
    db.commit()
    return leave_query.first() 