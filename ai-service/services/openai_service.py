import os
import json
import logging
from typing import Dict, Any, List
from openai import OpenAI
from models.schemas import LeadFields, GenerateResponse
from services.response_generator import generate_mock_ai_response

logger = logging.getLogger("ai-service")

def generate_openai_response(
    message: str,
    history: List[Dict[str, Any]],
    business_profile: Dict[str, Any],
    services: List[Dict[str, Any]],
    faqs: List[Dict[str, Any]],
    current_lead_state: LeadFields
) -> GenerateResponse:
    """
    Calls OpenAI to generate a structured receptionist response based on business data.
    Falls back to generate_mock_ai_response if credentials or API calls fail.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key or api_key == "your_openai_api_key_here":
        logger.info("ℹ️ OpenAI API Key not configured. Using rule-based fallback generator.")
        return generate_mock_ai_response(message, business_profile, services, faqs, current_lead_state)

    try:
        client = OpenAI(api_key=api_key)

        # Formatting data for prompt
        services_text = "\n".join([
            f"- {s.get('name')}: {s.get('base_price')} (duration: {s.get('estimated_duration')}). Desc: {s.get('description')}"
            for s in services
        ])
        
        faqs_text = "\n".join([
            f"Q: {f.get('question')}\nA: {f.get('answer')}"
            for f in faqs
        ])

        lead_state_dict = {
            "customer_name": current_lead_state.customer_name if current_lead_state else None,
            "customer_phone": current_lead_state.customer_phone if current_lead_state else None,
            "address": current_lead_state.address if current_lead_state else None,
            "service_type": current_lead_state.service_type if current_lead_state else None,
            "preferred_date": current_lead_state.preferred_date if current_lead_state else None,
            "notes": current_lead_state.notes if current_lead_state else None
        }

        # Build chat history context
        history_text = ""
        if history:
            history_text = "\n".join([
                f"{'Customer' if h.get('sender') == 'customer' else 'AI'}: {h.get('content')}"
                for h in history[-6:] # Last 6 messages
            ])

        system_prompt = f"""You are CleanDesk AI, an expert AI receptionist for local home cleaning businesses.
Your goal is to answer client questions using ONLY the provided business knowledge, and capture lead details if they wish to book a service or get a quote.

Business Profile:
- Name: {business_profile.get('name', 'CleanDesk AI')}
- Phone: {business_profile.get('phone', 'N/A')}
- Email: {business_profile.get('email', 'N/A')}
- Area Covered: {business_profile.get('service_area', 'N/A')}
- Opening Hours: {business_profile.get('opening_hours', 'N/A')}
- Overview: {business_profile.get('description', 'N/A')}

Available Services and Prices:
{services_text}

Frequently Asked Questions (FAQs):
{faqs_text}

Current Lead State (already captured):
{json.dumps(lead_state_dict, indent=2)}

Instructions:
1. You must base your answer strictly on the Business Profile, Services, and FAQs.
2. If the user asks for information not in the knowledge base (e.g. specific slots availability, same-day scheduling, or custom pricing), do not invent it. State that the business owner will confirm these details.
3. Classify the conversation intent into one of: 'general_question', 'pricing', 'booking_request', 'reschedule', 'complaint', or 'unknown'.
4. Detect booking intent. If the customer indicates they want a booking, quote, or cleaning:
   - Extract any slot details from their current message (name, phone, address, service type, preferred date).
   - Combine these newly extracted slots with the existing Lead State.
   - Look at the required field order: customer_name -> customer_phone -> address -> service_type -> preferred_date.
   - Identify the NEXT required field that is still missing (null). Set "next_required_field" to this field name (or null if all are filled).
   - In your "reply", ask the user for ONLY that one next required field. Do not ask for multiple fields at once.
5. Escalate to the owner (set "needs_human_review" to true) if:
   - The customer is angry, complains, or mentions refunds, damage, or legal issues.
   - The user asks for unsafe or dangerous requests.
   - You are highly uncertain (confidence < 0.60).
   - You cannot find the answer to their question in the provided knowledge base.

Output Format:
You must output a valid JSON object matching this schema. Do not include markdown code block formatting.
{{
  "reply": "your text response here",
  "intent": "general_question | pricing | booking_request | reschedule | complaint | unknown",
  "confidence": 0.95,
  "needs_human_review": false,
  "lead_fields_detected": {{
    "customer_name": "extracted_name or previous value",
    "customer_phone": "extracted_phone or previous value",
    "address": "extracted_address or previous value",
    "service_type": "extracted_service or previous value",
    "preferred_date": "extracted_date or previous value",
    "notes": "any extra notes extracted"
  }},
  "next_required_field": "customer_name | customer_phone | address | service_type | preferred_date | null"
}}"""

        logger.info(f"Calling OpenAI with model gpt-4o-mini...")
        
        # Call OpenAI Chat Completion
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"History:\n{history_text}\n\nCustomer: {message}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=800
        )
        
        res_text = response.choices[0].message.content
        logger.debug(f"OpenAI raw response: {res_text}")
        
        parsed_json = json.loads(res_text)

        # Validate and return GenerateResponse
        # Merge safety mappings
        fields_data = parsed_json.get("lead_fields_detected", {})
        fields = LeadFields(
            customer_name=fields_data.get("customer_name"),
            customer_phone=fields_data.get("customer_phone"),
            address=fields_data.get("address"),
            service_type=fields_data.get("service_type"),
            preferred_date=fields_data.get("preferred_date"),
            notes=fields_data.get("notes")
        )

        return GenerateResponse(
            reply=parsed_json.get("reply", "I'm sorry, I encountered an issue parsing my response."),
            intent=parsed_json.get("intent", "unknown"),
            confidence=float(parsed_json.get("confidence", 0.5)),
            needs_human_review=bool(parsed_json.get("needs_human_review", False)),
            lead_fields_detected=fields,
            next_required_field=parsed_json.get("next_required_field")
        )

    except Exception as e:
        logger.error(f"❌ OpenAI integration call failed: {str(e)}. Falling back to rule-based response.", exc_info=True)
        return generate_mock_ai_response(message, business_profile, services, faqs, current_lead_state)
