"""Accessibility features for HeartGuard."""
from typing import Dict, List

def get_accessibility_settings() -> Dict:
    return {"large_type_mode": {"enabled": False}, "voice_over_summaries": {"enabled": False}, "trauma_aware_mode": {"enabled": True}}

def get_emergency_contacts() -> List[Dict]:
    return [{"name": "National Domestic Violence Hotline", "phone": "1-800-799-7233"}, {"name": "FBI IC3", "phone": "1-800-CALL-FBI"}]

def get_voice_over_summary(trust_score: int, risk_insights: List[str]) -> Dict:
    tone = "trustworthy" if trust_score >= 70 else "concerning"
    return {"voice_over_text": f"Trust Score: {trust_score}. This person appears {tone}.", "risk_level": "low" if trust_score >= 70 else "high"}

def get_simplified_explanation(trust_score: int) -> Dict:
    if trust_score >= 70:
        return {"simplified_text": "This person seems safe.", "emoji": "✅", "color": "green"}
    return {"simplified_text": "Be careful with this person.", "emoji": "⚠️", "color": "red"}

def get_trauma_aware_messaging() -> Dict:
    return {"principles": ["Use gentle language", "Avoid victim-blaming"], "support_resources": get_emergency_contacts()}

def generate_emergency_action_plan(trust_score: int) -> Dict:
    if trust_score >= 40:
        return {"emergency_level": "low"}
    return {"emergency_level": "high", "immediate_actions": ["Stop communication", "Block this person", "Report to authorities"]}
