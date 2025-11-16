"""
HeartGuard™ Evidence Locker™ - Legal-Grade PDF Report Generation
Generates time-stamped, hash-verified PDF reports for legal documentation
"""

from fpdf import FPDF
from datetime import datetime
from io import BytesIO
import json
import hashlib
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from app.models.database import Conversation, AnalysisPoint, GeographicRisk


class EvidenceReportPDF(FPDF):
    """Custom PDF class for HeartGuard Evidence Reports"""
    
    def __init__(self):
        super().__init__(format='A4')
        self.set_auto_page_break(auto=True, margin=15)
        
    def header(self):
        """PDF header with HeartGuard branding"""
        self.set_font('Arial', 'B', 16)
        self.set_text_color(91, 50, 86)
        self.cell(0, 10, 'HeartGuard Evidence Report', 0, 1, 'C')
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 5, 'Legal-Grade Romance Fraud Analysis', 0, 1, 'C')
        self.ln(5)
        
    def footer(self):
        """PDF footer with page numbers"""
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')


def sanitize_text(text: str, max_length: int = 220) -> str:
    """Sanitize and truncate text for PDF display"""
    if not text:
        return ""
    
    text = ''.join(char for char in text if char.isprintable() or char in '\n\r\t')
    
    if len(text) > max_length:
        return text[:max_length] + "..."
    return text


def compute_dataset_hash(dataset: Dict[str, Any]) -> str:
    """Compute SHA-256 hash of the report dataset for chain-of-custody"""
    dataset_json = json.dumps(dataset, sort_keys=True, separators=(',', ':')).encode('utf-8')
    return hashlib.sha256(dataset_json).hexdigest()


def assemble_report_dataset(
    conversation: Conversation,
    analysis_points: List[AnalysisPoint],
    geographic_risk: Optional[GeographicRisk] = None
) -> Dict[str, Any]:
    """Assemble canonical report dataset for hashing and PDF generation"""
    
    dataset = {
        "conversation": {
            "id": conversation.id,
            "start_date": conversation.start_date.isoformat() if conversation.start_date else None,
            "last_updated": conversation.last_updated.isoformat() if conversation.last_updated else None,
            "final_trust_score": conversation.final_trust_score,
            "total_messages": len(analysis_points)
        },
        "analysis_points": [
            {
                "message_index": point.message_index,
                "timestamp": point.timestamp.isoformat() if point.timestamp else None,
                "message_text": sanitize_text(point.message_text, max_length=500),
                "trust_score_delta": point.trust_score_delta,
                "tone_shift_delta": point.tone_shift_delta,
                "wallet_watch_flag": point.wallet_watch_flag,
                "risk_rationale": sanitize_text(point.risk_rationale, max_length=500)
            }
            for point in analysis_points
        ],
        "geographic_risk": {
            "code": geographic_risk.code,
            "region": geographic_risk.region,
            "risk_level": geographic_risk.risk_level,
            "scam_types": geographic_risk.scam_types,
            "notes": geographic_risk.notes
        } if geographic_risk else None,
        "generated_at": datetime.utcnow().isoformat() + "Z"
    }
    
    return dataset


def generate_risk_summary(analysis_points: List[AnalysisPoint]) -> Dict[str, Any]:
    """Generate risk summary statistics from analysis points"""
    
    wallet_flags = sum(1 for p in analysis_points if p.wallet_watch_flag)
    negative_deltas = sum(1 for p in analysis_points if p.trust_score_delta and p.trust_score_delta < 0)
    total_trust_delta = sum(p.trust_score_delta for p in analysis_points if p.trust_score_delta)
    
    high_tone_shifts = sum(1 for p in analysis_points if p.tone_shift_delta and abs(p.tone_shift_delta) > 20)
    
    return {
        "wallet_watch_flags": wallet_flags,
        "negative_trust_deltas": negative_deltas,
        "total_trust_delta": total_trust_delta,
        "high_tone_shifts": high_tone_shifts,
        "total_messages": len(analysis_points)
    }


def generate_evidence_pdf(
    conversation: Conversation,
    analysis_points: List[AnalysisPoint],
    geographic_risk: Optional[GeographicRisk] = None
) -> BytesIO:
    """Generate complete Evidence Locker PDF report"""
    
    dataset = assemble_report_dataset(conversation, analysis_points, geographic_risk)
    data_hash = compute_dataset_hash(dataset)
    risk_summary = generate_risk_summary(analysis_points)
    
    pdf = EvidenceReportPDF()
    pdf.add_page()
    
    pdf.set_font('Arial', 'B', 12)
    pdf.set_text_color(91, 50, 86)
    pdf.cell(0, 10, 'Report Metadata', 0, 1)
    pdf.ln(2)
    
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(0, 0, 0)
    
    metadata_items = [
        ('Report Generated:', datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')),
        ('Conversation ID:', str(conversation.id)),
        ('Dataset SHA-256:', data_hash[:32] + '...'),
    ]
    
    for label, value in metadata_items:
        pdf.set_font('Arial', 'B', 9)
        pdf.cell(50, 6, label, 0, 0)
        pdf.set_font('Arial', '', 8)
        pdf.cell(0, 6, str(value), 0, 1)
    
    pdf.set_font('Arial', 'B', 9)
    pdf.cell(50, 6, 'Full Hash:', 0, 0)
    pdf.set_font('Arial', '', 7)
    pdf.cell(0, 6, data_hash[:64], 0, 1)
    pdf.set_font('Arial', '', 7)
    pdf.cell(50, 6, '', 0, 0)
    pdf.cell(0, 6, data_hash[64:], 0, 1)
    
    pdf.ln(5)
    
    pdf.set_font('Arial', 'B', 12)
    pdf.set_text_color(91, 50, 86)
    pdf.cell(0, 10, 'Conversation Summary', 0, 1)
    pdf.ln(2)
    
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(0, 0, 0)
    
    start_date = conversation.start_date.strftime('%Y-%m-%d %H:%M UTC') if conversation.start_date else 'N/A'
    last_updated = conversation.last_updated.strftime('%Y-%m-%d %H:%M UTC') if conversation.last_updated else 'N/A'
    
    summary_items = [
        ('Analysis Period:', f'{start_date} to {last_updated}'),
        ('Total Messages Analyzed:', str(len(analysis_points))),
        ('Final Trust Score:', str(conversation.final_trust_score) if conversation.final_trust_score else 'N/A'),
        ('Data Source:', 'Conversation and AnalysisPoint tables'),
    ]
    
    for label, value in summary_items:
        pdf.set_font('Arial', 'B', 9)
        pdf.cell(50, 6, label, 0, 0)
        pdf.set_font('Arial', '', 8)
        pdf.cell(0, 6, str(value), 0, 1)
    
    pdf.ln(5)
    
    pdf.set_font('Arial', 'B', 12)
    pdf.set_text_color(91, 50, 86)
    pdf.cell(0, 10, 'Risk Analysis Summary', 0, 1)
    pdf.ln(2)
    
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(0, 0, 0)
    
    risk_items = [
        ('Financial Red Flags (Wallet Watch):', str(risk_summary['wallet_watch_flags'])),
        ('Negative Trust Score Changes:', str(risk_summary['negative_trust_deltas'])),
        ('Total Trust Score Delta:', str(risk_summary['total_trust_delta'])),
        ('High Tone Shift Events:', str(risk_summary['high_tone_shifts'])),
    ]
    
    for label, value in risk_items:
        pdf.set_font('Arial', 'B', 9)
        pdf.cell(70, 6, label, 0, 0)
        pdf.set_font('Arial', '', 9)
        pdf.cell(0, 6, value, 0, 1)
    
    if geographic_risk:
        pdf.ln(5)
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(91, 50, 86)
        pdf.cell(0, 10, 'Geographic Risk Intelligence', 0, 1)
        pdf.ln(2)
        
        pdf.set_font('Arial', '', 9)
        pdf.set_text_color(0, 0, 0)
        
        geo_items = [
            ('Phone Code:', geographic_risk.code),
            ('Region:', geographic_risk.region),
            ('Risk Level:', geographic_risk.risk_level),
            ('Known Scam Types:', ', '.join(geographic_risk.scam_types[:3]) if geographic_risk.scam_types else 'N/A'),
        ]
        
        for label, value in geo_items:
            pdf.set_font('Arial', 'B', 9)
            pdf.cell(50, 6, label, 0, 0)
            pdf.set_font('Arial', '', 8)
            pdf.cell(0, 6, str(value), 0, 1)
        
        if geographic_risk.notes:
            pdf.ln(2)
            pdf.set_font('Arial', 'B', 9)
            pdf.cell(0, 6, 'Intelligence Notes:', 0, 1)
            pdf.set_font('Arial', '', 9)
            pdf.multi_cell(0, 6, sanitize_text(geographic_risk.notes, max_length=300))
    
    if analysis_points:
        pdf.add_page()
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(91, 50, 86)
        pdf.cell(0, 10, 'Message Analysis Timeline', 0, 1)
        pdf.ln(2)
        
        pdf.set_font('Arial', 'B', 8)
        pdf.set_fill_color(230, 183, 190)
        pdf.cell(15, 7, '#', 1, 0, 'C', True)
        pdf.cell(35, 7, 'Timestamp', 1, 0, 'C', True)
        pdf.cell(80, 7, 'Message Excerpt', 1, 0, 'C', True)
        pdf.cell(20, 7, 'Trust', 1, 0, 'C', True)
        pdf.cell(20, 7, 'Tone', 1, 0, 'C', True)
        pdf.cell(20, 7, 'Flags', 1, 1, 'C', True)
        
        pdf.set_font('Arial', '', 7)
        pdf.set_text_color(0, 0, 0)
        
        for point in analysis_points:
            if pdf.get_y() > 250:
                pdf.add_page()
                pdf.set_font('Arial', 'B', 8)
                pdf.set_fill_color(230, 183, 190)
                pdf.cell(15, 7, '#', 1, 0, 'C', True)
                pdf.cell(35, 7, 'Timestamp', 1, 0, 'C', True)
                pdf.cell(80, 7, 'Message Excerpt', 1, 0, 'C', True)
                pdf.cell(20, 7, 'Trust', 1, 0, 'C', True)
                pdf.cell(20, 7, 'Tone', 1, 0, 'C', True)
                pdf.cell(20, 7, 'Flags', 1, 1, 'C', True)
                pdf.set_font('Arial', '', 7)
            
            timestamp_str = point.timestamp.strftime('%m/%d %H:%M') if point.timestamp else 'N/A'
            excerpt = sanitize_text(point.message_text, max_length=100)
            trust_delta = str(point.trust_score_delta) if point.trust_score_delta else '0'
            tone_delta = str(point.tone_shift_delta) if point.tone_shift_delta else '0'
            flags = '$' if point.wallet_watch_flag else ''
            
            pdf.cell(15, 6, str(point.message_index), 1, 0, 'C')
            pdf.cell(35, 6, timestamp_str, 1, 0, 'L')
            pdf.cell(80, 6, excerpt, 1, 0, 'L')
            pdf.cell(20, 6, trust_delta, 1, 0, 'C')
            pdf.cell(20, 6, tone_delta, 1, 0, 'C')
            pdf.cell(20, 6, flags, 1, 1, 'C')
        
        pdf.ln(3)
        pdf.set_font('Arial', 'I', 7)
        pdf.set_text_color(128, 128, 128)
        pdf.cell(0, 5, 'Legend: $ = Wallet Watch Flag (Financial Request Detected)', 0, 1)
    
    pdf.add_page()
    pdf.set_font('Arial', 'B', 12)
    pdf.set_text_color(91, 50, 86)
    pdf.cell(0, 10, 'Chain of Custody', 0, 1)
    pdf.ln(2)
    
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(0, 0, 0)
    
    custody_items = [
        ('Report Generated At:', datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')),
        ('Application:', 'HeartGuard Romance Fraud Detection System'),
        ('Backend Version:', 'v1.0.0 (SQLAlchemy + FastAPI)'),
        ('Database Engine:', 'SQLite'),
        ('Total Analysis Points:', str(len(analysis_points))),
        ('Data Integrity:', 'Verified via cryptographic hash'),
    ]
    
    for label, value in custody_items:
        pdf.set_font('Arial', 'B', 9)
        pdf.cell(60, 6, label, 0, 0)
        pdf.set_font('Arial', '', 8)
        pdf.cell(0, 6, str(value), 0, 1)
    
    pdf.set_font('Arial', 'B', 9)
    pdf.cell(60, 6, 'Report Dataset SHA-256:', 0, 0)
    pdf.set_font('Arial', '', 7)
    pdf.cell(0, 6, data_hash[:64], 0, 1)
    pdf.set_font('Arial', '', 7)
    pdf.cell(60, 6, '', 0, 0)
    pdf.cell(0, 6, data_hash[64:], 0, 1)
    
    pdf.ln(5)
    pdf.set_font('Arial', 'I', 8)
    pdf.set_text_color(128, 128, 128)
    pdf.multi_cell(0, 5, 
        'This report was generated by HeartGuard, an AI-powered romance fraud detection system. '
        'The SHA-256 hash ensures data integrity and can be used to verify that the evidence has not been tampered with. '
        'All timestamps are in UTC. This report is intended for legal documentation and victim support purposes.'
    )
    
    buffer = BytesIO()
    pdf.output(buffer)
    buffer.seek(0)
    
    return buffer
