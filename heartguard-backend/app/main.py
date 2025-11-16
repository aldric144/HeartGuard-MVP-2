from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
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
    populate_geographic_risks
)
from app.toneshift_engine import toneshift_engine
from app.evidence_locker import generate_evidence_pdf
import re

load_dotenv()

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

def calculate_trust_score(photo_analysis: Optional[PhotoAnalysisResponse], 
                         chat_analysis: Optional[ChatAnalysisResponse],
                         metadata_analysis: Optional[MetadataAnalysisResponse] = None) -> tuple[int, str, str, List[str]]:
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
    
    weighted_score = (
        (toneshift_score * 0.50) +
        (walletwatch_score * 0.30) +
        (photo_score * 0.15) +
        (metadata_score * 0.05)
    )
    
    final_score = int(round(weighted_score))
    
    if final_score >= 70:
        color_band = "green"
        confidence = "High"
    elif final_score >= 40:
        color_band = "yellow"
        confidence = "Medium"
    else:
        color_band = "red"
        confidence = "Low"
    
    return final_score, confidence, color_band, insights[:3]

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
            conversation = DBConversation(id=str(uuid.uuid4()), phone_code=phone_code)
            db.add(conversation)
            db.flush()
            
            prev_final_score = calculate_trust_score(photo_analysis, None, metadata_analysis)[0]
            prev_toneshift_contrib = 50
            
            for i, msg_text in enumerate(messages_list, start=1):
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
    
    trust_score, confidence, color_band, insights = calculate_trust_score(photo_analysis, chat_analysis, metadata_analysis)
    
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
    
    db.commit()
    db.refresh(db_report)
    
    if trust_score < 50 and conversation:
        from app.models.database import TrustedContact
        
        # Log potential alert for all linked trusted contacts
        contacts = db.query(TrustedContact).filter(
            TrustedContact.user_identifier == conversation.id,
            TrustedContact.is_active == True
        ).all()
        
        if contacts:
            print(f"⚠️ Guardian Mode Alert: Trust score {trust_score} below threshold for conversation {conversation.id}")
            print(f"📧 Would notify {len(contacts)} trusted contact(s):")
            for contact in contacts:
                print(f"   - {contact.contact_name} ({contact.contact_email_or_phone}) via {contact.alert_preference}")
    
    report = TrustScoreReport(
        report_id=report_id,
        trust_score=trust_score,
        confidence_level=confidence,
        color_band=color_band,
        top_risk_insights=insights,
        photo_analysis=photo_analysis,
        chat_analysis=chat_analysis,
        created_at=db_report.created_at.isoformat(),
        conversation_id=conversation.id if conversation else None
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
    
    app_version = os.getenv("APP_VERSION", "1.0.0")
    backend_version = os.getenv("BACKEND_VERSION", "1.0.0")
    
    pdf_buffer, dataset_hash, report_data = generate_evidence_pdf(
        conversation, 
        analysis_points, 
        geographic_risk,
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


@app.post("/guardian/contact/add")
async def add_trusted_contact(
    user_identifier: str,
    contact_name: str,
    contact_email_or_phone: str,
    alert_preference: str = 'EMAIL',
    db: Session = Depends(get_db)
):
    """
    Add a trusted contact for Guardian Mode alerts.
    
    Args:
        user_identifier: User ID or conversation ID
        contact_name: Name of the trusted contact
        contact_email_or_phone: Email or phone number for alerts
        alert_preference: Alert method (EMAIL, SMS, NONE)
        db: Database session
        
    Returns:
        Created trusted contact record
    """
    from app.models.database import TrustedContact
    
    trusted_contact = TrustedContact(
        user_identifier=user_identifier,
        contact_name=contact_name,
        contact_email_or_phone=contact_email_or_phone,
        alert_preference=alert_preference,
        is_active=True
    )
    
    db.add(trusted_contact)
    db.commit()
    db.refresh(trusted_contact)
    
    return {
        "id": trusted_contact.id,
        "user_identifier": trusted_contact.user_identifier,
        "contact_name": trusted_contact.contact_name,
        "contact_email_or_phone": trusted_contact.contact_email_or_phone,
        "alert_preference": trusted_contact.alert_preference,
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
                "contact_email_or_phone": contact.contact_email_or_phone,
                "alert_preference": contact.alert_preference,
                "last_alert_timestamp": contact.last_alert_timestamp.isoformat() + "Z" if contact.last_alert_timestamp else None,
                "created_at": contact.created_at.isoformat() + "Z"
            }
            for contact in contacts
        ]
    }
