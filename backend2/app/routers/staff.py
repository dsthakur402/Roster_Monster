from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Staff, Role, Department, StaffGroup
from ..schemas import (
    Staff as StaffSchema,
    StaffCreate,
    StaffUpdate,
    Role as RoleSchema,
    RoleCreate,
    Department as DepartmentSchema,
    DepartmentCreate,
    DepartmentUpdate,
    StaffGroup as StaffGroupSchema,
    StaffGroupCreate,
    StaffGroupUpdate
)

router = APIRouter(
    prefix="/api/staff",
    tags=["staff"]
)

# Role endpoints
@router.get("/roles", response_model=List[RoleSchema])
def get_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()

@router.post("/roles", response_model=RoleSchema)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    db_role = Role(**role.model_dump())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.put("/roles/{role_id}", response_model=RoleSchema)
def update_role(role_id: int, role: RoleCreate, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    update_data = role.model_dump()
    for key, value in update_data.items():
        setattr(db_role, key, value)
    
    db.commit()
    db.refresh(db_role)
    return db_role

@router.delete("/roles/{role_id}", status_code=204)
def delete_role(role_id: int, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    # Prevent deleting a role if assigned to any staff
    staff_with_role = db.query(Staff).filter(Staff.roles.any(Role.id == role_id)).first()
    if staff_with_role:
        raise HTTPException(status_code=400, detail="Cannot delete role assigned to staff members")
    db.delete(db_role)
    db.commit()
    return None

# Department endpoints
@router.get("/departments", response_model=List[DepartmentSchema])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.post("/departments", response_model=DepartmentSchema)
def create_department(department: DepartmentCreate, db: Session = Depends(get_db)):
    db_department = Department(**department.model_dump())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

@router.get("/departments/{department_id}", response_model=DepartmentSchema)
def get_department(department_id: int, db: Session = Depends(get_db)):
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    return department

@router.put("/departments/{department_id}", response_model=DepartmentSchema)
def update_department(department_id: int, department_update: DepartmentUpdate, db: Session = Depends(get_db)):
    db_department = db.query(Department).filter(Department.id == department_id).first()
    if not db_department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    update_data = department_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_department, key, value)
    
    db.commit()
    db.refresh(db_department)
    return db_department

@router.delete("/departments/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(department_id: int, db: Session = Depends(get_db)):
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    # Check if department has any staff members
    staff_count = db.query(Staff).filter(Staff.department_id == department_id).count()
    if staff_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete department with assigned staff members"
        )
    
    db.delete(department)
    db.commit()
    return None

# Staff Group endpoints
@router.get("/groups", response_model=List[StaffGroupSchema])
def get_staff_groups(db: Session = Depends(get_db)):
    groups = db.query(StaffGroup).all()
    all_roles = db.query(Role).all()
    all_locations = db.query(getattr(db, 'Location', None) or Role).all() if hasattr(db, 'Location') else []
    result = []
    for group in groups:
        group_dict = group.__dict__.copy()
        # Members: list of staff objects in this group
        group_dict["members"] = [StaffSchema.model_validate(staff) for staff in getattr(group, "staff", [])]
        # Roles: empty list (no direct relationship in model, but structure for future)
        group_dict["roles"] = []
        # Locations: find locations where requiredGroups contains this group id
        group_dict["locations"] = []
        result.append(group_dict)
    return result

@router.post("/groups", response_model=StaffGroupSchema)
def create_staff_group(group: StaffGroupCreate, db: Session = Depends(get_db)):
    db_group = StaffGroup(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@router.put("/groups/{group_id}", response_model=StaffGroupSchema)
def update_staff_group(group_id: int, group: StaffGroupUpdate, db: Session = Depends(get_db)):
    db_group = db.query(StaffGroup).filter(StaffGroup.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Staff group not found")
    
    for key, value in group.model_dump(exclude_unset=True).items():
        setattr(db_group, key, value)
    
    db.commit()
    db.refresh(db_group)
    return db_group

@router.delete("/groups/{group_id}")
def delete_staff_group(group_id: int, db: Session = Depends(get_db)):
    db_group = db.query(StaffGroup).filter(StaffGroup.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Staff group not found")
    
    db.delete(db_group)
    db.commit()
    return {"message": "Staff group deleted successfully"}

# Staff endpoints (must come after specific endpoints)
@router.get("/", response_model=List[StaffSchema])
def get_staff_members(db: Session = Depends(get_db)):
    staff_list = db.query(Staff).all()
    result = []
    for staff in staff_list:
        department_obj = None
        if staff.department_id:
            department = db.query(Department).filter(Department.id == staff.department_id).first()
            if department:
                department_obj = DepartmentSchema.model_validate(department)
        staff_dict = staff.__dict__.copy()
        staff_dict["department"] = department_obj
        staff_dict["roles"] = [RoleSchema.model_validate(role) for role in staff.roles]
        result.append(staff_dict)
    return result

@router.post("/", response_model=StaffSchema)
def create_staff_member(staff: dict = Body(...), db: Session = Depends(get_db)):
    # Accepts department (name) and role(s) from the payload
    department_id = None
    if staff.get("department"):
        department = db.query(Department).filter(Department.name == staff["department"]).first()
        if not department:
            raise HTTPException(status_code=400, detail=f"Department '{staff['department']}' does not exist")
        department_id = department.id

    # Accept both 'role' (single) and 'role_ids' (multiple)
    role_ids = []
    if staff.get("role_ids"):
        try:
            role_ids = [int(rid) for rid in staff["role_ids"]]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid role_ids")
    elif staff.get("role"):
        try:
            role_id = int(staff["role"])
            role_ids.append(role_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid role id")

    # Validate all roles exist
    if role_ids:
        found_roles = db.query(Role).filter(Role.id.in_(role_ids)).all()
        if len(found_roles) != len(role_ids):
            raise HTTPException(status_code=400, detail="One or more roles do not exist")

    db_staff = Staff(
        name=staff["name"],
        email=staff["email"],
        department_id=department_id
    )
    if role_ids:
        db_staff.roles = found_roles

    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)

    # Prepare department object for response
    department_obj = None
    if db_staff.department_id:
        department = db.query(Department).filter(Department.id == db_staff.department_id).first()
        if department:
            department_obj = DepartmentSchema.model_validate(department)

    staff_dict = db_staff.__dict__.copy()
    staff_dict["department"] = department_obj
    staff_dict["roles"] = [RoleSchema.model_validate(role) for role in db_staff.roles]
    return staff_dict

@router.get("/{staff_id}", response_model=StaffSchema)
def get_staff_member(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    department_obj = None
    if staff.department_id:
        department = db.query(Department).filter(Department.id == staff.department_id).first()
        if department:
            department_obj = DepartmentSchema.model_validate(department)
    staff_dict = staff.__dict__.copy()
    staff_dict["department"] = department_obj
    staff_dict["roles"] = [RoleSchema.model_validate(role) for role in staff.roles]
    return staff_dict

@router.put("/{staff_id}", response_model=StaffSchema)
def update_staff_member(staff_id: int, staff_update: StaffUpdate, db: Session = Depends(get_db)):
    db_staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not db_staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    
    update_data = staff_update.model_dump(exclude_unset=True)
    if 'role_ids' in update_data:
        roles = db.query(Role).filter(Role.id.in_(update_data.pop('role_ids'))).all()
        if len(roles) != len(update_data.get('role_ids', [])):
            raise HTTPException(status_code=400, detail="One or more roles do not exist")
        db_staff.roles = roles
    
    for key, value in update_data.items():
        setattr(db_staff, key, value)
    
    db.commit()
    db.refresh(db_staff)

    # Prepare department object for response
    department_obj = None
    if db_staff.department_id:
        department = db.query(Department).filter(Department.id == db_staff.department_id).first()
        if department:
            department_obj = DepartmentSchema.model_validate(department)

    staff_dict = db_staff.__dict__.copy()
    staff_dict["department"] = department_obj
    staff_dict["roles"] = [RoleSchema.model_validate(role) for role in db_staff.roles]
    return staff_dict

@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff_member(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    db.delete(staff)
    db.commit()
    return None 