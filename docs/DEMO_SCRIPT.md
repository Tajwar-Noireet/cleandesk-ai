# CleanDesk AI Presentation & Demo Script

This script provides multiple options for presenting CleanDesk AI to recruiters, technical leads, and stakeholders.

---

## 🎙️ 1. The 2-Minute Recruiter Demo
**Objective**: Quick high-level product flow showcasing core business value.

> "CleanDesk AI is an automated marketplace and inbox manager for local home service businesses. The problem it solves is simple: home service owners (cleaners, repairs, plumbers) lose up to 50% of new business leads because they are in the field and cannot answer calls or emails instantly.
> 
> Let's look at the customer booking flow:
> 1. **Discovery**: A customer finds a verified service gig on our marketplace directory (e.g. Tazwa Premium Cleaning).
> 2. **Checkout**: The customer books the gig by filling out a strict request form.
> 3. **Instant Auto-Reply**: The backend creates a lead and routes it to our **AI receptionist**. If the AI service is online, it generates a custom message acknowledging details (Jane, Saturday). If offline, it uses a reliable fallback template so the lead loop never breaks.
> 4. **Owner Workspace**: Now, switching to the owner dashboard. The owner receives the structured lead instantly in their leads inbox, reviews the conversation thread, and can use AI Assist to draft and send confirmation replies in one click.
> 
> By connecting public discovery storefronts with an AI-driven operations CRM, CleanDesk ensures no lead is left unanswered."

---

## 💻 2. The 5-Minute Technical Demo
**Objective**: Deep-dive into architecture, security, and slot extraction.

### Step 1: The Monorepo Architecture
- "CleanDesk is built as a modular monorepo:
  - React + Vite client using a custom monochrome design system.
  - Node + Express backend orchestration server.
  - Python FastAPI NLP service processing intents."

### Step 2: The AI Receptionist Engine
- "When the customer submits a gig request, the Express server hits the FastAPI NLP service. 
- The AI runs **slot-extraction** to identify names, telephone numbers, addresses, and preferred dates. It parses missing parameters and generates a matching intent response. 
- The conversation, messages, and intent details are structured and stored in Supabase."

### Step 3: Conversation Workspace & AI Drafts
- "Show the owner's `Conversations.jsx` dashboard. It uses a clean three-column workspace layout. 
- The right panel displays the AI-extracted metadata, missing parameters checklist, and an **AI Assistant composer**. 
- The owner can review, edit, and send the AI receptionist's suggested draft response in real-time."

---

## 🚀 3. The Startup Pitch Version
**Objective**: Focus on business model, scaling, and market opportunity.

> "Home services is a $500B market driven by highly fragmented local teams. Small business owners cannot afford dedicated customer support agents, and standard CRM tools are too complex for them.
> 
> CleanDesk AI acts as a digital co-founder. We provide a two-sided platform:
> - **Demand Generation**: Public storefronts and service gig listings indexable by search engines.
> - **Operational Automation**: A simple CRM inbox where a real-time AI receptionist schedules bookings, verifies coverage areas, and compiles client histories.
> 
> This model allows us to charge a low SaaS subscription fee plus transaction commission on leads. We turn service operational overhead into automated business growth."

---

## 🔒 4. Technical Talking Points

### Row Level Security (RLS) & Isolation
- "Multi-tenancy isolation is enforced at the database level using Supabase Row Level Security.
- Owners can only select and mutate tables (`leads`, `conversations`, `businesses`, `services`) where `owner_id = auth.uid()`.
- Customer bookings are validated dynamically via middleware, verifying that the client request aligns with a public business slug before database insert."

### API Payload Security
- "Public endpoints (like `GET /api/public/businesses`) use server-side stitching to filter out private fields (like user IDs, internal notes, or service keys).
- The frontend client only handles the public anon key. The private service role key and OpenAI key are restricted entirely to the backend servers."

### Graceful Fallbacks
- "If the NLP service goes offline or experiences rate-limiting, the Express server handles the catch blocks elegantly, switching to a structured fallback message. This guarantees that booking requests are still stored and owners receive lead notifications without frontend crashes."
