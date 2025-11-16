"""
Test script to create sample conversation data and test Evidence Locker endpoint
"""

from app.models.database import SessionLocal, Conversation, AnalysisPoint, GeographicRisk
from datetime import datetime, timedelta
import uuid

def create_test_conversation():
    """Create a test conversation with analysis points for Evidence Locker testing"""
    
    db = SessionLocal()
    
    try:
        conversation_id = str(uuid.uuid4())
        conversation = Conversation(
            id=conversation_id,
            start_date=datetime.utcnow() - timedelta(days=7),
            last_updated=datetime.utcnow(),
            final_trust_score=25
        )
        db.add(conversation)
        db.commit()
        
        sample_messages = [
            {
                "message_index": 1,
                "timestamp": datetime.utcnow() - timedelta(days=7),
                "message_text": "Hi! I'm Sarah, a nurse from London. I saw your profile and thought we might have a lot in common!",
                "trust_score_delta": 0,
                "tone_shift_delta": 0,
                "wallet_watch_flag": False,
                "risk_rationale": "Initial contact - neutral tone"
            },
            {
                "message_index": 2,
                "timestamp": datetime.utcnow() - timedelta(days=6),
                "message_text": "You're so amazing! I feel like we have such a special connection. I've never met anyone like you before.",
                "trust_score_delta": -5,
                "tone_shift_delta": 15,
                "wallet_watch_flag": False,
                "risk_rationale": "Rapid emotional escalation detected - love bombing pattern"
            },
            {
                "message_index": 3,
                "timestamp": datetime.utcnow() - timedelta(days=5),
                "message_text": "I'm working on an oil rig right now, it's very isolated here. I miss talking to you so much!",
                "trust_score_delta": -10,
                "tone_shift_delta": 5,
                "wallet_watch_flag": False,
                "risk_rationale": "Common scammer cover story - oil rig worker, creates isolation narrative"
            },
            {
                "message_index": 4,
                "timestamp": datetime.utcnow() - timedelta(days=4),
                "message_text": "I have an emergency! My wallet was stolen and I need to pay for medical supplies. Can you help me with $500?",
                "trust_score_delta": -30,
                "tone_shift_delta": 25,
                "wallet_watch_flag": True,
                "risk_rationale": "CRITICAL: Direct financial request - emergency money scam pattern"
            },
            {
                "message_index": 5,
                "timestamp": datetime.utcnow() - timedelta(days=3),
                "message_text": "Please hurry! I really need your help. You're the only one I can trust. I'll pay you back as soon as I get home.",
                "trust_score_delta": -20,
                "tone_shift_delta": 20,
                "wallet_watch_flag": True,
                "risk_rationale": "Urgency manipulation + financial pressure - classic romance scam tactics"
            },
            {
                "message_index": 6,
                "timestamp": datetime.utcnow() - timedelta(days=2),
                "message_text": "I also need help with customs fees to ship a package. It's $2000. Can you send it via Western Union?",
                "trust_score_delta": -25,
                "tone_shift_delta": 10,
                "wallet_watch_flag": True,
                "risk_rationale": "EXTREME: Escalating financial requests + Western Union (untraceable payment method)"
            },
            {
                "message_index": 7,
                "timestamp": datetime.utcnow() - timedelta(days=1),
                "message_text": "Why aren't you responding? I thought you loved me! I need this money NOW!",
                "trust_score_delta": -10,
                "tone_shift_delta": 30,
                "wallet_watch_flag": True,
                "risk_rationale": "Emotional manipulation + guilt-tripping when victim hesitates"
            }
        ]
        
        for msg_data in sample_messages:
            analysis_point = AnalysisPoint(
                conversation_id=conversation_id,
                **msg_data
            )
            db.add(analysis_point)
        
        db.commit()
        
        print(f"✅ Test conversation created successfully!")
        print(f"📋 Conversation ID: {conversation_id}")
        print(f"📊 Total messages: {len(sample_messages)}")
        print(f"💰 Wallet watch flags: {sum(1 for m in sample_messages if m['wallet_watch_flag'])}")
        print(f"📉 Final trust score: {conversation.final_trust_score}")
        print(f"\n🔗 Test the Evidence Locker endpoint:")
        print(f"   GET http://localhost:8000/evidence/generate/{conversation_id}")
        print(f"   GET http://localhost:8000/evidence/generate/{conversation_id}?phone_code=%2B234")
        
        return conversation_id
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating test conversation: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_conversation()
