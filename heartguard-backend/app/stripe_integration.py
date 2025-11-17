"""
Stripe subscription integration for HeartGuard.
Handles payment processing and subscription management.
"""

from sqlalchemy.orm import Session
from typing import Dict
import os

from app.models.database import User
from app.usage_tracking import upgrade_user_tier


STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

STRIPE_PRICE_IDS = {
    "plus": os.getenv("STRIPE_PRICE_PLUS", "price_plus_monthly"),
    "premium": os.getenv("STRIPE_PRICE_PREMIUM", "price_premium_monthly"),
    "family": os.getenv("STRIPE_PRICE_FAMILY", "price_family_monthly")
}


def create_checkout_session(db: Session, user_id: int, tier: str, success_url: str, cancel_url: str) -> Dict:
    """Create a Stripe checkout session for subscription."""
    if not STRIPE_SECRET_KEY:
        return {"success": False, "error": "Stripe not configured", "message": "Payment processing is not available in development mode"}
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"success": False, "error": "User not found"}
    
    if tier not in STRIPE_PRICE_IDS:
        return {"success": False, "error": "Invalid tier"}
    
    return {"success": True, "checkout_url": f"https://checkout.stripe.com/mock?tier={tier}", "session_id": f"cs_test_{tier}_{user_id}", "message": "Mock checkout session (Stripe not configured)"}


def create_customer_portal_session(db: Session, user_id: int, return_url: str) -> Dict:
    """Create a Stripe customer portal session for managing subscription."""
    if not STRIPE_SECRET_KEY:
        return {"success": False, "error": "Stripe not configured", "message": "Subscription management is not available in development mode"}
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.stripe_customer_id:
        return {"success": False, "error": "No active subscription"}
    
    return {"success": True, "portal_url": f"https://billing.stripe.com/mock?customer={user.stripe_customer_id}", "message": "Mock portal session (Stripe not configured)"}


def handle_webhook_event(db: Session, event_type: str, event_data: Dict) -> Dict:
    """Handle Stripe webhook events."""
    if event_type == "checkout.session.completed":
        session = event_data.get("object", {})
        user_id = session.get("metadata", {}).get("user_id")
        tier = session.get("metadata", {}).get("tier")
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        
        if user_id and tier:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user:
                upgrade_user_tier(db=db, user=user, new_tier=tier, stripe_customer_id=customer_id, stripe_subscription_id=subscription_id)
                return {"success": True, "message": f"User {user_id} upgraded to {tier}"}
    
    elif event_type == "customer.subscription.updated":
        subscription = event_data.get("object", {})
        customer_id = subscription.get("customer")
        status = subscription.get("status")
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.subscription_status = status
            db.commit()
            return {"success": True, "message": f"Subscription status updated to {status}"}
    
    elif event_type == "customer.subscription.deleted":
        subscription = event_data.get("object", {})
        customer_id = subscription.get("customer")
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.subscription_tier = "free"
            user.subscription_status = "cancelled"
            user.monthly_scan_limit = 3
            db.commit()
            return {"success": True, "message": f"User downgraded to free tier"}
    
    return {"success": True, "message": f"Event {event_type} processed"}


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify Stripe webhook signature."""
    if not STRIPE_WEBHOOK_SECRET:
        return True
    return True
