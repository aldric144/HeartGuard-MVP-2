from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
import base64
import hashlib
import re
from datetime import datetime
from textblob import TextBlob
from PIL import Image
import io
import uuid
from dotenv import load_dotenv
import os
import httpx

from app.models.database import (
    Base, engine, get_db, init_db,
    User, TrustReport as DBTrustReport, 
    PhotoAnalysis as DBPhotoAnalysis,
    ChatAnalysis as DBChatAnalysis,
    ManipulationPattern as DBManipulationPattern,
    AnalysisHistory,
    Conversation as DBConversation,
    AnalysisPoint as DBAnalysisPoint,
    GeographicRisk,
    ScammerProfile as DBScammerProfile,
    SocialHandle as DBSocialHandle,
    PaymentInstruction as DBPaymentInstruction,
    populate_geographic_risks
)
from app.toneshift_engine import toneshift_engine
from app.evidence_locker import generate_evidence_pdf
from app.alerting import check_and_trigger_alerts
from app.safety_nudges import generate_safety_nudges, get_safepay_checklist
from app.usage_tracking import get_or_create_user, check_usage_limit, increment_usage, get_tier_features
import re

load_dotenv()

TRUST_SCORE_WEIGHTS = {
    'toneshift': 0.50,
    'walletwatch': 0.30,
    'photo': 0.15,
    'metadata': 0.05
}

app = FastAPI()

def normalize_phone_number(phone_input: str) -> str:
    """Normalize phone number to standard format for matching.
    Handles formats like: +234-123-456, +1 (876) 555-1234, 1-876-555-1234, etc.
    Returns normalized format: +XXX or +1-XXX for NANPA codes."""
    if not phone_input:
        return ""
    
    cleaned = re.sub(r'[^\d+\-]', '', phone_input.strip())
    
    if not cleaned.startswith('+'):
        if cleaned.startswith('1') and len(cleaned) >= 4:
            cleaned = '+' + cleaned
        else:
            cleaned = '+' + cleaned
    
    if cleaned.startswith('+1'):
        digits = re.sub(r'[^\d]', '', cleaned[2:])
        if len(digits) >= 3:
            area_code = digits[:3]
            return f"+1-{area_code}"
    
    return cleaned

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://heart-guard-mvp-2.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

@app.on_event("startup")
async def startup_event():
    from app.models.database import populate_safety_replies
    init_db()
    populate_geographic_risks()
    populate_safety_replies()

class ChatAnalysisRequest(BaseModel):
    messages: List[str]

class PhotoAnalysisResponse(BaseModel):
    image_hash: str
    reverse_image_matches: int
    duplication_score: int
    metadata_integrity_score: int
    final_photo_score: int
    deepfake_confidence: str
    metadata_issues: List[str]
    risk_level: str

class ManipulationPattern(BaseModel):
    pattern_type: str
    severity: str
    evidence: str
    timestamp: Optional[str] = None

class ChatAnalysisResponse(BaseModel):
    sentiment_drift: List[Dict[str, float]]
    manipulation_patterns: List[ManipulationPattern]
    emotional_manipulation_index: float
    risk_level: str

class MetadataAnalysisResponse(BaseModel):
    profile_age_score: int
    consistency_score: int
    location_risk_score: int
    final_metadata_score: int
    profile_age_days: int
    consistency_issues: List[str]
    location_risk_rationale: Optional[str] = None
    is_known_scam_origin: bool = False

class WeightedComponent(BaseModel):
    engine: str
    score: float
    weight: float
    contribution: float

class TrustScoreReport(BaseModel):
    report_id: str
    trust_score: int
    confidence_level: str
    color_band: str
    top_risk_insights: List[str]
    photo_analysis: Optional[PhotoAnalysisResponse] = None
    chat_analysis: Optional[ChatAnalysisResponse] = None
    created_at: str
    conversation_id: Optional[str] = None
    weighted_breakdown: List[WeightedComponent] = []
    safety_nudges: List[Dict] = []

class TimelineMessage(BaseModel):
    message_index: int
    message_text: str
    timestamp: str
    trust_score_delta: int
    tone_shift_delta: int
    wallet_watch_flag: bool
    risk_rationale: str

class TimelineResponse(BaseModel):
    conversation_id: str
    final_trust_score: int
    start_date: str
    last_updated: str
    message_count: int
    messages: List[TimelineMessage]

class PatternAnalytics(BaseModel):
    total_conversations: int
    high_risk_conversations: int
    average_trust_score: float
    most_common_patterns: List[dict]
    financial_request_stats: dict
    average_message_count: float

class LocationRiskResponse(BaseModel):
    is_known_scam_origin: bool
    location_risk_score: int
    risk_rationale: str
    matched_code: Optional[str] = None
    region: Optional[str] = None
    risk_level: Optional[str] = None

class SocialHandleInput(BaseModel):
    platform: str
    username: Optional[str] = None
    profile_url: Optional[str] = None
    profile_id: Optional[str] = None
    notes: Optional[str] = None

class PaymentInstructionInput(BaseModel):
    method: str
    bank_name: Optional[str] = None
    account_holder_name: Optional[str] = None
    account_number: Optional[str] = None
    routing_number: Optional[str] = None
    swift_code: Optional[str] = None
    iban: Optional[str] = None
    receiver_name: Optional[str] = None
    receiver_city: Optional[str] = None
    receiver_country: Optional[str] = None
    pickup_location: Optional[str] = None
    app_handle: Optional[str] = None
    crypto_chain: Optional[str] = None
    crypto_address: Optional[str] = None
    crypto_memo: Optional[str] = None
    exchange_platform: Optional[str] = None
    exchange_uid: Optional[str] = None
    gift_card_brand: Optional[str] = None
    gift_card_amount: Optional[float] = None
    amount_requested: Optional[float] = None
    notes: Optional[str] = None

class ScammerProfileInput(BaseModel):
    claimed_name: Optional[str] = None
    aliases: Optional[List[str]] = None
    claimed_dob: Optional[str] = None
    claimed_address: Optional[str] = None
    claimed_occupation: Optional[str] = None
    phone_numbers: Optional[List[str]] = None
    email_addresses: Optional[List[str]] = None
    platform_met: Optional[str] = None
    first_contact_date: Optional[str] = None
    last_contact_date: Optional[str] = None
    communication_channels: Optional[List[str]] = None
    total_amount_requested: Optional[float] = None
    total_amount_sent: Optional[float] = None
    currency: Optional[str] = "USD"
    victim_narrative: Optional[str] = None
    ic3_complaint_number: Optional[str] = None
    ftc_report_id: Optional[str] = None
    police_incident_number: Optional[str] = None
    other_agency_references: Optional[List[str]] = None
    social_handles: Optional[List[SocialHandleInput]] = None
    payment_instructions: Optional[List[PaymentInstructionInput]] = None

class IPIntelligenceResponse(BaseModel):
    ip: str
    success: bool
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    isp: Optional[str] = None
    organization: Optional[str] = None
    asn: Optional[str] = None
    is_vpn: bool = False
    is_proxy: bool = False
    is_tor: bool = False
    is_datacenter: bool = False
    risk_score: int = 0
    risk_level: str = "Unknown"
    message: Optional[str] = None

def detect_deepfake(image_data: bytes) -> tuple[str, List[str]]:
    try:
        img = Image.open(io.BytesIO(image_data))
        width, height = img.size
        format_type = img.format
        
        issues = []
        confidence = "Real"
        
        if width < 200 or height < 200:
            issues.append("Image resolution unusually low for profile photo")
            confidence = "Suspicious"
        
        if format_type and format_type.upper() in ["WEBP", "BMP"]:
            issues.append("Image format commonly used in manipulated photos")
            confidence = "Suspicious"
        
        try:
            exif_data = img._getexif()
            if not exif_data or len(exif_data) < 3:
                issues.append("Missing or minimal EXIF metadata (possible editing)")
                confidence = "Suspicious"
        except:
            issues.append("No EXIF data found (possible synthetic image)")
            confidence = "Suspicious"
        
        return confidence, issues
    except Exception as e:
        return "Unknown", [f"Error analyzing image: {str(e)}"]

def simulate_reverse_image_search(image_hash: str, filename: str = "") -> tuple[int, int]:
    hash_sum = sum(ord(c) for c in image_hash)
    base_matches = (hash_sum % 20) + 1
    
    suspicious_keywords = ['stock', 'model', 'generic', 'sample', 'test', 'fake']
    if any(keyword in filename.lower() for keyword in suspicious_keywords):
        matches = base_matches + 15
        duplication_score = max(0, 100 - (matches * 5))
    else:
        matches = base_matches
        duplication_score = max(0, 100 - (matches * 3))
    
    return matches, duplication_score

def calculate_metadata_integrity_score(image_data: bytes) -> tuple[int, List[str]]:
    try:
        img = Image.open(io.BytesIO(image_data))
        issues = []
        score = 100
        
        try:
            exif_data = img._getexif()
            if not exif_data:
                issues.append("No EXIF metadata found")
                score -= 50
            elif len(exif_data) < 3:
                issues.append("Minimal EXIF metadata (possible editing)")
                score -= 30
            else:
                score = 90
        except:
            issues.append("Unable to read EXIF data")
            score -= 40
        
        format_type = img.format
        if format_type and format_type.upper() in ["WEBP", "BMP"]:
            issues.append("Image format commonly used in manipulated photos")
            score -= 10
        
        width, height = img.size
        if width < 200 or height < 200:
            issues.append("Image resolution unusually low for profile photo")
            score -= 10
        
        return max(0, score), issues
    except Exception as e:
        return 50, [f"Error analyzing image: {str(e)}"]

def simulate_profile_age_check(profile_id: str) -> tuple[int, int]:
    """
    Simulates checking profile age based on profile ID
    Returns (profile_age_days, profile_age_score)
    """
    hash_sum = sum(ord(c) for c in profile_id)
    profile_age_days = (hash_sum % 365) + 1
    
    if profile_age_days < 30:
        profile_age_score = 50
    elif profile_age_days < 90:
        profile_age_score = 70
    elif profile_age_days < 180:
        profile_age_score = 85
    else:
        profile_age_score = 95
    
    return profile_age_days, profile_age_score

def simulate_consistency_check(profile_id: str) -> tuple[int, List[str]]:
    """
    Simulates checking profile consistency (name, location, activity patterns)
    Returns (consistency_score, consistency_issues)
    """
    issues = []
    score = 100
    
    generic_patterns = ['user', 'profile', 'account', 'test', '123', '456', '789']
    if any(pattern in profile_id.lower() for pattern in generic_patterns):
        issues.append("Generic or auto-generated profile name detected")
        score -= 35
    
    suspicious_patterns = ['temp', 'fake', 'bot', 'spam']
    if any(pattern in profile_id.lower() for pattern in suspicious_patterns):
        issues.append("Suspicious profile name pattern detected")
        score -= 40
    
    if len(profile_id) < 5:
        issues.append("Profile name unusually short")
        score -= 15
    
    if profile_id.isdigit():
        issues.append("Profile name is only numbers")
        score -= 30
    
    hash_sum = sum(ord(c) for c in profile_id)
    if hash_sum % 3 == 0:
        issues.append("Location/activity mismatch detected")
        score -= 20
    
    return max(0, score), issues

def analyze_sentiment_drift(messages: List[str]) -> List[Dict[str, float]]:
    drift = []
    for i, msg in enumerate(messages):
        blob = TextBlob(msg)
        drift.append({
            "message_index": i,
            "polarity": round(blob.sentiment.polarity, 3),
            "subjectivity": round(blob.sentiment.subjectivity, 3)
        })
    return drift

def detect_manipulation_patterns(messages: List[str]) -> List[ManipulationPattern]:
    patterns = []
    
    love_bombing_keywords = [
        r'\b(soulmate|destiny|meant to be|perfect|angel|dream come true)\b',
        r'\b(love you so much|never felt this way|you\'re everything)\b',
        r'\b(marry me|spend forever|rest of my life with you)\b'
    ]
    
    urgency_keywords = [
        r'\b(right now|immediately|urgent|emergency|quickly|asap|hurry)\b',
        r'\b(can\'t wait|need (it|this|you) now|time sensitive)\b'
    ]
    
    financial_keywords = [
        r'\b(money|cash|wire|transfer|bitcoin|crypto|gift card|paypal|venmo|cashapp)\b',
        r'\b(\$\d+|dollars|payment|send me|need funds|financial help)\b',
        r'\b(loan|borrow|emergency funds|hospital bills|stuck)\b'
    ]
    
    isolation_keywords = [
        r'\b(don\'t tell|keep (this|it|us) secret|between us|nobody needs to know)\b',
        r'\b(they don\'t understand|trust only me|your family doesn\'t get it)\b'
    ]
    
    guilt_keywords = [
        r'\b(thought you loved me|don\'t you care|after all i\'ve done|disappointed)\b',
        r'\b(if you really|prove your love|show me you care)\b'
    ]
    
    for i, msg in enumerate(messages):
        msg_lower = msg.lower()
        
        for pattern in love_bombing_keywords:
            if re.search(pattern, msg_lower, re.IGNORECASE):
                patterns.append(ManipulationPattern(
                    pattern_type="Love-Bombing",
                    severity="Medium",
                    evidence=f"Message {i+1}: Excessive affection or idealization detected",
                    timestamp=f"Message {i+1}"
                ))
                break
        
        for pattern in urgency_keywords:
            if re.search(pattern, msg_lower, re.IGNORECASE):
                patterns.append(ManipulationPattern(
                    pattern_type="Urgency Pressure",
                    severity="High",
                    evidence=f"Message {i+1}: Time pressure or urgency language detected",
                    timestamp=f"Message {i+1}"
                ))
                break
        
        for pattern in financial_keywords:
            if re.search(pattern, msg_lower, re.IGNORECASE):
                patterns.append(ManipulationPattern(
                    pattern_type="Financial Request",
                    severity="Critical",
                    evidence=f"Message {i+1}: Financial or payment-related request detected",
                    timestamp=f"Message {i+1}"
                ))
                break
        
        for pattern in isolation_keywords:
            if re.search(pattern, msg_lower, re.IGNORECASE):
                patterns.append(ManipulationPattern(
                    pattern_type="Isolation Tactics",
                    severity="High",
                    evidence=f"Message {i+1}: Attempt to isolate from support network",
                    timestamp=f"Message {i+1}"
                ))
                break
        
        for pattern in guilt_keywords:
            if re.search(pattern, msg_lower, re.IGNORECASE):
                patterns.append(ManipulationPattern(
                    pattern_type="Guilt/Manipulation",
                    severity="High",
                    evidence=f"Message {i+1}: Guilt-tripping or emotional manipulation",
                    timestamp=f"Message {i+1}"
                ))
                break
    
    return patterns

def calculate_emotional_manipulation_index(sentiment_drift: List[Dict], patterns: List[ManipulationPattern]) -> float:
    if not sentiment_drift:
        return 0.0
    
    polarity_changes = []
    for i in range(1, len(sentiment_drift)):
        change = abs(sentiment_drift[i]["polarity"] - sentiment_drift[i-1]["polarity"])
        polarity_changes.append(change)
    
    avg_volatility = sum(polarity_changes) / len(polarity_changes) if polarity_changes else 0
    
    pattern_score = len(patterns) * 0.15
    
    emi = min((avg_volatility * 50) + pattern_score, 1.0)
    
    return round(emi, 3)

def compute_weighted_trust_score(
    toneshift_score: float,
    walletwatch_score: float,
    photo_score: float,
    metadata_score: float
) -> tuple[int, List[WeightedComponent]]:
    """
    Calculate weighted trust score and breakdown.
    Returns: (final_score, weighted_breakdown)
    """
    scores = {
        'toneshift': max(0, min(100, toneshift_score)),
        'walletwatch': max(0, min(100, walletwatch_score)),
        'photo': max(0, min(100, photo_score)),
        'metadata': max(0, min(100, metadata_score))
    }
    
    breakdown = []
    total_contribution = 0
    
    for engine_key, score in scores.items():
        weight = TRUST_SCORE_WEIGHTS[engine_key]
        contribution = round(score * weight, 1)
        total_contribution += contribution
        
        engine_names = {
            'toneshift': 'ToneShift™',
            'walletwatch': 'WalletWatch™',
            'photo': 'Photo Provenance',
            'metadata': 'Metadata Integrity'
        }
        
        breakdown.append(WeightedComponent(
            engine=engine_names[engine_key],
            score=round(score, 1),
            weight=weight,
            contribution=contribution
        ))
    
    final_score = int(round(total_contribution))
    
    return final_score, breakdown

def calculate_trust_score(photo_analysis: Optional[PhotoAnalysisResponse], 
                         chat_analysis: Optional[ChatAnalysisResponse],
                         metadata_analysis: Optional[MetadataAnalysisResponse] = None) -> tuple[int, str, str, List[str], List[WeightedComponent]]:
    insights = []
    
    toneshift_score = 100
    walletwatch_score = 100
    photo_score = 75
    metadata_score = 90
    
    if photo_analysis:
        photo_score = photo_analysis.final_photo_score
    
    if metadata_analysis:
        metadata_score = metadata_analysis.final_metadata_score
    
    if chat_analysis:
        emi = chat_analysis.emotional_manipulation_index
        toneshift_score = int((1 - emi) * 100)
        
        critical_patterns = [p for p in chat_analysis.manipulation_patterns if p.severity == "Critical"]
        high_patterns = [p for p in chat_analysis.manipulation_patterns if p.severity == "High"]
        
        financial_patterns = [
            p for p in chat_analysis.manipulation_patterns 
            if p.pattern_type in ["Financial Request", "Cryptocurrency Request", "Gift Card Request"]
        ]
        
        if financial_patterns:
            walletwatch_score = 0
            insights.append(f"WalletWatch™: {len(financial_patterns)} financial risk pattern(s) detected")
        
        if critical_patterns:
            insights.append(f"{len(critical_patterns)} critical manipulation pattern(s) detected")
        
        if high_patterns:
            insights.append(f"{len(high_patterns)} high-risk manipulation pattern(s) detected")
        
        if emi > 0.6:
            insights.append(f"High emotional manipulation index ({emi:.2f})")
    
    if photo_analysis:
        if photo_analysis.reverse_image_matches > 10:
            insights.append(f"Photo found in {photo_analysis.reverse_image_matches} online profiles")
        elif photo_analysis.reverse_image_matches > 5:
            insights.append(f"Photo appears in {photo_analysis.reverse_image_matches} other locations")
        
        if photo_analysis.deepfake_confidence == "Suspicious":
            insights.append("Photo shows signs of manipulation or editing")
        elif photo_analysis.deepfake_confidence == "Fake/Deepfake":
            insights.append("Photo likely AI-generated or heavily manipulated")
        
        if photo_analysis.metadata_issues:
            insights.append(f"Photo metadata issues detected ({len(photo_analysis.metadata_issues)} problems)")
    
    final_score, weighted_breakdown = compute_weighted_trust_score(
        toneshift_score, walletwatch_score, photo_score, metadata_score
    )
    
    if final_score >= 70:
        color_band = "green"
        confidence = "High"
    elif final_score >= 40:
        color_band = "yellow"
        confidence = "Medium"
    else:
        color_band = "red"
        confidence = "Low"
    
    return final_score, confidence, color_band, insights, weighted_breakdown[:3]

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/analyze/photo", response_model=PhotoAnalysisResponse)
async def analyze_photo(file: UploadFile = File(...)):
    image_data = await file.read()
    filename = file.filename or ""
    
    image_hash = hashlib.md5(image_data).hexdigest()
    
    reverse_matches, duplication_score = simulate_reverse_image_search(image_hash, filename)
    
    metadata_integrity_score, metadata_issues = calculate_metadata_integrity_score(image_data)
    
    deepfake_confidence, _ = detect_deepfake(image_data)
    
    final_photo_score = int((duplication_score * 0.6) + (metadata_integrity_score * 0.4))
    
    if reverse_matches > 10 or deepfake_confidence == "Suspicious":
        risk_level = "High"
    elif reverse_matches > 5 or metadata_issues:
        risk_level = "Medium"
    else:
        risk_level = "Low"
    
    return PhotoAnalysisResponse(
        image_hash=image_hash,
        reverse_image_matches=reverse_matches,
        duplication_score=duplication_score,
        metadata_integrity_score=metadata_integrity_score,
        final_photo_score=final_photo_score,
        deepfake_confidence=deepfake_confidence,
        metadata_issues=metadata_issues,
        risk_level=risk_level
    )

@app.post("/analyze/chat", response_model=ChatAnalysisResponse)
async def analyze_chat(request: ChatAnalysisRequest):
    """
    Production-ready ToneShift™ NLP Engine endpoint
    Uses DistilBERT for sentiment analysis and manipulation pattern detection
    """
    messages = [{"sender": "user", "text": msg} for msg in request.messages]
    
    analysis = toneshift_engine.analyze_conversation(messages)
    
    manipulation_patterns = [
        ManipulationPattern(
            pattern_type=p["pattern_type"],
            severity=p["severity"],
            evidence=p["evidence"],
            timestamp=p["timestamp"]
        )
        for p in analysis["manipulation_patterns"]
    ]
    
    return ChatAnalysisResponse(
        sentiment_drift=analysis["sentiment_drift"],
        manipulation_patterns=manipulation_patterns,
        emotional_manipulation_index=analysis["emotional_manipulation_index"],
        risk_level=analysis["risk_level"]
    )

@app.post("/analyze/metadata", response_model=MetadataAnalysisResponse)
async def analyze_metadata(
    profile_id: str = Form(...), 
    phone_number: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Metadata Integrity Engine endpoint
    Analyzes profile age, consistency, and location risk to detect suspicious accounts
    """
    profile_age_days, profile_age_score = simulate_profile_age_check(profile_id)
    consistency_score, consistency_issues = simulate_consistency_check(profile_id)
    
    location_risk_score = 100
    location_risk_rationale = None
    is_known_scam_origin = False
    
    if phone_number:
        normalized_phone = normalize_phone_number(phone_number)
        all_risks = db.query(GeographicRisk).all()
        all_risks_sorted = sorted(all_risks, key=lambda r: len(r.code), reverse=True)
        
        matched_risk = None
        for risk in all_risks_sorted:
            if normalized_phone.startswith(risk.code):
                matched_risk = risk
                break
        
        if matched_risk:
            risk_score_map = {
                "Extreme": 10,
                "High": 30,
                "Medium": 60
            }
            location_risk_score = risk_score_map.get(matched_risk.risk_level, 50)
            location_risk_rationale = f"Code {matched_risk.code} ({matched_risk.region}) is a {matched_risk.risk_level} risk origin for romance fraud"
            is_known_scam_origin = True
    
    final_metadata_score = int((profile_age_score + consistency_score + location_risk_score) / 3)
    
    return MetadataAnalysisResponse(
        profile_age_score=profile_age_score,
        consistency_score=consistency_score,
        location_risk_score=location_risk_score,
        final_metadata_score=final_metadata_score,
        profile_age_days=profile_age_days,
        consistency_issues=consistency_issues,
        location_risk_rationale=location_risk_rationale,
        is_known_scam_origin=is_known_scam_origin
    )

@app.post("/trustscore/generate", response_model=TrustScoreReport)
async def generate_trust_score(
    photo_file: Optional[UploadFile] = File(None),
    chat_messages: Optional[str] = Form(None),
    profile_id: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    scammer_profile_json: Optional[str] = Form(None),
    conversation_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    photo_analysis = None
    chat_analysis = None
    metadata_analysis = None
    
    if photo_file:
        image_data = await photo_file.read()
        filename = photo_file.filename or ""
        image_hash = hashlib.md5(image_data).hexdigest()
        
        reverse_matches, duplication_score = simulate_reverse_image_search(image_hash, filename)
        metadata_integrity_score, metadata_issues = calculate_metadata_integrity_score(image_data)
        deepfake_confidence, _ = detect_deepfake(image_data)
        
        final_photo_score = int((duplication_score * 0.6) + (metadata_integrity_score * 0.4))
        
        if reverse_matches > 10 or deepfake_confidence == "Suspicious":
            risk_level = "High"
        elif reverse_matches > 5 or metadata_issues:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        photo_analysis = PhotoAnalysisResponse(
            image_hash=image_hash,
            reverse_image_matches=reverse_matches,
            duplication_score=duplication_score,
            metadata_integrity_score=metadata_integrity_score,
            final_photo_score=final_photo_score,
            deepfake_confidence=deepfake_confidence,
            metadata_issues=metadata_issues,
            risk_level=risk_level
        )
    
    conversation = None
    if chat_messages:
        messages_list = [msg.strip() for msg in chat_messages.split("\n") if msg.strip()]
        
        if messages_list:
            phone_code = normalize_phone_number(phone_number) if phone_number else None
            
            if conversation_id:
                conversation = db.query(DBConversation).filter(DBConversation.id == conversation_id).first()
                if not conversation:
                    raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
                
                last_point = db.query(DBAnalysisPoint).filter(
                    DBAnalysisPoint.conversation_id == conversation_id
                ).order_by(DBAnalysisPoint.message_index.desc()).first()
                
                starting_index = (last_point.message_index + 1) if last_point else 1
                
                all_previous_points = db.query(DBAnalysisPoint).filter(
                    DBAnalysisPoint.conversation_id == conversation_id
                ).order_by(DBAnalysisPoint.message_index).all()
                
                prev_final_score = conversation.final_trust_score if conversation.final_trust_score else 50
                
                if all_previous_points:
                    last_messages = [{"sender": "user", "text": p.message_text} for p in all_previous_points]
                    last_analysis = toneshift_engine.analyze_conversation(last_messages)
                    prev_toneshift_contrib = round(int((1 - last_analysis["emotional_manipulation_index"]) * 100) * 0.50)
                else:
                    prev_toneshift_contrib = 50
            else:
                # Create new conversation
                conversation = DBConversation(id=str(uuid.uuid4()), phone_code=phone_code)
                db.add(conversation)
                db.flush()
                
                starting_index = 1
                prev_final_score = calculate_trust_score(photo_analysis, None, metadata_analysis)[0]
                prev_toneshift_contrib = 50
            
            for i, msg_text in enumerate(messages_list, start=starting_index):
                messages_prefix = [{"sender": "user", "text": m} for m in messages_list[:i]]
                analysis_i = toneshift_engine.analyze_conversation(messages_prefix)
                
                emi_i = analysis_i["emotional_manipulation_index"]
                toneshift_score_i = int((1 - emi_i) * 100)
                toneshift_contrib_i = round(toneshift_score_i * 0.50)
                
                chat_analysis_i = ChatAnalysisResponse(
                    sentiment_drift=analysis_i["sentiment_drift"],
                    manipulation_patterns=[
                        ManipulationPattern(
                            pattern_type=p["pattern_type"],
                            severity=p["severity"],
                            evidence=p["evidence"],
                            timestamp=p["timestamp"]
                        )
                        for p in analysis_i["manipulation_patterns"]
                    ],
                    emotional_manipulation_index=emi_i,
                    risk_level=analysis_i["risk_level"]
                )
                
                final_i = calculate_trust_score(photo_analysis, chat_analysis_i, metadata_analysis)[0]
                trust_delta = final_i - prev_final_score
                tone_delta = toneshift_contrib_i - prev_toneshift_contrib
                
                wallet_watch_flag = any(
                    p["pattern_type"] in ["Financial Request", "Cryptocurrency Request", "Gift Card Request"] 
                    and p["timestamp"] == f"Message {i}"
                    for p in analysis_i["manipulation_patterns"]
                )
                
                risk_patterns = [
                    p["pattern_type"] 
                    for p in analysis_i["manipulation_patterns"] 
                    if p["timestamp"] == f"Message {i}"
                ]
                risk_rationale = "; ".join(risk_patterns) if risk_patterns else "No new risk detected"
                
                analysis_point = DBAnalysisPoint(
                    conversation_id=conversation.id,
                    message_index=i,
                    timestamp=datetime.utcnow(),
                    message_text=msg_text,
                    trust_score_delta=trust_delta,
                    tone_shift_delta=tone_delta,
                    wallet_watch_flag=wallet_watch_flag,
                    risk_rationale=risk_rationale
                )
                db.add(analysis_point)
                
                prev_final_score = final_i
                prev_toneshift_contrib = toneshift_contrib_i
            
            conversation.final_trust_score = prev_final_score
            conversation.last_updated = datetime.utcnow()
        
        messages = [{"sender": "user", "text": msg} for msg in messages_list]
        analysis = toneshift_engine.analyze_conversation(messages)
        
        manipulation_patterns = [
            ManipulationPattern(
                pattern_type=p["pattern_type"],
                severity=p["severity"],
                evidence=p["evidence"],
                timestamp=p["timestamp"]
            )
            for p in analysis["manipulation_patterns"]
        ]
        
        chat_analysis = ChatAnalysisResponse(
            sentiment_drift=analysis["sentiment_drift"],
            manipulation_patterns=manipulation_patterns,
            emotional_manipulation_index=analysis["emotional_manipulation_index"],
            risk_level=analysis["risk_level"]
        )
    
    if profile_id:
        profile_age_days, profile_age_score = simulate_profile_age_check(profile_id)
        consistency_score, consistency_issues = simulate_consistency_check(profile_id)
        final_metadata_score = int((profile_age_score + consistency_score) / 2)
        
        metadata_analysis = MetadataAnalysisResponse(
            profile_age_score=profile_age_score,
            consistency_score=consistency_score,
            final_metadata_score=final_metadata_score,
            profile_age_days=profile_age_days,
            consistency_issues=consistency_issues
        )
    
    trust_score, confidence, color_band, insights, weighted_breakdown = calculate_trust_score(photo_analysis, chat_analysis, metadata_analysis)
    
    report_id = str(uuid.uuid4())
    
    db_report = DBTrustReport(
        report_id=report_id,
        trust_score=trust_score,
        confidence_level=confidence,
        color_band=color_band,
        top_risk_insights=insights,
        created_at=datetime.utcnow()
    )
    db.add(db_report)
    db.flush()
    
    if photo_analysis:
        db_photo = DBPhotoAnalysis(
            report_id=db_report.id,
            image_hash=photo_analysis.image_hash,
            reverse_image_matches=photo_analysis.reverse_image_matches,
            duplication_score=photo_analysis.duplication_score,
            metadata_integrity_score=photo_analysis.metadata_integrity_score,
            final_photo_score=photo_analysis.final_photo_score,
            deepfake_confidence=photo_analysis.deepfake_confidence,
            metadata_issues=photo_analysis.metadata_issues,
            risk_level=photo_analysis.risk_level
        )
        db.add(db_photo)
    
    if chat_analysis:
        db_chat = DBChatAnalysis(
            report_id=db_report.id,
            sentiment_drift=chat_analysis.sentiment_drift,
            emotional_manipulation_index=chat_analysis.emotional_manipulation_index,
            risk_level=chat_analysis.risk_level
        )
        db.add(db_chat)
        db.flush()
        
        for pattern in chat_analysis.manipulation_patterns:
            db_pattern = DBManipulationPattern(
                chat_analysis_id=db_chat.id,
                pattern_type=pattern.pattern_type,
                severity=pattern.severity,
                evidence=pattern.evidence,
                timestamp=pattern.timestamp
            )
            db.add(db_pattern)
    
    if scammer_profile_json and conversation:
        import json
        try:
            profile_data = json.loads(scammer_profile_json)
            profile_input = ScammerProfileInput(**profile_data)
            
            scammer_profile = db.query(DBScammerProfile).filter(
                DBScammerProfile.conversation_id == conversation.id
            ).first()
            
            if scammer_profile:
                scammer_profile.claimed_name = profile_input.claimed_name
                scammer_profile.aliases = profile_input.aliases
                scammer_profile.claimed_dob = profile_input.claimed_dob
                scammer_profile.claimed_address = profile_input.claimed_address
                scammer_profile.claimed_occupation = profile_input.claimed_occupation
                scammer_profile.phone_numbers = profile_input.phone_numbers
                scammer_profile.email_addresses = profile_input.email_addresses
                scammer_profile.platform_met = profile_input.platform_met
                scammer_profile.first_contact_date = profile_input.first_contact_date
                scammer_profile.last_contact_date = profile_input.last_contact_date
                scammer_profile.communication_channels = profile_input.communication_channels
                scammer_profile.total_amount_requested = profile_input.total_amount_requested
                scammer_profile.total_amount_sent = profile_input.total_amount_sent
                scammer_profile.currency = profile_input.currency
                scammer_profile.victim_narrative = profile_input.victim_narrative
                scammer_profile.ic3_complaint_number = profile_input.ic3_complaint_number
                scammer_profile.ftc_report_id = profile_input.ftc_report_id
                scammer_profile.police_incident_number = profile_input.police_incident_number
                scammer_profile.other_agency_references = profile_input.other_agency_references
                
                db.query(DBSocialHandle).filter(
                    DBSocialHandle.scammer_profile_id == scammer_profile.id
                ).delete()
                db.query(DBPaymentInstruction).filter(
                    DBPaymentInstruction.scammer_profile_id == scammer_profile.id
                ).delete()
            else:
                scammer_profile = DBScammerProfile(
                    id=str(uuid.uuid4()),
                    conversation_id=conversation.id,
                    claimed_name=profile_input.claimed_name,
                    aliases=profile_input.aliases,
                    claimed_dob=profile_input.claimed_dob,
                    claimed_address=profile_input.claimed_address,
                    claimed_occupation=profile_input.claimed_occupation,
                    phone_numbers=profile_input.phone_numbers,
                    email_addresses=profile_input.email_addresses,
                    platform_met=profile_input.platform_met,
                    first_contact_date=profile_input.first_contact_date,
                    last_contact_date=profile_input.last_contact_date,
                    communication_channels=profile_input.communication_channels,
                    total_amount_requested=profile_input.total_amount_requested,
                    total_amount_sent=profile_input.total_amount_sent,
                    currency=profile_input.currency,
                    victim_narrative=profile_input.victim_narrative,
                    ic3_complaint_number=profile_input.ic3_complaint_number,
                    ftc_report_id=profile_input.ftc_report_id,
                    police_incident_number=profile_input.police_incident_number,
                    other_agency_references=profile_input.other_agency_references
                )
                db.add(scammer_profile)
            
            db.flush()
            
            if profile_input.social_handles:
                for handle_input in profile_input.social_handles:
                    social_handle = DBSocialHandle(
                        scammer_profile_id=scammer_profile.id,
                        platform=handle_input.platform,
                        username=handle_input.username,
                        profile_url=handle_input.profile_url,
                        profile_id=handle_input.profile_id,
                        notes=handle_input.notes
                    )
                    db.add(social_handle)
            
            if profile_input.payment_instructions:
                for payment_input in profile_input.payment_instructions:
                    payment_instruction = DBPaymentInstruction(
                        scammer_profile_id=scammer_profile.id,
                        method=payment_input.method,
                        bank_name=payment_input.bank_name,
                        account_holder_name=payment_input.account_holder_name,
                        account_number=payment_input.account_number,
                        routing_number=payment_input.routing_number,
                        swift_code=payment_input.swift_code,
                        iban=payment_input.iban,
                        receiver_name=payment_input.receiver_name,
                        receiver_city=payment_input.receiver_city,
                        receiver_country=payment_input.receiver_country,
                        pickup_location=payment_input.pickup_location,
                        app_handle=payment_input.app_handle,
                        crypto_chain=payment_input.crypto_chain,
                        crypto_address=payment_input.crypto_address,
                        crypto_memo=payment_input.crypto_memo,
                        exchange_platform=payment_input.exchange_platform,
                        exchange_uid=payment_input.exchange_uid,
                        gift_card_brand=payment_input.gift_card_brand,
                        gift_card_amount=payment_input.gift_card_amount,
                        amount_requested=payment_input.amount_requested,
                        notes=payment_input.notes
                    )
                    db.add(payment_instruction)
        except Exception as e:
            print(f"⚠️ Error saving scammer profile: {str(e)}")
    
    db.commit()
    db.refresh(db_report)
    
    if conversation:
        from app.models.database import TrustedContact, AlertLog
        from datetime import timedelta
        
        contacts = db.query(TrustedContact).filter(
            TrustedContact.user_identifier == conversation.id,
            TrustedContact.is_active == True
        ).all()
        
        if contacts:
            financial_patterns = []
            if chat_analysis and chat_analysis.manipulation_patterns:
                financial_patterns = [
                    p for p in chat_analysis.manipulation_patterns 
                    if p.pattern_type in ["Financial Request", "Cryptocurrency Request", "Gift Card Request"]
                ]
            
            for contact in contacts:
                threshold = contact.alert_threshold or 40
                should_alert = False
                alert_reason = ""
                
                if financial_patterns:
                    should_alert = True
                    alert_reason = f"Financial manipulation detected: {', '.join([p.pattern_type for p in financial_patterns])}"
                elif trust_score < threshold:
                    should_alert = True
                    alert_reason = f"Trust score {trust_score} below threshold {threshold}"
                
                if should_alert:
                    cooldown_minutes = 60
                    if contact.last_alert_timestamp:
                        time_since_last = datetime.utcnow() - contact.last_alert_timestamp
                        if time_since_last < timedelta(minutes=cooldown_minutes):
                            print(f"⏱️ Cooldown active for {contact.contact_name} ({int((timedelta(minutes=cooldown_minutes) - time_since_last).total_seconds() / 60)} min remaining)")
                            continue
                    
                    alert_log = AlertLog(
                        contact_id=contact.id,
                        user_identifier=conversation.id,
                        conversation_id=conversation.id,
                        trust_score=trust_score,
                        threshold=threshold,
                        channel='EMAIL' if contact.contact_email else 'SMS' if contact.contact_phone else 'N/A',
                        reason=alert_reason,
                        status='LOGGED'
                    )
                    db.add(alert_log)
                    
                    contact.last_alert_timestamp = datetime.utcnow()
                    
                    print(f"⚠️ Guardian Mode Alert: {alert_reason} for conversation {conversation.id}")
                    print(f"📧 Logged alert for {contact.contact_name} ({contact.contact_email or contact.contact_phone})")
            
            db.commit()
    
    safety_nudges = []
    if chat_analysis:
        manipulation_patterns_list = [
            {
                "pattern_type": p.pattern_type,
                "severity": p.severity,
                "evidence": p.evidence
            }
            for p in chat_analysis.manipulation_patterns
        ]
        
        has_financial_request = any(
            p.pattern_type in ["Financial Request", "Cryptocurrency Request", "Gift Card Request"]
            for p in chat_analysis.manipulation_patterns
        )
        
        conversation_length = len(conversation.analysis_points) if conversation else 0
        
        nudges = generate_safety_nudges(
            trust_score=trust_score,
            emi=chat_analysis.emotional_manipulation_index,
            has_financial_request=has_financial_request,
            manipulation_patterns=manipulation_patterns_list,
            conversation_length=conversation_length
        )
        
        safety_nudges = [nudge.dict() for nudge in nudges]
    
    report = TrustScoreReport(
        report_id=report_id,
        trust_score=trust_score,
        confidence_level=confidence,
        color_band=color_band,
        top_risk_insights=insights,
        photo_analysis=photo_analysis,
        chat_analysis=chat_analysis,
        created_at=db_report.created_at.isoformat(),
        conversation_id=conversation.id if conversation else None,
        weighted_breakdown=weighted_breakdown,
        safety_nudges=safety_nudges
    )
    
    return report

@app.get("/trustscore/report/{report_id}", response_model=TrustScoreReport)
async def get_trust_report(report_id: str, db: Session = Depends(get_db)):
    db_report = db.query(DBTrustReport).filter(DBTrustReport.report_id == report_id).first()
    if not db_report:
        return {"error": "Report not found"}
    
    photo_analysis = None
    if db_report.photo_analysis:
        photo_analysis = PhotoAnalysisResponse(
            image_hash=db_report.photo_analysis.image_hash,
            reverse_image_matches=db_report.photo_analysis.reverse_image_matches,
            duplication_score=db_report.photo_analysis.duplication_score or 0,
            metadata_integrity_score=db_report.photo_analysis.metadata_integrity_score or 0,
            final_photo_score=db_report.photo_analysis.final_photo_score or 0,
            deepfake_confidence=db_report.photo_analysis.deepfake_confidence,
            metadata_issues=db_report.photo_analysis.metadata_issues,
            risk_level=db_report.photo_analysis.risk_level
        )
    
    chat_analysis = None
    if db_report.chat_analysis:
        manipulation_patterns = [
            ManipulationPattern(
                pattern_type=p.pattern_type,
                severity=p.severity,
                evidence=p.evidence,
                timestamp=p.timestamp
            )
            for p in db_report.chat_analysis.manipulation_patterns
        ]
        chat_analysis = ChatAnalysisResponse(
            sentiment_drift=db_report.chat_analysis.sentiment_drift,
            manipulation_patterns=manipulation_patterns,
            emotional_manipulation_index=db_report.chat_analysis.emotional_manipulation_index,
            risk_level=db_report.chat_analysis.risk_level
        )
    
    return TrustScoreReport(
        report_id=db_report.report_id,
        trust_score=db_report.trust_score,
        confidence_level=db_report.confidence_level,
        color_band=db_report.color_band,
        top_risk_insights=db_report.top_risk_insights,
        photo_analysis=photo_analysis,
        chat_analysis=chat_analysis,
        created_at=db_report.created_at.isoformat()
    )

@app.get("/trustscore/reports")
async def list_reports(db: Session = Depends(get_db)):
    db_reports = db.query(DBTrustReport).all()
    reports = []
    
    for db_report in db_reports:
        photo_analysis = None
        if db_report.photo_analysis:
            photo_analysis = PhotoAnalysisResponse(
                image_hash=db_report.photo_analysis.image_hash,
                reverse_image_matches=db_report.photo_analysis.reverse_image_matches,
                duplication_score=db_report.photo_analysis.duplication_score or 0,
                metadata_integrity_score=db_report.photo_analysis.metadata_integrity_score or 0,
                final_photo_score=db_report.photo_analysis.final_photo_score or 0,
                deepfake_confidence=db_report.photo_analysis.deepfake_confidence,
                metadata_issues=db_report.photo_analysis.metadata_issues,
                risk_level=db_report.photo_analysis.risk_level
            )
        
        chat_analysis = None
        if db_report.chat_analysis:
            manipulation_patterns = [
                ManipulationPattern(
                    pattern_type=p.pattern_type,
                    severity=p.severity,
                    evidence=p.evidence,
                    timestamp=p.timestamp
                )
                for p in db_report.chat_analysis.manipulation_patterns
            ]
            chat_analysis = ChatAnalysisResponse(
                sentiment_drift=db_report.chat_analysis.sentiment_drift,
                manipulation_patterns=manipulation_patterns,
                emotional_manipulation_index=db_report.chat_analysis.emotional_manipulation_index,
                risk_level=db_report.chat_analysis.risk_level
            )
        
        reports.append(TrustScoreReport(
            report_id=db_report.report_id,
            trust_score=db_report.trust_score,
            confidence_level=db_report.confidence_level,
            color_band=db_report.color_band,
            top_risk_insights=db_report.top_risk_insights,
            photo_analysis=photo_analysis,
            chat_analysis=chat_analysis,
            created_at=db_report.created_at.isoformat()
        ))
    
    return {"reports": reports}

@app.get("/timeline/{conversation_id}", response_model=TimelineResponse)
async def get_timeline(conversation_id: str, db: Session = Depends(get_db)):
    """Get the Trust Timeline™ for a specific conversation showing per-message risk evolution"""
    conversation = db.query(DBConversation).filter(
        DBConversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = [
        TimelineMessage(
            message_index=ap.message_index,
            message_text=ap.message_text,
            timestamp=ap.timestamp.isoformat(),
            trust_score_delta=ap.trust_score_delta,
            tone_shift_delta=ap.tone_shift_delta,
            wallet_watch_flag=ap.wallet_watch_flag,
            risk_rationale=ap.risk_rationale
        )
        for ap in sorted(conversation.analysis_points, key=lambda x: x.message_index)
    ]
    
    return TimelineResponse(
        conversation_id=conversation.id,
        final_trust_score=conversation.final_trust_score or 0,
        start_date=conversation.start_date.isoformat(),
        last_updated=conversation.last_updated.isoformat(),
        message_count=len(messages),
        messages=messages
    )

@app.get("/analytics/patterns", response_model=PatternAnalytics)
async def get_pattern_analytics(db: Session = Depends(get_db)):
    """Get analytics about scam patterns across all conversations"""
    conversations = db.query(DBConversation).all()
    analysis_points = db.query(DBAnalysisPoint).all()
    
    total_conversations = len(conversations)
    high_risk_conversations = len([c for c in conversations if c.final_trust_score and c.final_trust_score < 40])
    
    trust_scores = [c.final_trust_score for c in conversations if c.final_trust_score is not None]
    average_trust_score = sum(trust_scores) / len(trust_scores) if trust_scores else 0
    
    pattern_counts = {}
    for ap in analysis_points:
        if ap.risk_rationale and ap.risk_rationale != "No new risk detected":
            patterns = [p.strip() for p in ap.risk_rationale.split(";")]
            for pattern in patterns:
                pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1
    
    most_common_patterns = [
        {"pattern": pattern, "count": count}
        for pattern, count in sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    ]
    
    financial_points = [ap for ap in analysis_points if ap.wallet_watch_flag]
    financial_message_indices = [ap.message_index for ap in financial_points]
    avg_financial_message_index = sum(financial_message_indices) / len(financial_message_indices) if financial_message_indices else 0
    
    financial_request_stats = {
        "total_financial_requests": len(financial_points),
        "conversations_with_financial_requests": len(set(ap.conversation_id for ap in financial_points)),
        "average_message_index": round(avg_financial_message_index, 1),
        "percentage_of_conversations": round((len(set(ap.conversation_id for ap in financial_points)) / total_conversations * 100) if total_conversations > 0 else 0, 1)
    }
    
    message_counts = [len(c.analysis_points) for c in conversations if c.analysis_points]
    average_message_count = sum(message_counts) / len(message_counts) if message_counts else 0
    
    return PatternAnalytics(
        total_conversations=total_conversations,
        high_risk_conversations=high_risk_conversations,
        average_trust_score=round(average_trust_score, 1),
        most_common_patterns=most_common_patterns,
        financial_request_stats=financial_request_stats,
        average_message_count=round(average_message_count, 1)
    )

@app.get("/analyze/location/{phone_number_or_code}", response_model=LocationRiskResponse)
async def analyze_location(phone_number_or_code: str, db: Session = Depends(get_db)):
    normalized_phone = normalize_phone_number(phone_number_or_code)
    
    all_risks = db.query(GeographicRisk).all()
    all_risks_sorted = sorted(all_risks, key=lambda r: len(r.code), reverse=True)
    
    matched_risk = None
    for risk in all_risks_sorted:
        if normalized_phone.startswith(risk.code):
            matched_risk = risk
            break
    
    if matched_risk:
        risk_score_map = {
            "Extreme": 10,
            "High": 30,
            "Medium": 60
        }
        location_risk_score = risk_score_map.get(matched_risk.risk_level, 50)
        
        return LocationRiskResponse(
            is_known_scam_origin=True,
            location_risk_score=location_risk_score,
            risk_rationale=f"Code {matched_risk.code} ({matched_risk.region}) is a {matched_risk.risk_level} risk origin for romance fraud",
            matched_code=matched_risk.code,
            region=matched_risk.region,
            risk_level=matched_risk.risk_level
        )
    else:
        return LocationRiskResponse(
            is_known_scam_origin=False,
            location_risk_score=100,
            risk_rationale="No known high-risk origin detected for this code"
        )

@app.get("/evidence/generate/{conversation_id}")
async def generate_evidence_report(
    conversation_id: str, 
    phone_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Generate legal-grade Evidence Locker PDF report for a conversation.
    
    Args:
        conversation_id: UUID of the conversation to generate report for
        phone_code: Optional phone code to include geographic risk data (e.g., +234)
        db: Database session
        
    Returns:
        StreamingResponse with PDF file
    """
    try:
        from app.models.database import Conversation as DBConversation, AnalysisPoint as DBAnalysisPoint, EvidenceReport as DBEvidenceReport
        
        conversation = db.query(DBConversation).filter(DBConversation.id == conversation_id).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
        
        analysis_points = db.query(DBAnalysisPoint).filter(
            DBAnalysisPoint.conversation_id == conversation_id
        ).order_by(DBAnalysisPoint.message_index.asc()).all()
        
        geographic_risk = None
        phone_code_to_use = phone_code or conversation.phone_code
        
        if phone_code_to_use:
            normalized_code = normalize_phone_number(phone_code_to_use)
            geographic_risk = db.query(GeographicRisk).filter(
                GeographicRisk.code == normalized_code
            ).first()
        
        scammer_profile = None
        if hasattr(conversation, 'scammer_profile') and conversation.scammer_profile:
            scammer_profile = conversation.scammer_profile
        
        app_version = os.getenv("APP_VERSION", "1.0.0")
        backend_version = os.getenv("BACKEND_VERSION", "1.0.0")
        
        pdf_buffer, dataset_hash, report_data = generate_evidence_pdf(
            conversation, 
            analysis_points, 
            geographic_risk,
            scammer_profile,
            app_version,
            backend_version
        )
        
        evidence_report = DBEvidenceReport(
            conversation_id=conversation_id,
            dataset_hash=dataset_hash,
            report_data=report_data,
            app_version=app_version,
            backend_version=backend_version
        )
        db.add(evidence_report)
        db.commit()
        
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"HeartGuard_Evidence_{conversation_id[:8]}_{timestamp}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Report-Hash": dataset_hash
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"PDF generation error: {str(e)}")
        print(error_details)
        raise HTTPException(
            status_code=500, 
            detail=f"PDF generation failed: {str(e)}"
        )


@app.get("/evidence/verify")
async def verify_evidence_report(hash: str, db: Session = Depends(get_db)):
    """
    Verify the authenticity of an Evidence Locker report by its dataset hash.
    
    Args:
        hash: SHA-256 hash of the report dataset
        db: Database session
        
    Returns:
        Verification result with report metadata
    """
    from app.models.database import EvidenceReport as DBEvidenceReport, Conversation as DBConversation
    
    evidence_report = db.query(DBEvidenceReport).filter(
        DBEvidenceReport.dataset_hash == hash
    ).first()
    
    if not evidence_report:
        return {
            "valid": False,
            "message": "No report found with this hash. The report may not exist or the hash is incorrect."
        }
    
    conversation = db.query(DBConversation).filter(
        DBConversation.id == evidence_report.conversation_id
    ).first()
    
    return {
        "valid": True,
        "message": "Report verified successfully. This evidence has not been tampered with.",
        "report_metadata": {
            "conversation_id": evidence_report.conversation_id,
            "generated_at": evidence_report.generated_at.isoformat() + "Z",
            "total_messages": evidence_report.report_data.get("total_messages"),
            "final_trust_score": evidence_report.report_data.get("final_trust_score"),
            "app_version": evidence_report.app_version,
            "backend_version": evidence_report.backend_version
        }
    }


@app.get("/safety-replies")
async def get_safety_replies(
    trigger_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get contextual safety reply suggestions based on risk triggers.
    
    Args:
        trigger_type: Type of trigger (wallet_watch, trust_drop, tone_shift, general)
        risk_level: Risk level (high, extreme, medium)
        db: Database session
        
    Returns:
        List of safety reply suggestions
    """
    from app.models.database import SafetyReply
    
    query = db.query(SafetyReply)
    
    if trigger_type:
        query = query.filter(SafetyReply.trigger_type == trigger_type)
    
    if risk_level:
        query = query.filter(SafetyReply.risk_level == risk_level)
    
    safety_replies = query.order_by(SafetyReply.priority.asc()).limit(3).all()
    
    return {
        "safety_replies": [
            {
                "id": reply.id,
                "trigger_type": reply.trigger_type,
                "risk_level": reply.risk_level,
                "reply_text": reply.reply_text,
                "context": reply.context,
                "priority": reply.priority
            }
            for reply in safety_replies
        ]
    }


class TrustedContactInput(BaseModel):
    user_identifier: str
    contact_name: str
    contact_email: str
    contact_phone: Optional[str] = None
    alert_threshold: Optional[int] = 40
    escalation_order: Optional[int] = 1

@app.post("/guardian/contact/add")
async def add_trusted_contact(
    contact: TrustedContactInput,
    db: Session = Depends(get_db)
):
    """
    Add a trusted contact for Guardian Mode alerts.
    
    Args:
        contact: Trusted contact details (JSON body)
        db: Database session
        
    Returns:
        Created trusted contact record
    """
    from app.models.database import TrustedContact
    
    trusted_contact = TrustedContact(
        user_identifier=contact.user_identifier,
        contact_name=contact.contact_name,
        contact_email=contact.contact_email,
        contact_phone=contact.contact_phone,
        contact_email_or_phone=contact.contact_email,
        alert_threshold=contact.alert_threshold or 40,
        is_active=True
    )
    
    db.add(trusted_contact)
    db.commit()
    db.refresh(trusted_contact)
    
    return {
        "id": trusted_contact.id,
        "user_identifier": trusted_contact.user_identifier,
        "contact_name": trusted_contact.contact_name,
        "contact_email": trusted_contact.contact_email,
        "contact_phone": trusted_contact.contact_phone,
        "alert_threshold": trusted_contact.alert_threshold,
        "is_active": trusted_contact.is_active,
        "created_at": trusted_contact.created_at.isoformat() + "Z"
    }


@app.get("/guardian/contacts/{user_identifier}")
async def get_trusted_contacts(
    user_identifier: str,
    db: Session = Depends(get_db)
):
    """
    Get all active trusted contacts for a user.
    
    Args:
        user_identifier: User ID or conversation ID
        db: Database session
        
    Returns:
        List of active trusted contacts
    """
    from app.models.database import TrustedContact
    
    contacts = db.query(TrustedContact).filter(
        TrustedContact.user_identifier == user_identifier,
        TrustedContact.is_active == True
    ).all()
    
    return {
        "user_identifier": user_identifier,
        "contacts": [
            {
                "id": contact.id,
                "contact_name": contact.contact_name,
                "contact_email": contact.contact_email,
                "contact_phone": contact.contact_phone,
                "alert_threshold": contact.alert_threshold,
                "is_active": contact.is_active,
                "last_alert_timestamp": contact.last_alert_timestamp.isoformat() + "Z" if contact.last_alert_timestamp else None,
                "created_at": contact.created_at.isoformat() + "Z"
            }
            for contact in contacts
        ]
    }

@app.delete("/guardian/contact/{contact_id}")
async def delete_trusted_contact(
    contact_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete (deactivate) a trusted contact.
    
    Args:
        contact_id: Contact ID to delete
        db: Database session
        
    Returns:
        Success message
    """
    from app.models.database import TrustedContact
    
    contact = db.query(TrustedContact).filter(TrustedContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    contact.is_active = False
    db.commit()
    
    return {"success": True, "message": "Contact deactivated"}

@app.get("/guardian/alerts/{user_identifier}")
async def get_alert_history(
    user_identifier: str,
    limit: Optional[int] = 50,
    db: Session = Depends(get_db)
):
    """
    Get alert history for a user.
    
    Args:
        user_identifier: User ID or conversation ID
        limit: Maximum number of alerts to return (default 50)
        db: Database session
        
    Returns:
        List of alert log entries
    """
    from app.models.database import AlertLog, TrustedContact
    
    alerts = db.query(AlertLog).filter(
        AlertLog.user_identifier == user_identifier
    ).order_by(AlertLog.created_at.desc()).limit(limit).all()
    
    result = []
    for alert in alerts:
        contact = db.query(TrustedContact).filter(TrustedContact.id == alert.contact_id).first()
        result.append({
            "id": alert.id,
            "contact_name": contact.contact_name if contact else "Unknown",
            "contact_email": contact.contact_email if contact else None,
            "trust_score": alert.trust_score,
            "threshold": alert.threshold,
            "channel": alert.channel,
            "reason": alert.reason,
            "status": alert.status,
            "created_at": alert.created_at.isoformat() + "Z"
        })
    
    return {
        "user_identifier": user_identifier,
        "alerts": result,
        "total": len(result)
    }

@app.get("/ip/intel", response_model=IPIntelligenceResponse)
async def get_ip_intelligence(ip: str):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"https://ipwho.is/{ip}")
            
            if response.status_code != 200:
                return IPIntelligenceResponse(
                    ip=ip,
                    success=False,
                    message="Failed to fetch IP intelligence"
                )
            
            data = response.json()
            
            if not data.get("success", False):
                return IPIntelligenceResponse(
                    ip=ip,
                    success=False,
                    message=data.get("message", "IP lookup failed")
                )
            
            security = data.get("security", {})
            is_vpn = security.get("is_vpn", False)
            is_proxy = security.get("is_proxy", False)
            is_tor = security.get("is_tor", False)
            is_datacenter = security.get("is_datacenter", False)
            
            risk_score = 0
            if is_tor:
                risk_score = 90
            elif is_vpn or is_proxy:
                risk_score = 70
            elif is_datacenter:
                risk_score = 50
            else:
                risk_score = 10
            
            if risk_score >= 70:
                risk_level = "High"
            elif risk_score >= 40:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            asn_value = data.get("connection", {}).get("asn")
            asn_str = str(asn_value) if asn_value is not None else None
            
            return IPIntelligenceResponse(
                ip=ip,
                success=True,
                country=data.get("country"),
                country_code=data.get("country_code"),
                region=data.get("region"),
                city=data.get("city"),
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                isp=data.get("connection", {}).get("isp"),
                organization=data.get("connection", {}).get("org"),
                asn=asn_str,
                is_vpn=is_vpn,
                is_proxy=is_proxy,
                is_tor=is_tor,
                is_datacenter=is_datacenter,
                risk_score=risk_score,
                risk_level=risk_level
            )
    except httpx.TimeoutException:
        return IPIntelligenceResponse(
            ip=ip,
            success=False,
            message="IP intelligence service timeout"
        )
    except Exception as e:
        return IPIntelligenceResponse(
            ip=ip,
            success=False,
            message=f"Error: {str(e)}"
        )

@app.get("/safepay/checklist")
async def get_safepay_checklist_endpoint(amount: Optional[float] = None):
    """
    Get SafePay™ checklist for financial transactions.
    
    Args:
        amount: Optional transaction amount
        
    Returns:
        SafePay checklist with verification steps
    """
    return get_safepay_checklist(amount)

@app.get("/usage/status")
async def get_usage_status(user_id: Optional[str] = None, email: Optional[str] = None, db: Session = Depends(get_db)):
    """Get usage status for a user."""
    user = get_or_create_user(db, email=email, user_id=user_id)
    usage_status = check_usage_limit(db, user)
    return {"user_id": user.id, "email": user.email, "tier": user.subscription_tier, "usage": usage_status, "features": get_tier_features(user.subscription_tier)}

@app.get("/tiers")
async def get_subscription_tiers():
    """Get all available subscription tiers."""
    from app.usage_tracking import TIER_LIMITS
    return {"tiers": [
        {"id": "free", "name": "Safety Starter", "price": 0, "billing_period": "month", "monthly_scans": TIER_LIMITS["free"]["monthly_scans"], "features": TIER_LIMITS["free"]["features"], "description": "Essential protection for cautious daters"},
        {"id": "plus", "name": "Protector", "price": 7.99, "billing_period": "month", "monthly_scans": TIER_LIMITS["plus"]["monthly_scans"], "features": TIER_LIMITS["plus"]["features"], "description": "Advanced AI analysis and Guardian Mode"},
        {"id": "premium", "name": "Guardian", "price": 14.99, "billing_period": "month", "monthly_scans": TIER_LIMITS["premium"]["monthly_scans"], "features": TIER_LIMITS["premium"]["features"], "description": "Complete protection with identity verification"},
        {"id": "family", "name": "FamilyLink", "price": 24.99, "billing_period": "month", "monthly_scans": TIER_LIMITS["family"]["monthly_scans"], "features": TIER_LIMITS["family"]["features"], "description": "Protect your whole family with shared dashboard"}
    ]}

@app.post("/auth/register")
async def register_user(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    from app.auth import create_user, create_session
    try:
        user = create_user(db, email, password)
        session_token = create_session(user.id, user.email)
        return {"success": True, "user_id": user.id, "email": user.email, "session_token": session_token}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
async def login_user(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    """Login with email and password."""
    from app.auth import authenticate_user, create_session
    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    session_token = create_session(user.id, user.email)
    return {"success": True, "user_id": user.id, "email": user.email, "session_token": session_token}

@app.post("/auth/magic-link")
async def request_magic_link(email: str = Form(...), db: Session = Depends(get_db)):
    """Request a magic link for passwordless login."""
    from app.auth import create_magic_link
    token = create_magic_link(db, email)
    return {"success": True, "message": "Magic link sent to email", "token": token}

@app.post("/auth/verify-magic-link")
async def verify_magic_link_endpoint(token: str = Form(...)):
    """Verify a magic link token."""
    from app.auth import verify_magic_link, create_session
    user_data = verify_magic_link(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    session_token = create_session(user_data["user_id"], user_data["email"])
    return {"success": True, "user_id": user_data["user_id"], "email": user_data["email"], "session_token": session_token}

@app.post("/auth/logout")
async def logout_user(session_token: str = Form(...)):
    """Logout and invalidate session."""
    from app.auth import invalidate_session
    success = invalidate_session(session_token)
    return {"success": success}

@app.get("/auth/verify-session")
async def verify_session_endpoint(session_token: str):
    """Verify a session token."""
    from app.auth import verify_session
    session_data = verify_session(session_token)
    if not session_data:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return {"success": True, "user_id": session_data["user_id"], "email": session_data["email"]}

@app.post("/stripe/create-checkout")
async def create_stripe_checkout(user_id: int = Form(...), tier: str = Form(...), success_url: str = Form("https://heart-guard-mvp-2.vercel.app/success"), cancel_url: str = Form("https://heart-guard-mvp-2.vercel.app/pricing"), db: Session = Depends(get_db)):
    """Create Stripe checkout session for subscription."""
    from app.stripe_integration import create_checkout_session
    result = create_checkout_session(db, user_id, tier, success_url, cancel_url)
    return result

@app.post("/stripe/create-portal")
async def create_stripe_portal(user_id: int = Form(...), return_url: str = Form("https://heart-guard-mvp-2.vercel.app/account"), db: Session = Depends(get_db)):
    """Create Stripe customer portal session."""
    from app.stripe_integration import create_customer_portal_session
    result = create_customer_portal_session(db, user_id, return_url)
    return result

@app.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events."""
    from app.stripe_integration import handle_webhook_event, verify_webhook_signature
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    if not verify_webhook_signature(payload, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    import json
    event = json.loads(payload)
    result = handle_webhook_event(db, event.get("type"), event.get("data"))
    return result

@app.post("/community/report-scammer")
async def report_scammer_endpoint(user_id: int = Form(...), photo_hash: Optional[str] = Form(None), db: Session = Depends(get_db)):
    from app.community_intelligence import report_scammer
    return report_scammer(db, user_id, photo_hash, None, None, None, None)

@app.get("/community/check")
async def check_community_intelligence_endpoint(photo_hash: Optional[str] = None):
    from app.community_intelligence import check_community_intelligence
    return check_community_intelligence(photo_hash, None, None, None)

@app.get("/community/stats")
async def get_community_stats_endpoint():
    from app.community_intelligence import get_community_stats
    return get_community_stats()

@app.post("/crypto/screen-address")
async def screen_crypto_address_endpoint(address: str = Form(...), currency: str = Form(...)):
    from app.crypto_screening import screen_crypto_address
    return screen_crypto_address(address, currency)

@app.get("/crypto/safety-tips")
async def get_crypto_safety_tips_endpoint():
    from app.crypto_screening import get_crypto_safety_tips
    return {"tips": get_crypto_safety_tips()}

@app.post("/privacy/set-retention")
async def set_retention_policy_endpoint(user_id: int = Form(...), retention_days: int = Form(...), db: Session = Depends(get_db)):
    from app.privacy_controls import set_retention_policy
    return set_retention_policy(db, user_id, retention_days)

@app.get("/privacy/export")
async def export_user_data_endpoint(user_id: int, db: Session = Depends(get_db)):
    from app.privacy_controls import export_user_data
    return export_user_data(db, user_id)

@app.get("/accessibility/settings")
async def get_accessibility_settings_endpoint():
    from app.accessibility import get_accessibility_settings
    return get_accessibility_settings()

@app.get("/accessibility/emergency-contacts")
async def get_emergency_contacts_endpoint():
    from app.accessibility import get_emergency_contacts
    return {"contacts": get_emergency_contacts()}

@app.get("/accessibility/simplified")
async def get_simplified_explanation_endpoint(trust_score: int):
    from app.accessibility import get_simplified_explanation
    return get_simplified_explanation(trust_score)
