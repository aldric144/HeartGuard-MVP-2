"""
Background task processing for CPU-intensive operations.
Offloads heavy tasks from request workers to prevent blocking.
"""
from fastapi import BackgroundTasks
from typing import Optional, Dict, Any
import asyncio
from datetime import datetime

background_task_queue = []

async def process_pdf_generation_async(
    conversation_id: str,
    report_data: Dict[str, Any],
    db_session: Any
) -> str:
    """
    Generate evidence PDF in background.
    Returns task_id for status tracking.
    """
    from app.evidence_locker import generate_evidence_pdf
    
    try:
        pdf_bytes = await asyncio.to_thread(
            generate_evidence_pdf,
            conversation_id,
            report_data
        )
        
        return f"pdf_generated_{conversation_id}"
    except Exception as e:
        print(f"Error generating PDF in background: {e}")
        return f"pdf_error_{conversation_id}"

async def process_reverse_image_search_async(
    image_hash: str,
    image_data: bytes
) -> Dict[str, Any]:
    """
    Perform reverse image search in background.
    This is CPU-intensive and should not block request workers.
    """
    from app.main import simulate_reverse_image_search
    
    try:
        matches, duplication_score = await asyncio.to_thread(
            simulate_reverse_image_search,
            image_hash,
            ""
        )
        
        return {
            "image_hash": image_hash,
            "matches": matches,
            "duplication_score": duplication_score,
            "status": "completed"
        }
    except Exception as e:
        print(f"Error in reverse image search: {e}")
        return {
            "image_hash": image_hash,
            "status": "error",
            "error": str(e)
        }

async def process_deepfake_detection_async(
    image_data: bytes
) -> Dict[str, Any]:
    """
    Perform deepfake detection in background.
    This is CPU-intensive and should not block request workers.
    """
    from app.main import detect_deepfake
    
    try:
        confidence, issues = await asyncio.to_thread(
            detect_deepfake,
            image_data
        )
        
        return {
            "confidence": confidence,
            "issues": issues,
            "status": "completed"
        }
    except Exception as e:
        print(f"Error in deepfake detection: {e}")
        return {
            "status": "error",
            "error": str(e)
        }

async def process_metadata_extraction_async(
    image_data: bytes
) -> Dict[str, Any]:
    """
    Extract and analyze image metadata in background.
    """
    from app.main import calculate_metadata_integrity_score
    
    try:
        score, issues = await asyncio.to_thread(
            calculate_metadata_integrity_score,
            image_data
        )
        
        return {
            "score": score,
            "issues": issues,
            "status": "completed"
        }
    except Exception as e:
        print(f"Error in metadata extraction: {e}")
        return {
            "status": "error",
            "error": str(e)
        }

def add_background_task(
    background_tasks: BackgroundTasks,
    task_func: callable,
    *args,
    **kwargs
):
    """
    Add a task to the background queue.
    
    Usage:
        add_background_task(
            background_tasks,
            process_pdf_generation_async,
            conversation_id="123",
            report_data=data
        )
    """
    background_tasks.add_task(task_func, *args, **kwargs)

task_status_cache = {}

def get_task_status(task_id: str) -> Optional[Dict[str, Any]]:
    """Get status of a background task"""
    return task_status_cache.get(task_id)

def set_task_status(task_id: str, status: Dict[str, Any]):
    """Set status of a background task"""
    task_status_cache[task_id] = {
        **status,
        "updated_at": datetime.utcnow().isoformat()
    }
