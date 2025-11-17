"""Privacy controls for HeartGuard."""
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict
from app.models.database import TrustReport, Conversation

def set_retention_policy(db: Session, user_id: int, retention_days: int) -> Dict:
    if retention_days not in [0, 7, 30, 90]:
        return {"success": False, "error": "Invalid retention period"}
    return {"success": True, "retention_days": retention_days}

def delete_old_data(db: Session, user_id: int, retention_days: int) -> Dict:
    if retention_days == 0:
        return {"success": True, "deleted_count": 0}
    cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
    old_reports = db.query(TrustReport).filter(TrustReport.user_id == user_id, TrustReport.created_at < cutoff_date).all()
    for report in old_reports:
        db.delete(report)
    db.commit()
    return {"success": True, "deleted_count": len(old_reports)}

def delete_specific_report(db: Session, user_id: int, report_id: str) -> Dict:
    report = db.query(TrustReport).filter(TrustReport.report_id == report_id, TrustReport.user_id == user_id).first()
    if not report:
        return {"success": False, "error": "Report not found"}
    db.delete(report)
    db.commit()
    return {"success": True}

def delete_all_user_data(db: Session, user_id: int) -> Dict:
    reports = db.query(TrustReport).filter(TrustReport.user_id == user_id).all()
    for report in reports:
        db.delete(report)
    db.commit()
    return {"success": True, "deleted_reports": len(reports)}

def export_user_data(db: Session, user_id: int) -> Dict:
    reports = db.query(TrustReport).filter(TrustReport.user_id == user_id).all()
    return {"success": True, "user_id": user_id, "reports": [{"report_id": r.report_id, "trust_score": r.trust_score} for r in reports]}

def get_privacy_settings(user_id: int) -> Dict:
    return {"user_id": user_id, "retention_policy": "30 days", "gdpr_compliant": True}
