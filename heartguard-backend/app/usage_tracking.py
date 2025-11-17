"""
Usage tracking system for subscription tiers.
Tracks scan counts and enforces tier limits.
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Optional

from app.models.database import User


TIER_LIMITS = {
    "free": {
        "monthly_scans": 3,
        "features": ["basic_scan", "trust_score", "evidence_locker"]
    },
    "plus": {
        "monthly_scans": 20,
        "features": ["basic_scan", "trust_score", "evidence_locker", "explainable_ai", "safety_nudges", "guardian_mode"]
    },
    "premium": {
        "monthly_scans": 100,
        "features": ["basic_scan", "trust_score", "evidence_locker", "explainable_ai", "safety_nudges", "guardian_mode", "identity_challenges", "priority_support"]
    },
    "family": {
        "monthly_scans": 100,  # per member
        "features": ["basic_scan", "trust_score", "evidence_locker", "explainable_ai", "safety_nudges", "guardian_mode", "identity_challenges", "priority_support", "family_dashboard"]
    }
}


def get_or_create_user(db: Session, email: Optional[str] = None, user_id: Optional[str] = None) -> User:
    """
    Get existing user or create anonymous user.
    
    Args:
        db: Database session
        email: Optional email address
        user_id: Optional user ID
        
    Returns:
        User object
    """
    if email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            return user
        
        user = User(
            email=email,
            subscription_tier="free",
            monthly_scan_limit=TIER_LIMITS["free"]["monthly_scans"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    if user_id:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user:
            return user
    
    user = User(
        subscription_tier="free",
        monthly_scan_limit=TIER_LIMITS["free"]["monthly_scans"]
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def check_usage_limit(db: Session, user: User) -> Dict:
    """
    Check if user has exceeded their usage limit.
    
    Args:
        db: Database session
        user: User object
        
    Returns:
        Dict with usage status
    """
    now = datetime.utcnow()
    if user.last_reset_date:
        days_since_reset = (now - user.last_reset_date).days
        if days_since_reset >= 30:
            user.monthly_scan_count = 0
            user.last_reset_date = now
            db.commit()
    
    if user.monthly_scan_count >= user.monthly_scan_limit:
        return {
            "allowed": False,
            "reason": "monthly_limit_exceeded",
            "current_count": user.monthly_scan_count,
            "limit": user.monthly_scan_limit,
            "tier": user.subscription_tier,
            "upgrade_required": True
        }
    
    return {
        "allowed": True,
        "current_count": user.monthly_scan_count,
        "limit": user.monthly_scan_limit,
        "remaining": user.monthly_scan_limit - user.monthly_scan_count,
        "tier": user.subscription_tier
    }


def increment_usage(db: Session, user: User) -> None:
    """
    Increment user's monthly scan count.
    
    Args:
        db: Database session
        user: User object
    """
    user.monthly_scan_count += 1
    db.commit()


def get_tier_features(tier: str) -> list:
    """
    Get list of features available for a tier.
    
    Args:
        tier: Subscription tier name
        
    Returns:
        List of feature names
    """
    return TIER_LIMITS.get(tier, TIER_LIMITS["free"])["features"]


def check_feature_access(user: User, feature: str) -> bool:
    """
    Check if user has access to a specific feature.
    
    Args:
        user: User object
        feature: Feature name
        
    Returns:
        True if user has access, False otherwise
    """
    tier_features = get_tier_features(user.subscription_tier)
    return feature in tier_features


def upgrade_user_tier(db: Session, user: User, new_tier: str, stripe_customer_id: Optional[str] = None, stripe_subscription_id: Optional[str] = None) -> User:
    """
    Upgrade user to a new subscription tier.
    
    Args:
        db: Database session
        user: User object
        new_tier: New subscription tier
        stripe_customer_id: Optional Stripe customer ID
        stripe_subscription_id: Optional Stripe subscription ID
        
    Returns:
        Updated user object
    """
    user.subscription_tier = new_tier
    user.monthly_scan_limit = TIER_LIMITS[new_tier]["monthly_scans"]
    user.subscription_status = "active"
    user.subscription_start_date = datetime.utcnow()
    user.subscription_end_date = datetime.utcnow() + timedelta(days=30)
    
    if stripe_customer_id:
        user.stripe_customer_id = stripe_customer_id
    if stripe_subscription_id:
        user.stripe_subscription_id = stripe_subscription_id
    
    db.commit()
    db.refresh(user)
    return user
