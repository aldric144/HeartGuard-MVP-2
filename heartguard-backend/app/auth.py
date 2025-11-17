"""
Authentication system for HeartGuard.
Supports email/password and magic link authentication.
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, Dict
import hashlib
import secrets

from app.models.database import User


def hash_password(password: str) -> str:
    """Hash a password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return hash_password(password) == password_hash


def create_user(db: Session, email: str, password: str) -> User:
    """Create a new user with email and password."""
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise ValueError("User with this email already exists")
    
    user = User(email=email, password_hash=hash_password(password), subscription_tier="free", monthly_scan_limit=3)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user with email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.password_hash:
        return None
    
    if verify_password(password, user.password_hash):
        return user
    
    return None


def generate_magic_link_token() -> str:
    """Generate a secure magic link token."""
    return secrets.token_urlsafe(32)


magic_link_tokens: Dict[str, Dict] = {}


def create_magic_link(db: Session, email: str) -> str:
    """Create a magic link for user authentication."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, subscription_tier="free", monthly_scan_limit=3)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    token = generate_magic_link_token()
    magic_link_tokens[token] = {"email": email, "user_id": user.id, "expires_at": datetime.utcnow() + timedelta(minutes=15)}
    return token


def verify_magic_link(token: str) -> Optional[Dict]:
    """Verify a magic link token."""
    if token not in magic_link_tokens:
        return None
    
    token_data = magic_link_tokens[token]
    if datetime.utcnow() > token_data["expires_at"]:
        del magic_link_tokens[token]
        return None
    
    del magic_link_tokens[token]
    return {"email": token_data["email"], "user_id": token_data["user_id"]}


def create_session_token() -> str:
    """Create a session token for authenticated user."""
    return secrets.token_urlsafe(32)


sessions: Dict[str, Dict] = {}


def create_session(user_id: int, email: str) -> str:
    """Create a new session for authenticated user."""
    token = create_session_token()
    sessions[token] = {"user_id": user_id, "email": email, "created_at": datetime.utcnow(), "expires_at": datetime.utcnow() + timedelta(days=30)}
    return token


def verify_session(token: str) -> Optional[Dict]:
    """Verify a session token."""
    if token not in sessions:
        return None
    
    session_data = sessions[token]
    if datetime.utcnow() > session_data["expires_at"]:
        del sessions[token]
        return None
    
    return session_data


def invalidate_session(token: str) -> bool:
    """Invalidate a session (logout)."""
    if token in sessions:
        del sessions[token]
        return True
    return False
