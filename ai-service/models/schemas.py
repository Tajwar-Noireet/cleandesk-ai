from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class LeadFields(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    address: Optional[str] = None
    service_type: Optional[str] = None
    preferred_date: Optional[str] = None
    notes: Optional[str] = None

class GenerateResponse(BaseModel):
    reply: str
    intent: str = Field(description="general_question | pricing | booking_request | reschedule | complaint | unknown")
    confidence: float
    needs_human_review: bool
    lead_fields_detected: LeadFields
    next_required_field: Optional[str] = Field(None, description="customer_name | customer_phone | address | service_type | preferred_date | null")

class GenerateRequest(BaseModel):
    message: str
    history: Optional[list] = []
    business_profile: Dict[str, Any]
    services: list
    faqs: list
    conversation_id: Optional[str] = None
    current_lead_state: Optional[LeadFields] = None

class ClassifyRequest(BaseModel):
    message: str

class ClassifyResponse(BaseModel):
    intent: str
    confidence: float
