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
import qrcode
import os

from app.models.database import Conversation, AnalysisPoint, GeographicRisk, EvidenceReport, ScammerProfile, SocialHandle, PaymentInstruction


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
        """PDF footer with page numbers and verification watermark"""
        self.set_y(-15)
        self.set_font('Arial', 'I', 7)
        self.set_text_color(128, 128, 128)
        self.cell(0, 5, f'Page {self.page_no()}', 0, 1, 'C')
        
        if hasattr(self, 'verification_hash'):
            self.set_font('Arial', 'I', 6)
            self.set_text_color(100, 100, 100)
            verify_text = f'Verify at heart-guard-mvp-2.vercel.app/verify | Hash: {self.verification_hash[:16]}...'
            self.cell(0, 5, verify_text, 0, 0, 'C')


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
    geographic_risk: Optional[GeographicRisk] = None,
    scammer_profile: Optional[ScammerProfile] = None
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
        "scammer_profile": {
            "claimed_name": scammer_profile.claimed_name,
            "aliases": scammer_profile.aliases,
            "claimed_dob": scammer_profile.claimed_dob,
            "claimed_address": scammer_profile.claimed_address,
            "claimed_occupation": scammer_profile.claimed_occupation,
            "phone_numbers": scammer_profile.phone_numbers,
            "email_addresses": scammer_profile.email_addresses,
            "platform_met": scammer_profile.platform_met,
            "first_contact_date": scammer_profile.first_contact_date,
            "last_contact_date": scammer_profile.last_contact_date,
            "communication_channels": scammer_profile.communication_channels,
            "total_amount_requested": scammer_profile.total_amount_requested,
            "total_amount_sent": scammer_profile.total_amount_sent,
            "currency": scammer_profile.currency,
            "victim_narrative": scammer_profile.victim_narrative,
            "ic3_complaint_number": scammer_profile.ic3_complaint_number,
            "ftc_report_id": scammer_profile.ftc_report_id,
            "police_incident_number": scammer_profile.police_incident_number,
            "other_agency_references": scammer_profile.other_agency_references,
            "social_handles": [
                {
                    "platform": h.platform,
                    "username": h.username,
                    "profile_url": h.profile_url,
                    "profile_id": h.profile_id,
                    "notes": h.notes
                }
                for h in scammer_profile.social_handles
            ] if scammer_profile.social_handles else [],
            "payment_instructions": [
                {
                    "method": p.method,
                    "bank_name": p.bank_name,
                    "account_holder_name": p.account_holder_name,
                    "account_number": p.account_number[-4:] if p.account_number else None,
                    "routing_number": p.routing_number,
                    "swift_code": p.swift_code,
                    "iban": p.iban,
                    "receiver_name": p.receiver_name,
                    "receiver_city": p.receiver_city,
                    "receiver_country": p.receiver_country,
                    "pickup_location": p.pickup_location,
                    "app_handle": p.app_handle,
                    "crypto_chain": p.crypto_chain,
                    "crypto_address": p.crypto_address,
                    "crypto_memo": p.crypto_memo,
                    "exchange_platform": p.exchange_platform,
                    "exchange_uid": p.exchange_uid,
                    "gift_card_brand": p.gift_card_brand,
                    "gift_card_amount": p.gift_card_amount,
                    "amount_requested": p.amount_requested,
                    "notes": p.notes
                }
                for p in scammer_profile.payment_instructions
            ] if scammer_profile.payment_instructions else []
        } if scammer_profile else None,
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


def generate_qr_code(data: str, size: int = 100) -> str:
    """Generate QR code and save to temp file, return file path"""
    try:
        qr = qrcode.QRCode(version=1, box_size=10, border=2)
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        temp_path = f"/tmp/qr_{hashlib.md5(data.encode()).hexdigest()}.png"
        img.save(temp_path)
        
        if os.path.exists(temp_path):
            file_size = os.path.getsize(temp_path)
            print(f"✅ QR code generated successfully: {temp_path} ({file_size} bytes)")
        else:
            print(f"❌ QR code file not created: {temp_path}")
        
        return temp_path
    except Exception as e:
        print(f"❌ QR code generation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return ""


def generate_evidence_pdf(
    conversation: Conversation,
    analysis_points: List[AnalysisPoint],
    geographic_risk: Optional[GeographicRisk] = None,
    scammer_profile: Optional[ScammerProfile] = None,
    app_version: str = "1.0.0",
    backend_version: str = "1.0.0"
) -> tuple[BytesIO, str, Dict[str, Any]]:
    """Generate complete Evidence Locker PDF report
    
    Returns:
        tuple: (pdf_buffer, dataset_hash, report_data)
    """
    
    dataset = assemble_report_dataset(conversation, analysis_points, geographic_risk, scammer_profile)
    data_hash = compute_dataset_hash(dataset)
    risk_summary = generate_risk_summary(analysis_points)
    
    pdf = EvidenceReportPDF()
    pdf.verification_hash = data_hash
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
    
    if scammer_profile:
        pdf.add_page()
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(91, 50, 86)
        pdf.cell(0, 10, 'Suspected Scammer Profile', 0, 1)
        pdf.ln(2)
        
        pdf.set_font('Arial', '', 9)
        pdf.set_text_color(0, 0, 0)
        
        if scammer_profile.claimed_name or scammer_profile.claimed_dob or scammer_profile.claimed_address or scammer_profile.claimed_occupation:
            pdf.set_font('Arial', 'B', 10)
            pdf.set_text_color(91, 50, 86)
            pdf.cell(0, 8, 'Identity Information', 0, 1)
            pdf.ln(1)
            
            pdf.set_font('Arial', '', 9)
            pdf.set_text_color(0, 0, 0)
            
            if scammer_profile.claimed_name:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Claimed Name:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, scammer_profile.claimed_name, 0, 1)
            
            if scammer_profile.aliases:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Known Aliases:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, ', '.join(scammer_profile.aliases), 0, 1)
            
            if scammer_profile.claimed_dob:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Claimed DOB:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, scammer_profile.claimed_dob, 0, 1)
            
            if scammer_profile.claimed_occupation:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Claimed Occupation:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, scammer_profile.claimed_occupation, 0, 1)
            
            if scammer_profile.claimed_address:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Claimed Address:', 0, 0)
                pdf.set_font('Arial', '', 8)
                pdf.multi_cell(0, 6, sanitize_text(scammer_profile.claimed_address, max_length=200))
            
            pdf.ln(3)
        
        if scammer_profile.phone_numbers or scammer_profile.email_addresses or scammer_profile.social_handles:
            pdf.set_font('Arial', 'B', 10)
            pdf.set_text_color(91, 50, 86)
            pdf.cell(0, 8, 'Contact Information', 0, 1)
            pdf.ln(1)
            
            pdf.set_font('Arial', '', 9)
            pdf.set_text_color(0, 0, 0)
            
            if scammer_profile.phone_numbers:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Phone Numbers:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, ', '.join(scammer_profile.phone_numbers), 0, 1)
            
            if scammer_profile.email_addresses:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Email Addresses:', 0, 0)
                pdf.set_font('Arial', '', 8)
                pdf.multi_cell(0, 6, ', '.join(scammer_profile.email_addresses))
            
            if scammer_profile.social_handles:
                pdf.ln(2)
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(0, 6, 'Social Media Profiles:', 0, 1)
                pdf.ln(1)
                
                for handle in scammer_profile.social_handles:
                    pdf.set_font('Arial', 'B', 8)
                    pdf.cell(30, 5, f'{handle.platform}:', 0, 0)
                    pdf.set_font('Arial', '', 8)
                    handle_info = handle.username or handle.profile_url or handle.profile_id or 'N/A'
                    pdf.cell(0, 5, sanitize_text(handle_info, max_length=100), 0, 1)
            
            pdf.ln(3)
        
        if scammer_profile.platform_met or scammer_profile.first_contact_date or scammer_profile.communication_channels:
            pdf.set_font('Arial', 'B', 10)
            pdf.set_text_color(91, 50, 86)
            pdf.cell(0, 8, 'Meeting Context', 0, 1)
            pdf.ln(1)
            
            pdf.set_font('Arial', '', 9)
            pdf.set_text_color(0, 0, 0)
            
            if scammer_profile.platform_met:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Platform Met:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, scammer_profile.platform_met, 0, 1)
            
            if scammer_profile.first_contact_date:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'First Contact:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, scammer_profile.first_contact_date, 0, 1)
            
            if scammer_profile.last_contact_date:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Last Contact:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, scammer_profile.last_contact_date, 0, 1)
            
            if scammer_profile.communication_channels:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Channels Used:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, ', '.join(scammer_profile.communication_channels), 0, 1)
            
            pdf.ln(3)
        
        if scammer_profile.total_amount_requested or scammer_profile.total_amount_sent or scammer_profile.payment_instructions:
            pdf.set_font('Arial', 'B', 10)
            pdf.set_text_color(91, 50, 86)
            pdf.cell(0, 8, 'Financial Evidence', 0, 1)
            pdf.ln(1)
            
            pdf.set_font('Arial', '', 9)
            pdf.set_text_color(0, 0, 0)
            
            if scammer_profile.total_amount_requested:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Total Requested:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, f'{scammer_profile.currency} {scammer_profile.total_amount_requested:,.2f}', 0, 1)
            
            if scammer_profile.total_amount_sent:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Total Sent/Lost:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, f'{scammer_profile.currency} {scammer_profile.total_amount_sent:,.2f}', 0, 1)
            
            if scammer_profile.payment_instructions:
                pdf.ln(2)
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(0, 6, 'Payment Instructions Provided:', 0, 1)
                pdf.ln(1)
                
                for idx, payment in enumerate(scammer_profile.payment_instructions, 1):
                    pdf.set_font('Arial', 'B', 8)
                    pdf.cell(0, 5, f'#{idx} - {payment.method}', 0, 1)
                    pdf.set_font('Arial', '', 8)
                    
                    if payment.bank_name:
                        pdf.cell(5, 5, '', 0, 0)
                        pdf.cell(40, 5, 'Bank:', 0, 0)
                        pdf.cell(0, 5, payment.bank_name, 0, 1)
                    if payment.account_holder_name:
                        pdf.cell(5, 5, '', 0, 0)
                        pdf.cell(40, 5, 'Account Holder:', 0, 0)
                        pdf.cell(0, 5, payment.account_holder_name, 0, 1)
                    if payment.account_number:
                        pdf.cell(5, 5, '', 0, 0)
                        pdf.cell(40, 5, 'Account:', 0, 0)
                        masked = '****' + payment.account_number[-4:] if len(payment.account_number) > 4 else payment.account_number
                        pdf.cell(0, 5, masked, 0, 1)
                    if payment.receiver_name:
                        pdf.cell(5, 5, '', 0, 0)
                        pdf.cell(40, 5, 'Receiver:', 0, 0)
                        pdf.cell(0, 5, payment.receiver_name, 0, 1)
                    if payment.receiver_city or payment.receiver_country:
                        pdf.cell(5, 5, '', 0, 0)
                        pdf.cell(40, 5, 'Location:', 0, 0)
                        location = f"{payment.receiver_city}, {payment.receiver_country}" if payment.receiver_city and payment.receiver_country else payment.receiver_city or payment.receiver_country
                        pdf.cell(0, 5, location, 0, 1)
                    if payment.crypto_address:
                        pdf.cell(5, 5, '', 0, 0)
                        pdf.cell(40, 5, 'Crypto Address:', 0, 0)
                        pdf.cell(0, 5, payment.crypto_address[:20] + '...', 0, 1)
                    if payment.app_handle:
                        pdf.cell(5, 5, '', 0, 0)
                        pdf.cell(40, 5, 'App Handle:', 0, 0)
                        pdf.cell(0, 5, payment.app_handle, 0, 1)
                    if payment.amount_requested:
                        pdf.cell(5, 5, '', 0, 0)
                        pdf.cell(40, 5, 'Amount:', 0, 0)
                        pdf.cell(0, 5, f'{scammer_profile.currency} {payment.amount_requested:,.2f}', 0, 1)
                    
                    pdf.ln(1)
            
            pdf.ln(3)
        
        if scammer_profile.victim_narrative:
            pdf.set_font('Arial', 'B', 10)
            pdf.set_text_color(91, 50, 86)
            pdf.cell(0, 8, 'Victim Statement', 0, 1)
            pdf.ln(1)
            
            pdf.set_font('Arial', '', 9)
            pdf.set_text_color(0, 0, 0)
            pdf.multi_cell(0, 5, sanitize_text(scammer_profile.victim_narrative, max_length=1000))
            pdf.ln(3)
        
        if scammer_profile.ic3_complaint_number or scammer_profile.ftc_report_id or scammer_profile.police_incident_number:
            pdf.set_font('Arial', 'B', 10)
            pdf.set_text_color(91, 50, 86)
            pdf.cell(0, 8, 'Agency Reports Filed', 0, 1)
            pdf.ln(1)
            
            pdf.set_font('Arial', '', 9)
            pdf.set_text_color(0, 0, 0)
            
            if scammer_profile.ic3_complaint_number:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'IC3 Complaint #:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, scammer_profile.ic3_complaint_number, 0, 1)
            
            if scammer_profile.ftc_report_id:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'FTC Report ID:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, scammer_profile.ftc_report_id, 0, 1)
            
            if scammer_profile.police_incident_number:
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(50, 6, 'Police Incident #:', 0, 0)
                pdf.set_font('Arial', '', 9)
                pdf.cell(0, 6, scammer_profile.police_incident_number, 0, 1)
            
            pdf.ln(3)
    
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
        ('App Version:', f'v{app_version}'),
        ('Backend Version:', f'v{backend_version} (SQLAlchemy + FastAPI)'),
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
    
    verify_url = f"https://heart-guard-mvp-2.vercel.app/verify?hash={data_hash}"
    qr_path = generate_qr_code(verify_url)
    
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(91, 50, 86)
    pdf.cell(0, 8, 'Evidence Verification', 0, 1)
    pdf.ln(2)
    
    pdf.set_font('Arial', '', 8)
    pdf.set_text_color(0, 0, 0)
    pdf.multi_cell(0, 5, 
        'Scan the QR code below or visit heart-guard-mvp-2.vercel.app/verify to verify this report\'s authenticity. '
        'The verification system will confirm that this evidence has not been tampered with.'
    )
    pdf.ln(3)
    
    if qr_path and os.path.exists(qr_path):
        try:
            pdf.image(qr_path, x=80, w=50)
            print(f"✅ QR code embedded in PDF successfully")
            os.remove(qr_path)
        except Exception as e:
            print(f"❌ Failed to embed QR code in PDF: {str(e)}")
    else:
        print(f"❌ QR code file not found, skipping embedding: {qr_path}")
        pdf.set_font('Arial', 'B', 9)
        pdf.cell(0, 6, 'Verification URL:', 0, 1)
        pdf.set_font('Arial', '', 8)
        pdf.multi_cell(0, 5, verify_url)
    
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
    
    report_data = {
        "conversation_id": conversation.id,
        "dataset_hash": data_hash,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_messages": len(analysis_points),
        "final_trust_score": conversation.final_trust_score,
        "app_version": app_version,
        "backend_version": backend_version
    }
    
    return buffer, data_hash, report_data
