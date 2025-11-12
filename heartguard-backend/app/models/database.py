from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import os

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
