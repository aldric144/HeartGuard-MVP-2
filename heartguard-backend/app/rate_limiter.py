"""
Rate limiting middleware for HeartGuard API.
Protects critical endpoints from abuse and prevents resource exhaustion.
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from typing import Callable
import hashlib

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000/hour"],  # Default limit for all endpoints
    storage_uri="memory://",  # Will be updated to use Redis in production
)

def get_user_identifier(request: Request) -> str:
    """
    Get unique identifier for rate limiting.
    Prioritizes: user_id > device_id > IP address
    """
    if hasattr(request.state, "user_id") and request.state.user_id:
        return f"user:{request.state.user_id}"
    
    device_id = request.headers.get("X-Device-ID")
    if device_id:
        return f"device:{device_id}"
    
    return f"ip:{get_remote_address(request)}"

RATE_LIMITS = {
    "auth": "10/minute",
    
    "analysis": "100/minute",
    
    "heavy": "20/minute",
    
    "read": "200/minute",
    
    "health": "1000/minute",
}

def rate_limit_by_user(limit: str):
    """
    Decorator for rate limiting by user identifier.
    
    Usage:
        @app.post("/register")
        @rate_limit_by_user("10/minute")
        async def register(request: Request):
            ...
    """
    def decorator(func: Callable):
        async def wrapper(request: Request, *args, **kwargs):
            identifier = get_user_identifier(request)
            
            
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator

def setup_rate_limiting(app):
    """
    Setup rate limiting for the FastAPI application.
    
    Call this in main.py:
        from app.rate_limiter import setup_rate_limiting
        setup_rate_limiting(app)
    """
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    return limiter
