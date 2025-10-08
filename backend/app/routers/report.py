from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..config.database import get_db
from .. import models, schemas
from ..oauth2 import get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.post("/", response_model=schemas.ReportNew)
def create_report(
    report: schemas.ReportBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_report = models.Report(**report.dict())
    db_report.report_by = current_user.id
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@router.get("/", response_model=List[schemas.ReportBase])
def get_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    reports = db.query(models.Report).filter(
        models.Report.report_by == current_user.id,
        models.Report.active == True
    ).offset(skip).limit(limit).all()
    return reports

@router.get("/{report_id}", response_model=schemas.ReportData)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    report = db.query(models.Report).filter(
        models.Report.id == report_id,
        models.Report.report_by == current_user.id,
        models.Report.active == True
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.put("/{report_id}", response_model=schemas.ReportFinal)
def update_report(
    report_id: int,
    report_update: schemas.ReportUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_report = db.query(models.Report).filter(
        models.Report.id == report_id,
        models.Report.report_by == current_user.id,
        models.Report.active == True
    ).first()
    
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    for key, value in report_update.dict().items():
        setattr(db_report, key, value)
    
    db.commit()
    db.refresh(db_report)
    return db_report

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_report = db.query(models.Report).filter(
        models.Report.id == report_id,
        models.Report.report_by == current_user.id,
        models.Report.active == True
    ).first()
    
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    db_report.active = False
    db.commit()
    return None 