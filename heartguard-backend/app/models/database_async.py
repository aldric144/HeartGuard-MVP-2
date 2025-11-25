"""
Async database configuration for high-concurrency production use.
Migrates from sync SQLAlchemy to async with asyncpg driver.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
import os
from typing import AsyncGenerator

from app.models.database import (
    Base, User, TrustReport, PhotoAnalysis, ChatAnalysis, 
    ManipulationPattern, AnalysisHistory, Conversation, AnalysisPoint,
    GeographicRisk, EvidenceReport, SafetyReply, TrustedContact,
    AlertLog, ScammerProfile, SocialHandle, PaymentInstruction
)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./heartguard.db")

if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://").replace("postgres://", "postgresql+asyncpg://")
else:
    ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")

if ASYNC_DATABASE_URL.startswith("postgresql+asyncpg"):
    async_engine = create_async_engine(
        ASYNC_DATABASE_URL,
        pool_size=150,              # Increased from 20 to handle 1000 RPS
        max_overflow=75,            # Increased from 40 to prevent connection starvation
        pool_timeout=30,            # Wait up to 30s for a connection
        pool_recycle=1800,          # Recycle connections every 30 minutes
        pool_pre_ping=True,         # Verify connections before using
        echo=False,                 # Disable SQL logging in production
    )
else:
    async_engine = create_async_engine(
        ASYNC_DATABASE_URL,
        poolclass=NullPool,
        echo=False,
    )

AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for FastAPI routes to get async database session.
    
    Usage:
        @app.get("/endpoint")
        async def endpoint(db: AsyncSession = Depends(get_async_db)):
            result = await db.execute(select(User))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_async_db():
    """Initialize database tables asynchronously"""
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all, checkfirst=True)
    except Exception as e:
        print(f"Warning during async database initialization: {e}")
        pass

async def populate_safety_replies_async():
    """Populate SafetyReply table with contextual safety suggestions (async version)"""
    from sqlalchemy import select
    
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
        async with AsyncSessionLocal() as session:
            for reply_data in safety_replies_data:
                stmt = select(SafetyReply).filter(
                    SafetyReply.trigger_type == reply_data["trigger_type"],
                    SafetyReply.reply_text == reply_data["reply_text"]
                )
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if not existing:
                    safety_reply = SafetyReply(**reply_data)
                    session.add(safety_reply)
            
            await session.commit()
            print(f"✅ Populated {len(safety_replies_data)} safety reply suggestions (async)")
    except Exception as e:
        print(f"⚠️ Error populating safety replies (async): {e}")

async def populate_geographic_risks_async():
    """Populate GeographicRisk table with comprehensive global romance fraud hotspot data (async version)"""
    from sqlalchemy import select
    
    risk_data = [
        {
            "code": "+234", "region": "Nigeria", "risk_level": "Extreme", "category": "country",
            "scam_types": ["Romance scams", "419 scams", "Catfishing", "Crypto scams", "Investment fraud", "Impersonation fraud"],
            "notes": "Most infamous romance scam region. Large organized cyber-fraud rings in Lagos, Benin City, Abuja."
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
    ]
    
    try:
        async with AsyncSessionLocal() as session:
            for risk in risk_data:
                stmt = select(GeographicRisk).filter(GeographicRisk.code == risk["code"])
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if existing:
                    for key, value in risk.items():
                        setattr(existing, key, value)
                else:
                    geo_risk = GeographicRisk(**risk)
                    session.add(geo_risk)
            
            await session.commit()
            print("✅ Populated geographic risk entries (async)")
    except Exception as e:
        print(f"⚠️ Error populating geographic risks (async): {e}")
