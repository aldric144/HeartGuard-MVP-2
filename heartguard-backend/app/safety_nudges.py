"""
Compassionate Safety Nudges™ - Real-time protective interventions.
Provides gentle guidance and warnings when risky behavior is detected.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel


class SafetyNudge(BaseModel):
    """Model for a safety nudge/warning."""
    nudge_type: str  # "financial_warning", "emotional_manipulation", "identity_verification", "general_caution"
    severity: str  # "low", "medium", "high", "critical"
    title: str
    message: str
    checklist: List[str]
    action_buttons: List[Dict[str, str]]  # [{"label": "I understand", "action": "dismiss"}, ...]
    icon: str  # emoji or icon identifier


def generate_safety_nudges(
    trust_score: int,
    emi: float,
    has_financial_request: bool,
    manipulation_patterns: List[Dict],
    conversation_length: int
) -> List[SafetyNudge]:
    """
    Generate appropriate safety nudges based on risk factors.
    
    Args:
        trust_score: Current Trust Score (0-100)
        emi: Emotional Manipulation Index (0-1)
        has_financial_request: Whether financial request detected
        manipulation_patterns: List of detected manipulation patterns
        conversation_length: Number of messages in conversation
        
    Returns:
        List of safety nudges to display
    """
    nudges = []
    
    if has_financial_request:
        financial_patterns = [
            p for p in manipulation_patterns 
            if p.get("pattern_type") in ["Financial Request", "Cryptocurrency Request", "Gift Card Request"]
        ]
        
        if financial_patterns:
            pattern_types = ", ".join(set(p.get("pattern_type") for p in financial_patterns))
            
            nudges.append(SafetyNudge(
                nudge_type="financial_warning",
                severity="critical",
                title="⚠️ Financial Request Detected",
                message=f"This person is asking you for money or financial information. This is a major red flag in online relationships. {pattern_types} detected in the conversation.",
                checklist=[
                    "Have you met this person in real life?",
                    "Have you video chatted with them (not just photos)?",
                    "Do you know their real identity and location?",
                    "Have they given you verifiable contact information?",
                    "Would someone you trust approve of sending money?"
                ],
                action_buttons=[
                    {"label": "I understand the risk", "action": "acknowledge"},
                    {"label": "Get help from a trusted contact", "action": "contact_guardian"},
                    {"label": "Report this person", "action": "report"}
                ],
                icon="🚨"
            ))
    
    if emi >= 0.7:
        nudges.append(SafetyNudge(
            nudge_type="emotional_manipulation",
            severity="high",
            title="💔 High Emotional Manipulation Detected",
            message=f"This conversation shows signs of emotional manipulation (score: {emi:.0%}). Scammers often use intense emotions to cloud your judgment and rush you into decisions.",
            checklist=[
                "Are they rushing you to make decisions?",
                "Do they claim to have an emergency or urgent need?",
                "Have they declared love very quickly?",
                "Do they make you feel guilty or obligated?",
                "Are they isolating you from friends/family?"
            ],
            action_buttons=[
                {"label": "Take a break", "action": "pause"},
                {"label": "Talk to someone I trust", "action": "contact_guardian"},
                {"label": "Continue with caution", "action": "acknowledge"}
            ],
            icon="💔"
        ))
    
    if trust_score <= 30:
        nudges.append(SafetyNudge(
            nudge_type="general_caution",
            severity="high",
            title="🛡️ Very Low Trust Score",
            message=f"This conversation has a Trust Score of {trust_score}/100, indicating high risk. Multiple warning signs have been detected. Please proceed with extreme caution.",
            checklist=[
                "Verify their identity through video call",
                "Do NOT send money or financial information",
                "Do NOT share personal documents (ID, passport)",
                "Research their photos using reverse image search",
                "Talk to a trusted friend or family member"
            ],
            action_buttons=[
                {"label": "Review full report", "action": "view_report"},
                {"label": "Get help", "action": "contact_guardian"},
                {"label": "I understand", "action": "acknowledge"}
            ],
            icon="🛡️"
        ))
    elif trust_score <= 50:
        nudges.append(SafetyNudge(
            nudge_type="general_caution",
            severity="medium",
            title="⚠️ Moderate Risk Detected",
            message=f"This conversation has a Trust Score of {trust_score}/100. Some warning signs have been detected. Stay alert and verify their identity before sharing personal information.",
            checklist=[
                "Verify their identity through video call",
                "Be cautious about sharing personal information",
                "Watch for requests for money or favors",
                "Trust your instincts - if something feels off, it probably is"
            ],
            action_buttons=[
                {"label": "Review details", "action": "view_report"},
                {"label": "I understand", "action": "acknowledge"}
            ],
            icon="⚠️"
        ))
    
    if conversation_length >= 10 and conversation_length <= 20 and trust_score <= 60:
        nudges.append(SafetyNudge(
            nudge_type="identity_verification",
            severity="medium",
            title="🎥 Verify Their Identity",
            message="You've been chatting for a while. It's time to verify this person is who they claim to be. Real people will be happy to video chat.",
            checklist=[
                "Request a live video call (not pre-recorded)",
                "Ask them to hold up a sign with today's date",
                "Verify their location matches what they've told you",
                "Check if their appearance matches their photos",
                "Ask specific questions only the real person would know"
            ],
            action_buttons=[
                {"label": "Request video call", "action": "request_verification"},
                {"label": "Not yet", "action": "dismiss"}
            ],
            icon="🎥"
        ))
    
    return nudges


def get_safepay_checklist(amount: Optional[float] = None) -> Dict:
    """
    Generate SafePay™ checklist for financial transactions.
    
    Args:
        amount: Optional transaction amount
        
    Returns:
        SafePay checklist with verification steps
    """
    amount_str = f"${amount:,.2f}" if amount else "money"
    
    return {
        "title": f"🛡️ SafePay™ Checklist: Before Sending {amount_str}",
        "subtitle": "Complete ALL steps before proceeding with any financial transaction",
        "critical_warnings": [
            "🚨 STOP: Romance scammers steal $1.3 billion per year",
            "🚨 Once money is sent, it's almost impossible to recover",
            "🚨 Real romantic partners will NEVER pressure you for money"
        ],
        "verification_steps": [
            {
                "step": 1,
                "title": "Identity Verification",
                "required": True,
                "checklist": [
                    "Have you video chatted with them multiple times?",
                    "Have you met them in person?",
                    "Do you have their real name, address, and phone number?",
                    "Have you verified their identity through government ID?",
                    "Can you find them on social media with real friends/family?"
                ]
            },
            {
                "step": 2,
                "title": "Relationship Timeline",
                "required": True,
                "checklist": [
                    "Have you known them for at least 6 months?",
                    "Did they wait a reasonable time before asking for money?",
                    "Is your relationship progressing at a normal pace?",
                    "Have they introduced you to their friends/family?",
                    "Do they have a consistent story about their life?"
                ]
            },
            {
                "step": 3,
                "title": "Red Flag Check",
                "required": True,
                "checklist": [
                    "They are NOT claiming to be military/overseas worker",
                    "They are NOT asking for gift cards or cryptocurrency",
                    "They are NOT claiming an emergency or urgent need",
                    "They are NOT asking you to keep the relationship secret",
                    "They have NOT asked for money multiple times"
                ]
            },
            {
                "step": 4,
                "title": "Trusted Person Review",
                "required": True,
                "checklist": [
                    "Have you told a trusted friend/family member about this person?",
                    "Have you shown them the conversation?",
                    "Do they approve of you sending money?",
                    "Would you be comfortable explaining this to the police?",
                    "Are you making this decision with a clear mind (not rushed)?"
                ]
            },
            {
                "step": 5,
                "title": "Alternative Solutions",
                "required": True,
                "checklist": [
                    "Have you explored other ways they could get help?",
                    "Can they borrow from their own friends/family?",
                    "Can they use local resources or charities?",
                    "Have you offered to help in non-financial ways?",
                    "Are you certain this isn't a test of your generosity?"
                ]
            }
        ],
        "final_warning": "⚠️ If you cannot honestly check ALL boxes above, DO NOT send money. This is likely a scam.",
        "resources": [
            {"label": "Report to FBI IC3", "url": "https://www.ic3.gov"},
            {"label": "FTC Scam Reporting", "url": "https://reportfraud.ftc.gov"},
            {"label": "Talk to a counselor", "action": "contact_support"}
        ]
    }
