"""
WalletWatch Plus - Cryptocurrency address screening for HeartGuard.
Detects known scam addresses and suspicious crypto transactions.
"""

from typing import Dict, List, Optional
import re


KNOWN_SCAM_ADDRESSES = {
    "bitcoin": [
        "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",  # Example
        "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"  # Example
    ],
    "ethereum": [
        "0x0000000000000000000000000000000000000000",  # Burn address
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"  # Example
    ],
    "tether": [
        "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"  # Example USDT address
    ]
}


def validate_crypto_address(address: str, currency: str) -> bool:
    """
    Validate cryptocurrency address format.
    
    Args:
        address: Crypto address to validate
        currency: Currency type (bitcoin, ethereum, tether, etc.)
        
    Returns:
        True if valid format, False otherwise
    """
    if currency.lower() == "bitcoin":
        if re.match(r'^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$', address):  # Legacy
            return True
        if re.match(r'^bc1[a-z0-9]{39,59}$', address):  # Bech32
            return True
        return False
    
    elif currency.lower() == "ethereum":
        return bool(re.match(r'^0x[a-fA-F0-9]{40}$', address))
    
    elif currency.lower() in ["tether", "usdt", "usdc"]:
        if re.match(r'^0x[a-fA-F0-9]{40}$', address):  # Ethereum
            return True
        if re.match(r'^T[a-zA-Z0-9]{33}$', address):  # Tron
            return True
        return False
    
    return False


def screen_crypto_address(address: str, currency: str) -> Dict:
    """
    Screen a cryptocurrency address for known scams.
    
    Args:
        address: Crypto address to screen
        currency: Currency type
        
    Returns:
        Dict with screening results
    """
    if not validate_crypto_address(address, currency):
        return {
            "valid": False,
            "error": "Invalid address format",
            "risk_level": "unknown"
        }
    
    currency_lower = currency.lower()
    if currency_lower in KNOWN_SCAM_ADDRESSES:
        if address in KNOWN_SCAM_ADDRESSES[currency_lower]:
            return {
                "valid": True,
                "is_scam": True,
                "risk_level": "critical",
                "warning": "⚠️ This address is flagged as a known scam address",
                "recommendation": "DO NOT send funds to this address",
                "source": "Community reports + blockchain analysis"
            }
    
    warnings = []
    risk_score = 0
    
    
    
    if currency_lower == "bitcoin" and address.startswith("1"):
        warnings.append("Legacy Bitcoin address - verify recipient identity")
        risk_score += 10
    
    if risk_score >= 50:
        risk_level = "high"
    elif risk_score >= 25:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    return {
        "valid": True,
        "is_scam": False,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "warnings": warnings,
        "recommendation": "Verify recipient identity before sending funds" if risk_score > 0 else "Address appears safe",
        "note": "Always verify crypto addresses through multiple channels"
    }


def get_crypto_safety_tips() -> List[str]:
    """
    Get cryptocurrency safety tips.
    
    Returns:
        List of safety tips
    """
    return [
        "Never send cryptocurrency to someone you haven't met in person",
        "Verify wallet addresses through multiple communication channels",
        "Be suspicious of investment opportunities promising guaranteed returns",
        "Romance scammers often request crypto because it's irreversible",
        "Use small test transactions before sending large amounts",
        "Research the recipient's address on blockchain explorers",
        "Be wary of urgent requests for crypto payments",
        "Legitimate romantic partners won't pressure you for crypto",
        "If it sounds too good to be true, it probably is",
        "Report suspicious addresses to help protect others"
    ]


def analyze_crypto_transaction(
    amount: float,
    currency: str,
    recipient_address: str,
    relationship_duration_days: int,
    context: str
) -> Dict:
    """
    Analyze a proposed cryptocurrency transaction for red flags.
    
    Args:
        amount: Transaction amount
        currency: Cryptocurrency type
        recipient_address: Recipient's wallet address
        relationship_duration_days: Days since relationship started
        context: Context/reason for transaction
        
    Returns:
        Dict with transaction analysis
    """
    red_flags = []
    risk_score = 0
    
    address_screening = screen_crypto_address(recipient_address, currency)
    if address_screening.get("is_scam"):
        red_flags.append("⛔ Recipient address is flagged as a known scam")
        risk_score += 100
    
    if amount > 1000:
        red_flags.append("⚠️ Large transaction amount ($1000+)")
        risk_score += 30
    if amount > 5000:
        red_flags.append("🚨 Very large transaction amount ($5000+)")
        risk_score += 50
    
    if relationship_duration_days < 30:
        red_flags.append("⚠️ Very new relationship (< 30 days)")
        risk_score += 40
    if relationship_duration_days < 7:
        red_flags.append("🚨 Extremely new relationship (< 7 days)")
        risk_score += 60
    
    scam_keywords = [
        "investment", "opportunity", "guaranteed", "returns", "profit",
        "emergency", "urgent", "hospital", "customs", "fees", "taxes",
        "business", "startup", "crypto", "trading", "mining"
    ]
    
    context_lower = context.lower()
    for keyword in scam_keywords:
        if keyword in context_lower:
            red_flags.append(f"⚠️ Suspicious keyword detected: '{keyword}'")
            risk_score += 15
    
    if risk_score >= 100:
        risk_level = "critical"
        recommendation = "🛑 DO NOT PROCEED - This transaction shows multiple critical red flags"
    elif risk_score >= 60:
        risk_level = "high"
        recommendation = "⚠️ HIGH RISK - Strongly advise against this transaction"
    elif risk_score >= 30:
        risk_level = "medium"
        recommendation = "⚠️ CAUTION - Verify recipient identity through video call"
    else:
        risk_level = "low"
        recommendation = "✓ Proceed with caution and verify recipient"
    
    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "red_flags": red_flags,
        "recommendation": recommendation,
        "address_screening": address_screening,
        "safety_tips": get_crypto_safety_tips()[:3]  # Top 3 tips
    }
