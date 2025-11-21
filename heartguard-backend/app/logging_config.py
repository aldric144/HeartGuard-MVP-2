"""
Structured logging and instrumentation for HeartGuard API.
Provides detailed metrics for monitoring and debugging.
"""
import logging
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("heartguard")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging request/response metrics.
    Tracks duration, status codes, and errors.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        logger.info(f"Request started: {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
            
            duration_ms = (time.time() - start_time) * 1000
            
            log_data = {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
                "timestamp": datetime.utcnow().isoformat(),
            }
            
            if hasattr(request.state, "user_id"):
                log_data["user_id"] = request.state.user_id
            
            logger.info(f"Request completed: {json.dumps(log_data)}")
            
            response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
            
            return response
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            
            error_log = {
                "method": request.method,
                "path": request.url.path,
                "error": str(e),
                "error_type": type(e).__name__,
                "duration_ms": round(duration_ms, 2),
                "timestamp": datetime.utcnow().isoformat(),
            }
            
            logger.error(f"Request failed: {json.dumps(error_log)}")
            raise

def log_db_query(query_name: str, duration_ms: float, success: bool = True):
    """
    Log database query metrics.
    
    Args:
        query_name: Name/description of the query
        duration_ms: Query duration in milliseconds
        success: Whether the query succeeded
    """
    log_data = {
        "type": "db_query",
        "query_name": query_name,
        "duration_ms": round(duration_ms, 2),
        "success": success,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    if success:
        logger.info(f"DB query: {json.dumps(log_data)}")
    else:
        logger.error(f"DB query failed: {json.dumps(log_data)}")

def log_worker_metrics(worker_id: int, active_requests: int, queue_depth: int):
    """
    Log worker saturation metrics.
    
    Args:
        worker_id: Worker identifier
        active_requests: Number of active requests
        queue_depth: Number of queued requests
    """
    log_data = {
        "type": "worker_metrics",
        "worker_id": worker_id,
        "active_requests": active_requests,
        "queue_depth": queue_depth,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    logger.info(f"Worker metrics: {json.dumps(log_data)}")

def log_cache_metrics(cache_hits: int, cache_misses: int, cache_size: int):
    """
    Log cache performance metrics.
    
    Args:
        cache_hits: Number of cache hits
        cache_misses: Number of cache misses
        cache_size: Current cache size in bytes
    """
    hit_rate = cache_hits / (cache_hits + cache_misses) if (cache_hits + cache_misses) > 0 else 0
    
    log_data = {
        "type": "cache_metrics",
        "cache_hits": cache_hits,
        "cache_misses": cache_misses,
        "hit_rate": round(hit_rate, 3),
        "cache_size_bytes": cache_size,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    logger.info(f"Cache metrics: {json.dumps(log_data)}")

def log_background_task(task_name: str, duration_ms: float, success: bool = True):
    """
    Log background task metrics.
    
    Args:
        task_name: Name of the background task
        duration_ms: Task duration in milliseconds
        success: Whether the task succeeded
    """
    log_data = {
        "type": "background_task",
        "task_name": task_name,
        "duration_ms": round(duration_ms, 2),
        "success": success,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    if success:
        logger.info(f"Background task: {json.dumps(log_data)}")
    else:
        logger.error(f"Background task failed: {json.dumps(log_data)}")

class DatabaseTimingMiddleware:
    """
    Context manager for timing database operations.
    
    Usage:
        async with DatabaseTimingMiddleware("get_user"):
            user = await db.execute(select(User))
    """
    
    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = None
    
    async def __aenter__(self):
        self.start_time = time.time()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        duration_ms = (time.time() - self.start_time) * 1000
        success = exc_type is None
        log_db_query(self.operation_name, duration_ms, success)
        return False  # Don't suppress exceptions
