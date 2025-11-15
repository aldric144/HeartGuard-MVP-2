from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
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
    AnalysisHistory
)
from app.toneshift_engine import toneshift_engine

load_dotenv()

app = FastAPI()

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
    init_db()

class ChatAnalysisRequest(BaseModel):
    messages: List[str]

class PhotoAnalysisResponse(BaseModel):
    image_hash: str
    reverse_image_matches: int
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

class TrustScoreReport(BaseModel):
    report_id: str
    trust_score: int
    confidence_level: str
    color_band: str
    top_risk_insights: List[str]
    photo_analysis: Optional[PhotoAnalysisResponse] = None
    chat_analysis: Optional[ChatAnalysisResponse] = None
    created_at: str

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

def simulate_reverse_image_search(image_hash: str) -> int:
    hash_sum = sum(ord(c) for c in image_hash)
    return (hash_sum % 20) + 1

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
                         chat_analysis: Optional[ChatAnalysisResponse]) -> tuple[int, str, str, List[str]]:
    score = 100
    insights = []
    
    if photo_analysis:
        if photo_analysis.reverse_image_matches > 10:
            score -= 30
            insights.append(f"Photo found in {photo_analysis.reverse_image_matches} online profiles")
        elif photo_analysis.reverse_image_matches > 5:
            score -= 15
            insights.append(f"Photo appears in {photo_analysis.reverse_image_matches} other locations")
        
        if photo_analysis.deepfake_confidence == "Suspicious":
            score -= 25
            insights.append("Photo shows signs of manipulation or editing")
        elif photo_analysis.deepfake_confidence == "Fake/Deepfake":
            score -= 40
            insights.append("Photo likely AI-generated or heavily manipulated")
        
        if photo_analysis.metadata_issues:
            score -= 10
            insights.append(f"Photo metadata issues detected ({len(photo_analysis.metadata_issues)} problems)")
    
    if chat_analysis:
        critical_patterns = [p for p in chat_analysis.manipulation_patterns if p.severity == "Critical"]
        high_patterns = [p for p in chat_analysis.manipulation_patterns if p.severity == "High"]
        
        if critical_patterns:
            score -= len(critical_patterns) * 20
            insights.append(f"{len(critical_patterns)} critical manipulation pattern(s) detected")
        
        if high_patterns:
            score -= len(high_patterns) * 10
            insights.append(f"{len(high_patterns)} high-risk manipulation pattern(s) detected")
        
        if chat_analysis.emotional_manipulation_index > 0.6:
            score -= 15
            insights.append(f"High emotional manipulation index ({chat_analysis.emotional_manipulation_index:.2f})")
    
    score = max(0, min(100, score))
    
    if score >= 70:
        color_band = "green"
        confidence = "High"
    elif score >= 40:
        color_band = "yellow"
        confidence = "Medium"
    else:
        color_band = "red"
        confidence = "Low"
    
    return score, confidence, color_band, insights[:3]

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/analyze/photo", response_model=PhotoAnalysisResponse)
async def analyze_photo(file: UploadFile = File(...)):
    image_data = await file.read()
    
    image_hash = hashlib.md5(image_data).hexdigest()
    
    reverse_matches = simulate_reverse_image_search(image_hash)
    
    deepfake_confidence, metadata_issues = detect_deepfake(image_data)
    
    if reverse_matches > 10 or deepfake_confidence == "Suspicious":
        risk_level = "High"
    elif reverse_matches > 5 or metadata_issues:
        risk_level = "Medium"
    else:
        risk_level = "Low"
    
    return PhotoAnalysisResponse(
        image_hash=image_hash,
        reverse_image_matches=reverse_matches,
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

@app.post("/trustscore/generate", response_model=TrustScoreReport)
async def generate_trust_score(
    photo_file: Optional[UploadFile] = File(None),
    chat_messages: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    photo_analysis = None
    chat_analysis = None
    
    if photo_file:
        image_data = await photo_file.read()
        image_hash = hashlib.md5(image_data).hexdigest()
        reverse_matches = simulate_reverse_image_search(image_hash)
        deepfake_confidence, metadata_issues = detect_deepfake(image_data)
        
        if reverse_matches > 10 or deepfake_confidence == "Suspicious":
            risk_level = "High"
        elif reverse_matches > 5 or metadata_issues:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        photo_analysis = PhotoAnalysisResponse(
            image_hash=image_hash,
            reverse_image_matches=reverse_matches,
            deepfake_confidence=deepfake_confidence,
            metadata_issues=metadata_issues,
            risk_level=risk_level
        )
    
    if chat_messages:
        messages_list = [msg.strip() for msg in chat_messages.split("\n") if msg.strip()]
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
    
    trust_score, confidence, color_band, insights = calculate_trust_score(photo_analysis, chat_analysis)
    
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
    
    report = TrustScoreReport(
        report_id=report_id,
        trust_score=trust_score,
        confidence_level=confidence,
        color_band=color_band,
        top_risk_insights=insights,
        photo_analysis=photo_analysis,
        chat_analysis=chat_analysis,
        created_at=db_report.created_at.isoformat()
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
