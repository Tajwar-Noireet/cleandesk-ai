import re
from typing import Tuple

def classify_message_intent(message: str) -> Tuple[str, float]:
    """
    Classifies the intent of a customer message and returns (intent, confidence).
    
    TODO: Integrate this with an LLM or an NLP classifier later.
    """
    text = message.lower()
    
    # Booking
    if any(w in text for w in ["book", "quote", "schedule", "appointment", "clean my", "reserve"]):
        return "booking_request", 0.92
        
    # Pricing
    if any(w in text for w in ["price", "cost", "pricing", "how much", "rate"]):
        return "pricing", 0.90
        
    # Reschedule / Cancellation
    if any(w in text for w in ["reschedule", "cancel", "change my booking", "postpone"]):
        return "reschedule", 0.88
        
    # Complaint / Issue
    if any(w in text for w in ["refund", "complaint", "dirty", "broke", "terrible", "bad service", "damage"]):
        return "complaint", 0.95
        
    # Greetings / General Qs
    if any(w in text for w in ["hello", "hi", "hey", "who are you", "what is this"]):
        return "general_question", 0.98
        
    return "unknown", 0.45
