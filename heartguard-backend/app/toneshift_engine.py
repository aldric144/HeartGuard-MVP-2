"""
ToneShift™ NLP Engine - Lightweight sentiment analysis for detecting manipulation patterns
Uses TextBlob for fast, efficient text analysis without heavy ML dependencies
"""

from textblob import TextBlob
from typing import List, Dict
import re

class ToneShiftEngine:
    def __init__(self):
        """Initialize the ToneShift™ NLP Engine with TextBlob"""
        
        self.pattern_keywords = {
            "love_bombing": [
                "soulmate", "perfect", "destiny", "meant to be", "love of my life",
                "never felt this way", "special connection", "twin flame"
            ],
            "financial_urgency": [
                "money", "urgent", "emergency", "hospital", "bills", "debt",
                "loan", "help me", "need cash", "wire", "transfer"
            ],
            "isolation": [
                "don't tell", "secret", "between us", "nobody understands",
                "they don't know", "only you", "trust me alone"
            ],
            "guilt_manipulation": [
                "disappointed", "thought you cared", "if you loved me",
                "prove it", "don't you trust me", "after all I've done"
            ],
            "crypto_payment": [
                "bitcoin", "crypto", "cryptocurrency", "wallet", "btc", "eth",
                "blockchain", "digital currency"
            ],
            "gift_card": [
                "gift card", "itunes", "google play", "steam card", "prepaid card"
            ]
        }
    
    
    def analyze_message(self, text: str) -> Dict:
        """
        Analyze a single message for sentiment and manipulation patterns
        
        Args:
            text: The message text to analyze
            
        Returns:
            Dictionary containing sentiment scores and detected patterns
        """
        blob = TextBlob(text)
        
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        patterns = self._detect_patterns(text)
        
        sentiment_label = 'POSITIVE' if polarity > 0 else 'NEGATIVE' if polarity < 0 else 'NEUTRAL'
        sentiment_confidence = abs(polarity)
        
        return {
            "polarity": polarity,
            "subjectivity": subjectivity,
            "patterns": patterns,
            "sentiment_label": sentiment_label,
            "sentiment_confidence": sentiment_confidence
        }
    
    def _calculate_subjectivity(self, text: str) -> float:
        """
        Calculate subjectivity score based on personal pronouns and emotional words
        
        Args:
            text: The message text
            
        Returns:
            Subjectivity score between 0 and 1
        """
        text_lower = text.lower()
        
        personal_pronouns = ['i', 'me', 'my', 'mine', 'you', 'your', 'yours', 'we', 'us', 'our']
        pronoun_count = sum(1 for word in text_lower.split() if word in personal_pronouns)
        
        emotional_words = [
            'love', 'hate', 'feel', 'think', 'believe', 'want', 'need',
            'happy', 'sad', 'angry', 'excited', 'worried', 'scared'
        ]
        emotional_count = sum(1 for word in text_lower.split() if word in emotional_words)
        
        word_count = len(text.split())
        if word_count == 0:
            return 0.0
        
        subjectivity = min(1.0, (pronoun_count + emotional_count * 2) / word_count * 2)
        return subjectivity
    
    def _detect_patterns(self, text: str) -> List[str]:
        """
        Detect manipulation patterns in text using keyword matching
        
        Args:
            text: The message text
            
        Returns:
            List of detected pattern types
        """
        text_lower = text.lower()
        detected_patterns = []
        
        for pattern_type, keywords in self.pattern_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if pattern_type not in detected_patterns:
                        detected_patterns.append(pattern_type)
                    break
        
        return detected_patterns
    
    def analyze_conversation(self, messages: List[Dict[str, str]]) -> Dict:
        """
        Analyze a full conversation for manipulation patterns and emotional drift
        
        Args:
            messages: List of message dictionaries with 'sender' and 'text' keys
            
        Returns:
            Complete analysis including sentiment drift, patterns, and manipulation index
        """
        sentiment_drift = []
        all_patterns = []
        pattern_details = []
        
        for idx, message in enumerate(messages):
            text = message.get('text', '')
            sender = message.get('sender', 'unknown')
            
            analysis = self.analyze_message(text)
            
            sentiment_drift.append({
                "message_index": float(idx),
                "polarity": analysis['polarity'],
                "subjectivity": analysis['subjectivity']
            })
            
            for pattern in analysis['patterns']:
                if pattern not in all_patterns:
                    all_patterns.append(pattern)
                
                severity = self._get_pattern_severity(pattern)
                pattern_details.append({
                    "pattern_type": self._format_pattern_name(pattern),
                    "severity": severity,
                    "evidence": f"Message {idx + 1}: {self._get_pattern_evidence(pattern)}",
                    "timestamp": f"Message {idx + 1}"
                })
        
        emi = self._calculate_manipulation_index(sentiment_drift, all_patterns, pattern_details)
        
        risk_level = self._determine_risk_level(emi, pattern_details)
        
        return {
            "sentiment_drift": sentiment_drift,
            "manipulation_patterns": pattern_details,
            "emotional_manipulation_index": emi,
            "risk_level": risk_level,
            "detected_pattern_types": all_patterns
        }
    
    def _get_pattern_severity(self, pattern: str) -> str:
        """Get severity level for a manipulation pattern"""
        severity_map = {
            "love_bombing": "Medium",
            "financial_urgency": "Critical",
            "isolation": "High",
            "guilt_manipulation": "High",
            "crypto_payment": "Critical",
            "gift_card": "Critical"
        }
        return severity_map.get(pattern, "Medium")
    
    def _format_pattern_name(self, pattern: str) -> str:
        """Format pattern name for display"""
        name_map = {
            "love_bombing": "Love-Bombing",
            "financial_urgency": "Financial Request",
            "isolation": "Isolation Language",
            "guilt_manipulation": "Guilt Manipulation",
            "crypto_payment": "Cryptocurrency Request",
            "gift_card": "Gift Card Request"
        }
        return name_map.get(pattern, pattern.replace("_", " ").title())
    
    def _get_pattern_evidence(self, pattern: str) -> str:
        """Get evidence description for a pattern"""
        evidence_map = {
            "love_bombing": "Excessive affection or idealization detected",
            "financial_urgency": "Financial or payment-related request detected",
            "isolation": "Isolation or secrecy language detected",
            "guilt_manipulation": "Guilt or emotional pressure detected",
            "crypto_payment": "Cryptocurrency payment request detected",
            "gift_card": "Gift card payment request detected"
        }
        return evidence_map.get(pattern, "Suspicious pattern detected")
    
    def _calculate_manipulation_index(
        self,
        sentiment_drift: List[Dict],
        patterns: List[str],
        pattern_details: List[Dict]
    ) -> float:
        """
        Calculate the Emotional Manipulation Index (0-1)
        
        Factors:
        - Number and severity of manipulation patterns
        - Sentiment volatility
        - Presence of critical patterns (financial, crypto, gift cards)
        """
        pattern_score = min(1.0, len(patterns) / 5.0)
        
        critical_count = sum(1 for p in pattern_details if p['severity'] == 'Critical')
        high_count = sum(1 for p in pattern_details if p['severity'] == 'High')
        severity_score = min(1.0, (critical_count * 0.3 + high_count * 0.2))
        
        if len(sentiment_drift) > 1:
            polarities = [s['polarity'] for s in sentiment_drift]
            mean_polarity = sum(polarities) / len(polarities)
            variance = sum((p - mean_polarity) ** 2 for p in polarities) / len(polarities)
            volatility = variance ** 0.5  # Standard deviation
            volatility_score = min(1.0, volatility)
        else:
            volatility_score = 0.0
        
        emi = (pattern_score * 0.4 + severity_score * 0.4 + volatility_score * 0.2)
        
        return round(emi, 2)
    
    def _determine_risk_level(self, emi: float, pattern_details: List[Dict]) -> str:
        """Determine overall risk level based on EMI and patterns"""
        critical_count = sum(1 for p in pattern_details if p['severity'] == 'Critical')
        
        if emi > 0.7 or critical_count >= 2:
            return "High"
        elif emi > 0.4 or critical_count >= 1:
            return "Medium"
        else:
            return "Low"


toneshift_engine = ToneShiftEngine()
