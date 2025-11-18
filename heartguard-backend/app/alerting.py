"""
Real-time alerting system for Guardian Mode.
Triggers alerts when Trust Scores breach thresholds.
"""

from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from app.models.database import TrustedContact, AlertLog


def check_and_trigger_alerts(
    db: Session,
    user_identifier: str,
    trust_score: int,
    emi: float,
    has_financial_request: bool,
    conversation_id: Optional[str] = None
) -> List[dict]:
    """
    Check if alerts should be triggered based on Trust Score and risk factors.
    
    Args:
        db: Database session
        user_identifier: User ID or conversation ID
        trust_score: Current Trust Score (0-100)
        emi: Emotional Manipulation Index (0-1)
        has_financial_request: Whether financial request was detected
        conversation_id: Optional conversation ID for context
        
    Returns:
        List of triggered alerts with status
    """
    contacts = db.query(TrustedContact).filter(
        TrustedContact.user_identifier == user_identifier,
        TrustedContact.is_active == True
    ).order_by(TrustedContact.escalation_order).all()
    
    if not contacts:
        contacts = db.query(TrustedContact).filter(
            TrustedContact.user_identifier == 'global',
            TrustedContact.is_active == True
        ).order_by(TrustedContact.escalation_order).all()
    
    if not contacts:
        return []
    
    triggered_alerts = []
    
    for contact in contacts:
        should_alert = False
        reason = []
        
        if trust_score <= contact.alert_threshold:
            should_alert = True
            reason.append(f"Trust Score dropped to {trust_score} (threshold: {contact.alert_threshold})")
        
        if emi >= 0.7:
            should_alert = True
            reason.append(f"High emotional manipulation detected (EMI: {emi:.2f})")
        
        if has_financial_request:
            should_alert = True
            reason.append("Financial request detected in conversation")
        
        if should_alert:
            alert_log = AlertLog(
                user_identifier=user_identifier,
                contact_id=contact.id,
                trust_score=trust_score,
                threshold=contact.alert_threshold,
                channel="email",  # Default to email for now
                reason="; ".join(reason),
                status="pending"
            )
            db.add(alert_log)
            
            email_sent = send_email_alert(
                contact_email=contact.contact_email,
                contact_name=contact.contact_name,
                trust_score=trust_score,
                reason="; ".join(reason),
                conversation_id=conversation_id
            )
            
            if email_sent:
                alert_log.status = "sent"
                contact.last_alert_timestamp = datetime.utcnow()
            else:
                alert_log.status = "failed"
            
            db.commit()
            
            triggered_alerts.append({
                "contact_name": contact.contact_name,
                "contact_email": contact.contact_email,
                "trust_score": trust_score,
                "reason": "; ".join(reason),
                "status": alert_log.status
            })
    
    return triggered_alerts


def send_email_alert(
    contact_email: str,
    contact_name: str,
    trust_score: int,
    reason: str,
    conversation_id: Optional[str] = None
) -> bool:
    """
    Send email alert to trusted contact.
    
    Args:
        contact_email: Email address of trusted contact
        contact_name: Name of trusted contact
        trust_score: Current Trust Score
        reason: Reason for alert
        conversation_id: Optional conversation ID
        
    Returns:
        True if email sent successfully, False otherwise
    """
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT", "587")
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("FROM_EMAIL", "alerts@heartguard.app")
    
    if not all([smtp_server, smtp_username, smtp_password]):
        print(f"⚠️ Email credentials not configured. Alert would be sent to {contact_email}")
        return False  # Credentials not configured
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🛡️ HeartGuard™ Alert: Trust Score {trust_score}"
        msg["From"] = from_email
        msg["To"] = contact_email
        
        text_body = f"""
Hi {contact_name},

This is an automated alert from HeartGuard™ Guardian Mode.

⚠️ ALERT TRIGGERED

Trust Score: {trust_score}/100
Reason: {reason}

Your loved one may be at risk of a romance scam. We recommend:
1. Check in with them immediately
2. Ask about any recent online relationships
3. Verify they haven't sent money or shared financial information
4. Encourage them to use HeartGuard™ to analyze the conversation

Conversation ID: {conversation_id or 'N/A'}

View full report: https://heart-guard-mvp-2.vercel.app

---
HeartGuard™ Guardian Mode
Protecting vulnerable users from romance scams
"""
        
        html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🛡️ HeartGuard™ Alert</h1>
    </div>
    
    <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151;">Hi {contact_name},</p>
        
        <p style="font-size: 16px; color: #374151;">This is an automated alert from HeartGuard™ Guardian Mode.</p>
        
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h2 style="color: #991b1b; margin: 0 0 10px 0; font-size: 18px;">⚠️ ALERT TRIGGERED</h2>
            <p style="margin: 5px 0; color: #7f1d1d;"><strong>Trust Score:</strong> {trust_score}/100</p>
            <p style="margin: 5px 0; color: #7f1d1d;"><strong>Reason:</strong> {reason}</p>
        </div>
        
        <p style="font-size: 16px; color: #374151;">Your loved one may be at risk of a romance scam. We recommend:</p>
        
        <ol style="font-size: 15px; color: #4b5563; line-height: 1.8;">
            <li>Check in with them immediately</li>
            <li>Ask about any recent online relationships</li>
            <li>Verify they haven't sent money or shared financial information</li>
            <li>Encourage them to use HeartGuard™ to analyze the conversation</li>
        </ol>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            <strong>Conversation ID:</strong> {conversation_id or 'N/A'}
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://heart-guard-mvp-2.vercel.app" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold;
                      display: inline-block;">
                View Full Report
            </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            HeartGuard™ Guardian Mode<br>
            Protecting vulnerable users from romance scams
        </p>
    </div>
</body>
</html>
"""
        
        part1 = MIMEText(text_body, "plain")
        part2 = MIMEText(html_body, "html")
        msg.attach(part1)
        msg.attach(part2)
        
        with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        print(f"✅ Alert email sent to {contact_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email alert: {str(e)}")
        return False


def send_sms_alert(
    contact_phone: str,
    contact_name: str,
    trust_score: int,
    reason: str
) -> bool:
    """
    Send SMS alert to trusted contact (placeholder for future implementation).
    
    Args:
        contact_phone: Phone number of trusted contact
        contact_name: Name of trusted contact
        trust_score: Current Trust Score
        reason: Reason for alert
        
    Returns:
        True if SMS sent successfully, False otherwise
    """
    print(f"📱 SMS alert would be sent to {contact_phone}: Trust Score {trust_score}")
    return False
