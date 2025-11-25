"""
Response caching layer for HeartGuard API.
Reduces database load for frequently accessed, low-risk endpoints.
"""
from typing import Optional, Any, Callable
from functools import wraps
import json
import hashlib
from datetime import datetime, timedelta

cache_store = {}

class CacheConfig:
    """Cache configuration for different endpoint types"""
    
    TTL = {
        "community_stats": 300,      # 5 minutes
        "subscription_tiers": 3600,  # 1 hour
        "safety_replies": 1800,      # 30 minutes
        "health": 60,                # 1 minute
        "geographic_risks": 3600,    # 1 hour
    }
    
    @staticmethod
    def get_ttl(cache_key: str) -> int:
        """Get TTL for a cache key"""
        for key, ttl in CacheConfig.TTL.items():
            if key in cache_key:
                return ttl
        return 300  # Default 5 minutes

def generate_cache_key(prefix: str, *args, **kwargs) -> str:
    """
    Generate a unique cache key from function arguments.
    
    Args:
        prefix: Cache key prefix (e.g., "community_stats")
        *args, **kwargs: Function arguments to include in key
    
    Returns:
        Unique cache key string
    """
    key_parts = [prefix]
    
    if args:
        key_parts.extend([str(arg) for arg in args])
    
    if kwargs:
        sorted_kwargs = sorted(kwargs.items())
        key_parts.extend([f"{k}:{v}" for k, v in sorted_kwargs])
    
    key_string = "|".join(key_parts)
    key_hash = hashlib.md5(key_string.encode()).hexdigest()
    
    return f"{prefix}:{key_hash}"

def get_cached(cache_key: str) -> Optional[Any]:
    """
    Get value from cache if it exists and hasn't expired.
    
    Returns:
        Cached value or None if not found/expired
    """
    if cache_key not in cache_store:
        return None
    
    cached_item = cache_store[cache_key]
    
    if datetime.utcnow() > cached_item["expires_at"]:
        del cache_store[cache_key]
        return None
    
    return cached_item["value"]

def set_cached(cache_key: str, value: Any, ttl: Optional[int] = None):
    """
    Store value in cache with TTL.
    
    Args:
        cache_key: Unique cache key
        value: Value to cache
        ttl: Time-to-live in seconds (optional, uses default if not provided)
    """
    if ttl is None:
        ttl = CacheConfig.get_ttl(cache_key)
    
    cache_store[cache_key] = {
        "value": value,
        "expires_at": datetime.utcnow() + timedelta(seconds=ttl),
        "created_at": datetime.utcnow()
    }

def invalidate_cache(pattern: str):
    """
    Invalidate all cache keys matching a pattern.
    
    Args:
        pattern: Pattern to match (e.g., "community_stats")
    """
    keys_to_delete = [key for key in cache_store.keys() if pattern in key]
    for key in keys_to_delete:
        del cache_store[key]

def cached_response(cache_key_prefix: str, ttl: Optional[int] = None):
    """
    Decorator for caching endpoint responses.
    
    Usage:
        @app.get("/community/stats")
        @cached_response("community_stats", ttl=300)
        async def get_community_stats():
            ...
    
    Args:
        cache_key_prefix: Prefix for cache key
        ttl: Time-to-live in seconds (optional)
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = generate_cache_key(cache_key_prefix, *args, **kwargs)
            
            cached_value = get_cached(cache_key)
            if cached_value is not None:
                return cached_value
            
            result = await func(*args, **kwargs)
            
            set_cached(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

def clear_all_cache():
    """Clear all cached data"""
    cache_store.clear()

def get_cache_stats() -> dict:
    """Get cache statistics"""
    total_keys = len(cache_store)
    expired_keys = sum(
        1 for item in cache_store.values()
        if datetime.utcnow() > item["expires_at"]
    )
    
    return {
        "total_keys": total_keys,
        "active_keys": total_keys - expired_keys,
        "expired_keys": expired_keys,
        "cache_size_bytes": sum(
            len(json.dumps(item["value"]).encode())
            for item in cache_store.values()
        )
    }
