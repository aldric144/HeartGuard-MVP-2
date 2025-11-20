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
    password_hash = Column(String, nullable=True)
    subscription_tier = Column(String, default="free")  # free, plus, premium, family
    subscription_status = Column(String, default="active")  # active, cancelled, expired
    subscription_start_date = Column(DateTime, nullable=True)
    subscription_end_date = Column(DateTime, nullable=True)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    monthly_scan_count = Column(Integer, default=0)
    monthly_scan_limit = Column(Integer, default=3)  # free tier default
    last_reset_date = Column(DateTime, default=datetime.utcnow)
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
    phone_code = Column(String, nullable=True)
    trust_report_id = Column(Integer, ForeignKey("trust_reports.id"), nullable=True)
    
    analysis_points = relationship("AnalysisPoint", back_populates="conversation", cascade="all, delete-orphan")
    evidence_reports = relationship("EvidenceReport", back_populates="conversation", cascade="all, delete-orphan")
    trust_report = relationship("TrustReport")

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

class GeographicRisk(Base):
    __tablename__ = "geographic_risks"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String, unique=True, index=True)
    region = Column(String)
    risk_level = Column(String)
    scam_types = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    category = Column(String, nullable=True)

class EvidenceReport(Base):
    __tablename__ = "evidence_reports"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"))
    dataset_hash = Column(String, unique=True, index=True)
    generated_at = Column(DateTime, default=datetime.utcnow)
    report_data = Column(JSON)
    app_version = Column(String, nullable=True)
    backend_version = Column(String, nullable=True)
    
    conversation = relationship("Conversation", back_populates="evidence_reports")

class SafetyReply(Base):
    __tablename__ = "safety_replies"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trigger_type = Column(String)
    risk_level = Column(String)
    reply_text = Column(Text)
    context = Column(String, nullable=True)
    priority = Column(Integer, default=1)

class TrustedContact(Base):
    __tablename__ = "trusted_contacts"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_identifier = Column(String, index=True)
    contact_name = Column(String)
    contact_email_or_phone = Column(String)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    alert_preference = Column(String, default='EMAIL')
    alert_threshold = Column(Integer, default=40)
    is_active = Column(Boolean, default=True)
    last_alert_timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    alert_logs = relationship("AlertLog", back_populates="contact")

class AlertLog(Base):
    __tablename__ = "alert_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    contact_id = Column(Integer, ForeignKey("trusted_contacts.id"))
    user_identifier = Column(String, index=True)
    conversation_id = Column(String, index=True)
    trust_score = Column(Integer)
    threshold = Column(Integer)
    channel = Column(String, default='N/A')
    reason = Column(Text, nullable=True)
    status = Column(String, default='LOGGED')
    created_at = Column(DateTime, default=datetime.utcnow)
    
    contact = relationship("TrustedContact", back_populates="alert_logs")

class ScammerProfile(Base):
    __tablename__ = "scammer_profiles"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"), unique=True)
    
    claimed_name = Column(String, nullable=True)
    aliases = Column(JSON, nullable=True)  # List of alternate names
    claimed_dob = Column(String, nullable=True)
    claimed_address = Column(Text, nullable=True)
    claimed_occupation = Column(String, nullable=True)
    
    phone_numbers = Column(JSON, nullable=True)  # List of phone numbers
    email_addresses = Column(JSON, nullable=True)  # List of emails
    
    platform_met = Column(String, nullable=True)  # Where you first met
    first_contact_date = Column(String, nullable=True)
    last_contact_date = Column(String, nullable=True)
    communication_channels = Column(JSON, nullable=True)  # List of channels used
    
    total_amount_requested = Column(Float, nullable=True)
    total_amount_sent = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    
    victim_narrative = Column(Text, nullable=True)
    
    ic3_complaint_number = Column(String, nullable=True)
    ftc_report_id = Column(String, nullable=True)
    police_incident_number = Column(String, nullable=True)
    other_agency_references = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    conversation = relationship("Conversation", backref="scammer_profile")
    social_handles = relationship("SocialHandle", back_populates="scammer_profile", cascade="all, delete-orphan")
    payment_instructions = relationship("PaymentInstruction", back_populates="scammer_profile", cascade="all, delete-orphan")

class SocialHandle(Base):
    __tablename__ = "social_handles"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scammer_profile_id = Column(String, ForeignKey("scammer_profiles.id"))
    
    platform = Column(String)  # Tinder, Facebook, Instagram, WhatsApp, Telegram, etc.
    username = Column(String, nullable=True)
    profile_url = Column(String, nullable=True)
    profile_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    scammer_profile = relationship("ScammerProfile", back_populates="social_handles")

class PaymentInstruction(Base):
    __tablename__ = "payment_instructions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scammer_profile_id = Column(String, ForeignKey("scammer_profiles.id"))
    
    method = Column(String)  # Western Union, Bitcoin, Gift Cards, Bank Transfer, etc.
    
    bank_name = Column(String, nullable=True)
    account_holder_name = Column(String, nullable=True)
    account_number = Column(String, nullable=True)  # Store full, mask in PDF
    routing_number = Column(String, nullable=True)
    swift_code = Column(String, nullable=True)
    iban = Column(String, nullable=True)
    
    receiver_name = Column(String, nullable=True)
    receiver_city = Column(String, nullable=True)
    receiver_country = Column(String, nullable=True)
    pickup_location = Column(String, nullable=True)
    
    app_handle = Column(String, nullable=True)  # $cashtag, @venmo, email, phone
    
    crypto_chain = Column(String, nullable=True)  # BTC, ETH, TRX, etc.
    crypto_address = Column(String, nullable=True)
    crypto_memo = Column(String, nullable=True)
    exchange_platform = Column(String, nullable=True)
    exchange_uid = Column(String, nullable=True)
    
    gift_card_brand = Column(String, nullable=True)
    gift_card_amount = Column(Float, nullable=True)
    
    amount_requested = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    
    scammer_profile = relationship("ScammerProfile", back_populates="payment_instructions")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./heartguard.db")

if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=40,
        pool_pre_ping=True,
        pool_recycle=3600,
    )
else:
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
    
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    
    if 'trusted_contacts' in inspector.get_table_names():
        existing_columns = [col['name'] for col in inspector.get_columns('trusted_contacts')]
        
        with engine.connect() as conn:
            if 'contact_email' not in existing_columns:
                conn.execute(text('ALTER TABLE trusted_contacts ADD COLUMN contact_email TEXT'))
                conn.commit()
                print('✅ Added contact_email column to trusted_contacts')
            
            if 'contact_phone' not in existing_columns:
                conn.execute(text('ALTER TABLE trusted_contacts ADD COLUMN contact_phone TEXT'))
                conn.commit()
                print('✅ Added contact_phone column to trusted_contacts')
            
            if 'alert_threshold' not in existing_columns:
                conn.execute(text('ALTER TABLE trusted_contacts ADD COLUMN alert_threshold INTEGER DEFAULT 40'))
                conn.commit()
                print('✅ Added alert_threshold column to trusted_contacts')

def populate_safety_replies():
    """Populate SafetyReply table with contextual safety suggestions"""
    db = SessionLocal()
    
    safety_replies_data = [
        {
            "trigger_type": "wallet_watch",
            "risk_level": "high",
            "reply_text": "I need to verify your identity through a video call before discussing any financial matters.",
            "context": "financial_request",
            "priority": 1
        },
        {
            "trigger_type": "wallet_watch",
            "risk_level": "high",
            "reply_text": "I don't send money to people I haven't met in person. Can we meet first?",
            "context": "financial_request",
            "priority": 2
        },
        {
            "trigger_type": "wallet_watch",
            "risk_level": "high",
            "reply_text": "I'm not comfortable with this request. Let's take things slower.",
            "context": "financial_request",
            "priority": 3
        },
        
        {
            "trigger_type": "trust_drop",
            "risk_level": "high",
            "reply_text": "I've noticed some inconsistencies in what you've told me. Can you clarify?",
            "context": "inconsistency_detected",
            "priority": 1
        },
        {
            "trigger_type": "trust_drop",
            "risk_level": "high",
            "reply_text": "I need some time to think about our conversation. Let's talk later.",
            "context": "inconsistency_detected",
            "priority": 2
        },
        
        {
            "trigger_type": "tone_shift",
            "risk_level": "high",
            "reply_text": "Your tone seems to have changed suddenly. Is everything okay?",
            "context": "manipulation_detected",
            "priority": 1
        },
        {
            "trigger_type": "tone_shift",
            "risk_level": "high",
            "reply_text": "I'm feeling pressured. I need to take a step back from this conversation.",
            "context": "manipulation_detected",
            "priority": 2
        },
        
        {
            "trigger_type": "wallet_watch",
            "risk_level": "extreme",
            "reply_text": "This sounds like an emergency. Have you contacted the proper authorities or your family?",
            "context": "emergency_claim",
            "priority": 1
        },
        {
            "trigger_type": "wallet_watch",
            "risk_level": "extreme",
            "reply_text": "I can't help with urgent financial requests. Please seek help from official channels.",
            "context": "emergency_claim",
            "priority": 2
        },
        
        {
            "trigger_type": "general",
            "risk_level": "medium",
            "reply_text": "I prefer to keep our conversations light until we know each other better.",
            "context": "boundary_setting",
            "priority": 1
        },
        {
            "trigger_type": "general",
            "risk_level": "medium",
            "reply_text": "Let's verify each other's identities before sharing personal information.",
            "context": "boundary_setting",
            "priority": 2
        }
    ]
    
    try:
        for reply_data in safety_replies_data:
            existing = db.query(SafetyReply).filter(
                SafetyReply.trigger_type == reply_data["trigger_type"],
                SafetyReply.reply_text == reply_data["reply_text"]
            ).first()
            
            if not existing:
                safety_reply = SafetyReply(**reply_data)
                db.add(safety_reply)
        
        db.commit()
        print(f"✅ Populated {len(safety_replies_data)} safety reply suggestions")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Error populating safety replies: {e}")
    finally:
        db.close()

def populate_geographic_risks():
    """Populate GeographicRisk table with comprehensive global romance fraud hotspot data.
    Uses upsert logic to allow safe updates and expansions."""
    db = SessionLocal()
    
    risk_data = [
        {
            "code": "+234", "region": "Nigeria", "risk_level": "Extreme", "category": "country",
            "scam_types": ["Romance scams", "419 scams", "Catfishing", "Crypto scams", "Investment fraud", "Impersonation fraud"],
            "notes": "Most infamous romance scam region. Large organized cyber-fraud rings in Lagos, Benin City, Abuja. Extremely high volume internet fraud operations."
        },
        {
            "code": "+233", "region": "Ghana", "risk_level": "Extreme", "category": "country",
            "scam_types": ["Romance manipulation", "Identity fraud", "Fake soldier scams", "Crypto-investment lures"],
            "notes": "Second-largest West African romance-scam hub. Major scammer networks in Accra, Kumasi, Tema."
        },
        {
            "code": "+225", "region": "Ivory Coast", "risk_level": "Extreme", "category": "country",
            "scam_types": ["Romance scams", "Facebook lover fraud", "Military romance impersonations", "Money requests"],
            "notes": "Known for romance scams and military impersonation fraud."
        },
        {
            "code": "+254", "region": "Kenya", "risk_level": "Extreme", "category": "country",
            "scam_types": ["Online dating fraud", "Mobile money scams", "Romance scams"],
            "notes": "Used for online dating fraud and romance scams on Facebook, TikTok, Instagram."
        },
        
        {
            "code": "+27", "region": "South Africa", "risk_level": "High", "category": "country",
            "scam_types": ["Fake sugar-mama/daddy scams", "Investment scams", "Romance scams", "Fake mining/inheritance scams"],
            "notes": "Used for fake sugar-mama/daddy scams and investment fraud."
        },
        {
            "code": "+228", "region": "Togo", "risk_level": "High", "category": "country",
            "scam_types": ["Romance scams", "Fake U.N. worker scams", "Fake doctor/military scams"],
            "notes": "Small but active scam region. Scammers often pose as U.N. workers, doctors, or military."
        },
        {
            "code": "+229", "region": "Benin", "risk_level": "High", "category": "country",
            "scam_types": ["Fake inheritance scams", "Romance scams", "Emergency money scams"],
            "notes": "Used often for fake inheritance and romance emergency money scams."
        },
        {
            "code": "+237", "region": "Cameroon", "risk_level": "High", "category": "country",
            "scam_types": ["Romance scams", "Social media manipulation", "Sextortion", "Blackmail"],
            "notes": "Major hotspot for romance, social media manipulation, and blackmail/sextortion."
        },
        
        {
            "code": "+63", "region": "Philippines", "risk_level": "Extreme", "category": "country",
            "scam_types": ["Romance scams", "Crypto investment scams", "Fake-model identity scams"],
            "notes": "Used for romance scams, crypto investment scams, and fake-model identity fraud."
        },
        {
            "code": "+60", "region": "Malaysia", "risk_level": "Extreme", "category": "country",
            "scam_types": ["Romance-lure investment fraud", "WhatsApp emergency scams"],
            "notes": "Used for romance-lure investment fraud and WhatsApp emergency scams."
        },
        
        {
            "code": "+66", "region": "Thailand", "risk_level": "High", "category": "country",
            "scam_types": ["Pig-butchering scams", "Romance-investment scams", "Crypto scams"],
            "notes": "Heavily linked to pig-butchering romance-investment scams, especially by Chinese crime syndicates operating in SE Asia."
        },
        {
            "code": "+84", "region": "Vietnam", "risk_level": "High", "category": "country",
            "scam_types": ["Romance scams", "Investment fraud"],
            "notes": "Used for romance and investment fraud operations."
        },
        {
            "code": "+62", "region": "Indonesia", "risk_level": "High", "category": "country",
            "scam_types": ["Romance scams", "Investment fraud"],
            "notes": "Active in romance and investment fraud."
        },
        {
            "code": "+91", "region": "India", "risk_level": "High", "category": "country",
            "scam_types": ["Romance scams", "Tech support scams", "Loan scams", "Investment scams"],
            "notes": "Large call-center based fraud groups running romance, tech support, loan, and investment scams."
        },
        {
            "code": "+92", "region": "Pakistan", "risk_level": "High", "category": "country",
            "scam_types": ["Romance manipulation", "Blackmail", "Identity theft"],
            "notes": "Used for romance manipulation, blackmail, and identity theft."
        },
        {
            "code": "+880", "region": "Bangladesh", "risk_level": "High", "category": "country",
            "scam_types": ["Romance scams", "Investment fraud"],
            "notes": "Active in romance and investment fraud operations."
        },
        {
            "code": "+86", "region": "China", "risk_level": "High", "category": "country",
            "scam_types": ["Crypto investment scams", "Pig butchering scams"],
            "notes": "Not usually romance scams, but heavily used for crypto investment and pig-butchering scams. Often scammers operate from Cambodia, Myanmar, Laos, Thailand but use Chinese VPNs."
        },
        {
            "code": "+852", "region": "Hong Kong", "risk_level": "High", "category": "country",
            "scam_types": ["Investment scams", "Romance-investment hybrids", "Crypto platform scams"],
            "notes": "Used for investment and romance-investment hybrid scams, crypto platform fraud."
        },
        {
            "code": "+855", "region": "Cambodia", "risk_level": "High", "category": "country",
            "scam_types": ["Pig-butchering scams", "Romance-investment scams"],
            "notes": "Major pig-butchering scam compound centers."
        },
        {
            "code": "+856", "region": "Laos", "risk_level": "High", "category": "country",
            "scam_types": ["Pig-butchering scams", "Romance-investment scams"],
            "notes": "Scam compound centers for pig-butchering operations."
        },
        {
            "code": "+95", "region": "Myanmar", "risk_level": "High", "category": "country",
            "scam_types": ["Pig-butchering scams", "Romance-investment scams"],
            "notes": "Scam compound centers for pig-butchering operations."
        },
        
        {
            "code": "+380", "region": "Ukraine", "risk_level": "High", "category": "country",
            "scam_types": ["Fake dating sites", "Romance gift-card fraud", "Translator fee scams"],
            "notes": "Legitimate dating market exists, but also fake dating sites, romance gift-card fraud, and translator fee scams."
        },
        {
            "code": "+7", "region": "Russia", "risk_level": "High", "category": "country",
            "scam_types": ["Romance fraud", "Fake soldier scams", "Model/dating-site scams"],
            "notes": "Used in romance fraud, fake soldier scams, and model/dating-site scams."
        },
        {
            "code": "+40", "region": "Romania", "risk_level": "High", "category": "country",
            "scam_types": ["Romance fraud", "Sextortion", "Blackmail scams"],
            "notes": "Major base for romance fraud, sextortion, and blackmail scams."
        },
        {
            "code": "+371", "region": "Latvia", "risk_level": "High", "category": "country",
            "scam_types": ["Fake dating-site operators", "Fake escort romance scams"],
            "notes": "Known globally for fake dating-site operators and fake escort romance scams."
        },
        
        {
            "code": "+90", "region": "Turkey", "risk_level": "Medium", "category": "country",
            "scam_types": ["Romance scams", "Emergency payment scams", "Stuck at airport fraud"],
            "notes": "Used for romance and emergency payment scams, including stuck at airport romance fraud."
        },
        {
            "code": "+971", "region": "UAE/Dubai", "risk_level": "High", "category": "country",
            "scam_types": ["Fake investor/entrepreneur romance scams", "Crypto romance scams"],
            "notes": "Used for fake investor/entrepreneur romance scams and crypto romance scams."
        },
        {
            "code": "+20", "region": "Egypt", "risk_level": "Medium", "category": "country",
            "scam_types": ["Romance scams", "Investment fraud"],
            "notes": "Active in romance and investment fraud."
        },
        {
            "code": "+212", "region": "Morocco", "risk_level": "Medium", "category": "country",
            "scam_types": ["Romance scams", "Investment fraud"],
            "notes": "Used for romance and investment fraud operations."
        },
        
        {
            "code": "+55", "region": "Brazil", "risk_level": "Medium", "category": "country",
            "scam_types": ["Romance scams", "Investment fraud"],
            "notes": "Active in romance and investment fraud."
        },
        {
            "code": "+52", "region": "Mexico", "risk_level": "Medium", "category": "country",
            "scam_types": ["Romance scams", "Investment fraud"],
            "notes": "Used for romance and investment fraud operations."
        },
        {
            "code": "+57", "region": "Colombia", "risk_level": "Medium", "category": "country",
            "scam_types": ["Romance scams", "Investment fraud"],
            "notes": "Active in romance and investment fraud."
        },
        
        {
            "code": "+1-876", "region": "Jamaica", "risk_level": "Extreme", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams", "Money requests", "Stranded scams"],
            "notes": "Highest-risk Caribbean code. Heavy romance and phone scam activity."
        },
        {
            "code": "+1-658", "region": "Jamaica (overlay)", "risk_level": "Extreme", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams", "Money requests"],
            "notes": "Jamaica overlay code with high scam activity."
        },
        {
            "code": "+1-473", "region": "Grenada", "risk_level": "High", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams", "Money requests"],
            "notes": "High-risk Caribbean scam code."
        },
        {
            "code": "+1-809", "region": "Dominican Republic", "risk_level": "High", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams", "Money requests"],
            "notes": "Dominican Republic primary code with high scam volume."
        },
        {
            "code": "+1-829", "region": "Dominican Republic", "risk_level": "High", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams", "Money requests"],
            "notes": "Dominican Republic overlay code with high scam activity."
        },
        {
            "code": "+1-849", "region": "Dominican Republic", "risk_level": "High", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams", "Money requests"],
            "notes": "Dominican Republic overlay code with high scam activity."
        },
        {
            "code": "+1-868", "region": "Trinidad & Tobago", "risk_level": "High", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams", "Money requests"],
            "notes": "High-risk Caribbean code."
        },
        {
            "code": "+1-246", "region": "Barbados", "risk_level": "High", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "High-risk Caribbean code."
        },
        {
            "code": "+1-758", "region": "St. Lucia", "risk_level": "High", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "High-risk Caribbean code."
        },
        {
            "code": "+1-784", "region": "St. Vincent", "risk_level": "High", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "High-risk Caribbean code."
        },
        {
            "code": "+1-284", "region": "British Virgin Islands", "risk_level": "High", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "High-risk Caribbean code."
        },
        {
            "code": "+1-242", "region": "Bahamas", "risk_level": "Medium", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "Medium-risk Caribbean code."
        },
        {
            "code": "+1-264", "region": "Anguilla", "risk_level": "Medium", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "Medium-risk Caribbean code."
        },
        {
            "code": "+1-268", "region": "Antigua & Barbuda", "risk_level": "Medium", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "Medium-risk Caribbean code."
        },
        {
            "code": "+1-345", "region": "Cayman Islands", "risk_level": "Medium", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "Medium-risk Caribbean code."
        },
        {
            "code": "+1-664", "region": "Montserrat", "risk_level": "Medium", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "Medium-risk Caribbean code."
        },
        {
            "code": "+1-721", "region": "Sint Maarten", "risk_level": "Medium", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "Medium-risk Caribbean code."
        },
        {
            "code": "+1-767", "region": "Dominica", "risk_level": "Medium", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "Medium-risk Caribbean code."
        },
        {
            "code": "+1-649", "region": "Turks & Caicos", "risk_level": "Medium", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "Medium-risk Caribbean code."
        },
        {
            "code": "+1-441", "region": "Bermuda", "risk_level": "Medium", "category": "caribbean",
            "scam_types": ["Romance call-backs", "One-ring scams"],
            "notes": "Medium-risk Caribbean code."
        },
        
        {
            "code": "+1-787", "region": "Puerto Rico", "risk_level": "High", "category": "us_territory",
            "scam_types": ["Spoofing scams", "Romance call-backs"],
            "notes": "Puerto Rico code used in spoofing scams."
        },
        {
            "code": "+1-939", "region": "Puerto Rico", "risk_level": "High", "category": "us_territory",
            "scam_types": ["Spoofing scams", "Romance call-backs"],
            "notes": "Puerto Rico overlay code used in spoofing scams."
        },
        {
            "code": "+1-340", "region": "US Virgin Islands", "risk_level": "High", "category": "us_territory",
            "scam_types": ["Spoofing scams", "Romance call-backs"],
            "notes": "US Virgin Islands code used in spoofing scams."
        },
        {
            "code": "+1-670", "region": "Northern Mariana Islands", "risk_level": "Medium", "category": "us_territory",
            "scam_types": ["Spoofing scams"],
            "notes": "Northern Mariana Islands code sometimes used in spoofing."
        },
        {
            "code": "+1-671", "region": "Guam", "risk_level": "Medium", "category": "us_territory",
            "scam_types": ["Spoofing scams"],
            "notes": "Guam code sometimes used in spoofing."
        },
        
        {
            "code": "+1-216", "region": "Ohio", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "High scam/spam activity. Often spoofed by scammers abroad using VOIP."
        },
        {
            "code": "+1-218", "region": "Minnesota", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "High scam/spam activity. Often spoofed."
        },
        {
            "code": "+1-332", "region": "New York", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "New York overlay code with high scam activity."
        },
        {
            "code": "+1-347", "region": "New York", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "New York overlay code with high scam activity."
        },
        {
            "code": "+1-646", "region": "New York", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "New York overlay code with high scam activity."
        },
        {
            "code": "+1-657", "region": "California", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "California overlay code with high scam activity."
        },
        {
            "code": "+1-712", "region": "Iowa", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Conference call scams"],
            "notes": "Iowa code with high scam/spam activity."
        },
        {
            "code": "+1-725", "region": "Las Vegas, Nevada", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "Las Vegas overlay code with high scam activity."
        },
        {
            "code": "+1-702", "region": "Las Vegas, Nevada", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "Las Vegas primary code with high scam activity."
        },
        {
            "code": "+1-770", "region": "Georgia", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "Georgia overlay code with high scam activity."
        },
        {
            "code": "+1-678", "region": "Georgia", "risk_level": "Medium", "category": "us_spoofed",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "Georgia overlay code with high scam activity."
        },
        
        {
            "code": "+1-807", "region": "Ontario, Canada", "risk_level": "Medium", "category": "canada",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "Ontario code linked to high scam volume, often spoofed."
        },
        {
            "code": "+1-867", "region": "Northern Canada", "risk_level": "Medium", "category": "canada",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "Northern Canada code linked to scam activity."
        },
        {
            "code": "+1-778", "region": "British Columbia, Canada", "risk_level": "Medium", "category": "canada",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "British Columbia overlay code with scam activity."
        },
        {
            "code": "+1-604", "region": "British Columbia, Canada", "risk_level": "Medium", "category": "canada",
            "scam_types": ["VOIP spoofing", "Romance scams"],
            "notes": "British Columbia primary code with scam activity."
        },
    ]
    
    for entry in risk_data:
        existing = db.query(GeographicRisk).filter(GeographicRisk.code == entry["code"]).first()
        if existing:
            existing.region = entry["region"]
            existing.risk_level = entry["risk_level"]
            existing.scam_types = entry.get("scam_types")
            existing.notes = entry.get("notes")
            existing.category = entry.get("category")
        else:
            risk = GeographicRisk(**entry)
            db.add(risk)
    
    db.commit()
    db.close()
