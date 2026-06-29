import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models.schemas import (
    GenerateRequest, 
    GenerateResponse, 
    ClassifyRequest, 
    ClassifyResponse
)
from services.response_generator import generate_mock_ai_response
from services.intent_classifier import classify_message_intent

app = FastAPI(
    title="CleanDesk AI Service",
    description="Microservice for handling intent classification and text generation for local cleaning businesses.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """
    Health check endpoint for checking the status of the service.
    """
    return {
        "status": "ok",
        "service": "ai-service",
        "openai_configured": os.getenv("OPENAI_API_KEY") is not None and os.getenv("OPENAI_API_KEY") != "your_openai_api_key_here"
    }

@app.post("/generate-response", response_model=GenerateResponse)
async def generate_response(payload: GenerateRequest):
    """
    Generates a reply and extracts lead information based on business knowledge.
    """
    try:
        # Generate the response using our service (currently mock, but logic-driven)
        response = generate_mock_ai_response(
            message=payload.message,
            business_profile=payload.business_profile,
            services=payload.services,
            faqs=payload.faqs,
            current_lead_state=payload.current_lead_state
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify-intent", response_model=ClassifyResponse)
async def classify_intent(payload: ClassifyRequest):
    """
    Classifies the intent of a customer message.
    """
    try:
        intent, confidence = classify_message_intent(payload.message)
        return ClassifyResponse(intent=intent, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
