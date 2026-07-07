# Phase 4 AI Intelligence & Automation Guide

CleanDesk AI utilizes OpenAI's `gpt-4o-mini` to act as an automated, intelligent receptionist for local cleaning businesses. This guide explains how the AI functions, how slots are extracted, how support is escalated, and how to verify these capabilities.

---

## 1. Prompt Engineering & Slot-Filling Flow

The AI receptionist system prompt is built dynamically at [openai_service.py](file:///c:/Users/tazwa\cleandesk-ai/ai-service/services/openai_service.py). It merges:
- **Business Profile**: Coverage zones, operating hours, and overview.
- **Service & Pricing Catalog**: Standard pricing tiers (deep clean, move-out, carpet) and durations.
- **FAQs Knowledge Base**: Verified business answers (supplies, weekend slots, cancel policies).
- **Conversational Context**: Up to the last 10 messages.
- **Current Lead State**: Fields already captured in the database.

### Required Slot Capture Order
When a customer shows booking intent, the AI receptionist asks for missing details **one at a time** in this strict order:
1. `customer_name`
2. `customer_phone`
3. `address`
4. `service_type`
5. `preferred_date`

---

## 2. Escalation & Review Triggers

The AI automatically sets `needs_human_review: true` (escalating to the owner dashboard) if:
- The customer uses negative sentiment or keywords (e.g. "complaint", "refund", "angry", "terrible", "damage", "sue").
- Unsafe, illegal, or dangerous requests are detected.
- The question is outside the provided knowledge base.
- The AI confidence falls below 60%.

---

## 3. Manual Testing Prompts & Expected Actions

Run the following test scripts in the Demo Page widget to manually verify the slot-filling state machine:

| User Prompt | Expected Intent | Expected Extraction | Expected AI Action |
| --- | --- | --- | --- |
| **"How much is deep cleaning?"** | `pricing` | None | AI replies with deep cleaning prices (`£90`, approx 4 hours) extracted from services database. |
| **"Do you clean on weekends?"** | `general_question` | None | AI replies using the FAQ: "Yes, we clean on Saturdays from 9 AM to 4 PM. We are closed on Sundays." |
| **"I want to book a move-out cleaning next Saturday"** | `booking_request` | `service_type: "Move-out cleaning"`, `preferred_date: "Next Saturday"` | AI acknowledges the service and date, then asks for the customer name: *"Could you please tell me your name?"* |
| **"My name is Sarah and my phone number is 07123456789"** | `booking_request` | `customer_name: "Sarah"`, `customer_phone: "07123456789"` | AI merges the name and phone slots with the previous ones, and asks for the address: *"And what is the address of the property to be cleaned?"* |
| **"My address is 25 Green Road"** | `booking_request` | `address: "25 Green Road"` | AI has now collected Name, Phone, Address, Service, and Date. It saves the complete lead to Supabase, updates the conversation status, and confirms: *"Perfect! I have collected all the details. The business owner will review this and contact you..."* |
| **"I am unhappy and want a refund"** | `complaint` | None | AI sets `needs_human_review: true` (which turns the chat widget header red and flags it in the dashboard), apologizing and indicating that the business owner will reach out shortly. |

---

## 4. Verification Details

To verify that the AI service correctly falls back when the OpenAI key is missing:
1. Delete or rename `OPENAI_API_KEY` in `ai-service/.env`.
2. Send a booking message.
3. Check the `ai-service` console logs. You should see:
   `⚠️ Mode: RULE-BASED FALLBACK (no OpenAI key detected)`
4. Set a valid `OPENAI_API_KEY` in `ai-service/.env`.
5. Send a booking message.
6. Check the `ai-service` console logs. You should see:
   `🤖 Mode: REAL AI INTELLIGENCE (calling OpenAI API)`
7. Check the Supabase tables (`leads`, `messages`, `conversations`) to verify the slots are stored correctly.
