import re
from typing import Dict, Any, Tuple
from models.schemas import LeadFields, GenerateResponse

def generate_mock_ai_response(
    message: str,
    business_profile: Dict[str, Any],
    services: list,
    faqs: list,
    current_lead_state: LeadFields
) -> GenerateResponse:
    """
    Generates a high-quality mock response based on the message and business knowledge.
    This simulates the LLM behavior by using simple rule-based matching.
    
    TODO: Replace this mock implementation with actual OpenAI LLM prompts and function calling.
    """
    text = message.lower()
    
    # 1. Initialize states
    intent = "general_question"
    confidence = 0.95
    needs_review = False
    
    # Copy current lead fields
    fields = LeadFields(
        customer_name=current_lead_state.customer_name if current_lead_state else None,
        customer_phone=current_lead_state.customer_phone if current_lead_state else None,
        address=current_lead_state.address if current_lead_state else None,
        service_type=current_lead_state.service_type if current_lead_state else None,
        preferred_date=current_lead_state.preferred_date if current_lead_state else None,
        notes=current_lead_state.notes if current_lead_state else None
    )

    # 2. Extract Lead Info from current message using regex
    # Phone number extraction
    phone_match = re.search(r'(\+?\d[\d\s-]{8,12}\d)', message)
    if phone_match:
        fields.customer_phone = phone_match.group(1).strip()
    
    # Service Type extraction (matches seed services)
    if "deep" in text:
        fields.service_type = "Deep cleaning"
    elif "move-out" in text or "end of tenancy" in text or "move out" in text:
        fields.service_type = "Move-out cleaning"
    elif "regular" in text or "weekly" in text or "bi-weekly" in text or "standard" in text:
        fields.service_type = "Regular home cleaning"
    elif "carpet" in text:
        fields.service_type = "Carpet cleaning"
    elif "office" in text or "commercial" in text:
        fields.service_type = "Office cleaning"

    # Date extraction (very simple, e.g. "on Monday", "tomorrow", "july 5th")
    date_match = re.search(r'(tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|july \d{1,2}|june \d{1,2})', text)
    if date_match:
        fields.preferred_date = date_match.group(1).strip().capitalize()

    # Name extraction (e.g. "my name is John", "I am Alice")
    name_match = re.search(r'(?:my name is|i am|this is)\s+([a-z\s]+)', text)
    if name_match:
        fields.customer_name = name_match.group(1).split()[0].capitalize()
    
    # Address extraction (simple post code or street format)
    addr_match = re.search(r'(\d+\s+[a-z\s]+(?:street|road|way|avenue|lane|drive|crescent|sw\d|e\d|w\d|n\d|se\d|nw\d))', text)
    if addr_match:
        fields.address = addr_match.group(1).strip().title()

    # 3. Classify Intent & Draft Reply
    
    # Check for complaint/refund/escalation triggers
    complaint_words = ["refund", "complaint", "angry", "terrible", "bad service", "sue", "legal", "damage", "stolen", "stole"]
    if any(word in text for word in complaint_words):
        intent = "complaint"
        confidence = 0.90
        needs_review = True
        reply = (
            "I'm very sorry to hear about this issue. I have flagged this conversation for human review, "
            f"and the business owner of {business_profile.get('name', 'CleanDesk AI')} will contact you directly to resolve this as soon as possible."
        )
    
    # Check for reschedule
    elif any(word in text for word in ["reschedule", "change my booking", "cancel booking"]):
        intent = "reschedule"
        confidence = 0.85
        faq_ans = None
        for faq in faqs:
            if "reschedule" in faq.get("question", "").lower() or "cancel" in faq.get("question", "").lower():
                faq_ans = faq.get("answer")
                break
        
        if faq_ans:
            reply = faq_ans
        else:
            reply = "You can reschedule your appointment for free up to 24 hours before your booking. Please let us know when you would like to move it to."

    # Check for booking/quote request
    elif any(word in text for word in ["book", "quote", "pricing for", "get a clean", "make an appointment", "clean my"]):
        intent = "booking_request"
        confidence = 0.90
        
        # Guide user through lead capture
        reply = "I would be happy to help you get a quote or book a cleaning! "
        if not fields.customer_name:
            reply += "Could you please tell me your name?"
        elif not fields.service_type:
            reply += f"Great to meet you, {fields.customer_name}! Which cleaning service do you need? (Regular, Deep, Move-out, Carpet, or Office?)"
        elif not fields.customer_phone:
            reply += "Awesome. What is the best phone number to reach you at?"
        elif not fields.address:
            reply += "And what is the address of the property to be cleaned?"
        elif not fields.preferred_date:
            reply += "What is your preferred date or day of the week for the cleaning?"
        else:
            reply += "Perfect! I have collected all the details. The business owner will review this and contact you to confirm the booking."

    # Check for pricing specifically
    elif any(word in text for word in ["price", "cost", "how much"]):
        intent = "pricing"
        confidence = 0.90
        pricing_info = []
        for service in services:
            pricing_info.append(f"- {service.get('name')}: {service.get('base_price')} (approx. {service.get('estimated_duration')})")
        
        if pricing_info:
            reply = f"Here are our services and starting prices at {business_profile.get('name', 'SparkleHome Cleaning')}:\n" + "\n".join(pricing_info) + "\n\nWould you like to get a quote or book a cleaning?"
        else:
            reply = "Our prices depend on the size of your home and the type of cleaning needed. Would you like to get a customized quote?"

    # Check if user message matches any FAQs
    else:
        matched_faq = None
        for faq in faqs:
            q = faq.get("question", "").lower()
            # Simple keyword overlap
            q_words = set(re.findall(r'\w+', q))
            msg_words = set(re.findall(r'\w+', text))
            overlap = q_words.intersection(msg_words)
            # If significant overlap
            if len(overlap) >= 3 or (len(overlap) >= 2 and len(q_words) <= 4):
                matched_faq = faq
                break
        
        if matched_faq:
            intent = "general_question"
            confidence = 0.92
            reply = matched_faq.get("answer")
        else:
            # Check if we are currently in a booking flow and answering a question
            if current_lead_state and (current_lead_state.customer_name or current_lead_state.customer_phone):
                intent = "booking_request"
                confidence = 0.85
                reply = "I've noted that down. "
            else:
                intent = "unknown"
                confidence = 0.50
                reply = f"I'm not completely sure about that. I can ask the owner of {business_profile.get('name', 'CleanDesk AI')} to confirm. Would you like to leave your name and number so they can reach back?"

    # 4. Determine next required field for lead capture
    next_field = None
    if intent == "booking_request" or (current_lead_state and (current_lead_state.customer_name or current_lead_state.customer_phone)):
        if not fields.customer_name:
            next_field = "customer_name"
        elif not fields.service_type:
            next_field = "service_type"
        elif not fields.customer_phone:
            next_field = "customer_phone"
        elif not fields.address:
            next_field = "address"
        elif not fields.preferred_date:
            next_field = "preferred_date"

    # Low confidence handling
    if confidence < 0.60:
        needs_review = True

    return GenerateResponse(
        reply=reply,
        intent=intent,
        confidence=confidence,
        needs_human_review=needs_review,
        lead_fields_detected=fields,
        next_required_field=next_field
    )
