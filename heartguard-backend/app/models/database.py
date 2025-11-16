from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import os
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    reports = relationship("TrustReport", back_populates="user")

class TrustReport(Base):
    __tablename__ = "trust_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    trust_score = Column(Integer)
    confidence_level = Column(String)
    color_band = Column(String)
    top_risk_insights = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="reports")
    photo_analysis = relationship("PhotoAnalysis", back_populates="report", uselist=False)
    chat_analysis = relationship("ChatAnalysis", back_populates="report", uselist=False)

class PhotoAnalysis(Base):
    __tablename__ = "photo_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("trust_reports.id"))
    image_hash = Column(String)
    reverse_image_matches = Column(Integer)
    duplication_score = Column(Integer, nullable=True)
    metadata_integrity_score = Column(Integer, nullable=True)
    final_photo_score = Column(Integer, nullable=True)
    deepfake_confidence = Column(String)
    metadata_issues = Column(JSON)
    risk_level = Column(String)
    
    report = relationship("TrustReport", back_populates="photo_analysis")

class ChatAnalysis(Base):
    __tablename__ = "chat_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("trust_reports.id"))
    sentiment_drift = Column(JSON)
    emotional_manipulation_index = Column(Float)
    risk_level = Column(String)
    
    report = relationship("TrustReport", back_populates="chat_analysis")
    manipulation_patterns = relationship("ManipulationPattern", back_populates="chat_analysis")

class ManipulationPattern(Base):
    __tablename__ = "manipulation_patterns"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_analysis_id = Column(Integer, ForeignKey("chat_analyses.id"))
    pattern_type = Column(String)
    severity = Column(String)
    evidence = Column(Text)
    timestamp = Column(String, nullable=True)
    
    chat_analysis = relationship("ChatAnalysis", back_populates="manipulation_patterns")

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    report_id = Column(String)
    action = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    start_date = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    final_trust_score = Column(Integer, nullable=True)
    
    analysis_points = relationship("AnalysisPoint", back_populates="conversation", cascade="all, delete-orphan")

class AnalysisPoint(Base):
    __tablename__ = "analysis_points"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(String, ForeignKey("conversations.id"))
    message_index = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    message_text = Column(Text)
    trust_score_delta = Column(Integer)
    tone_shift_delta = Column(Integer)
    wallet_watch_flag = Column(Boolean, default=False)
    risk_rationale = Column(Text)
    
    conversation = relationship("Conversation", back_populates="analysis_points")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./heartguard.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
