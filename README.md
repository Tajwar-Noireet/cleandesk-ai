# CleanDesk AI

> A full-stack AI-powered service marketplace and business operations platform.  
> Owner-created gigs → Customer booking → AI receptionist → Owner inbox → Continuous AI conversation.

[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/AI%20Service-FastAPI%20%2B%20OpenAI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

---

## What it does

CleanDesk AI is a two-sided marketplace and AI inbox platform for local service businesses. It lets owners list and sell service gigs publicly, while an AI receptionist automatically handles the first layer of every customer enquiry — then hands off to the owner when it needs a human.

**The core product loop:**

```
Owner publishes business
  → Owner creates public service gig
    → Customer discovers gig on /services
      → Customer books gig
        → AI receptionist sends instant reply
          → Owner sees lead + conversation in inbox
            → Owner sends manual reply or AI-drafted reply
              → Customer sees reply in their portal
                → Customer replies again → AI replies again (up to safety limit)
```

---

## Architecture

```
┌─────────────────────────────────────┐
│      React + Vite  (port 5173)      │
│  Public marketplace + Owner inbox   │
│  + Customer support portal          │
└────────────────┬────────────────────┘
                 │  REST API  (CORS)
                 ▼
┌─────────────────────────────────────┐
│   Express API Server  (port 5000)   │
│   Auth · Leads · Conversations      │
│   Businesses · Services · FAQs      │
└──────────┬──────────────┬───────────┘
           │              │
     Supabase JS     HTTP (axios)
           │              │
           ▼              ▼
┌──────────────┐  ┌────────────────────────┐
│  Supabase    │  │  FastAPI AI Service     │
│  PostgreSQL  │  │  (port 8000)            │
│  + RLS       │  │  OpenAI GPT-4o-mini     │
└──────────────┘  │  + local fallback NLP   │
                  └────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v7, Motion for React, Vanilla CSS |
| Backend API | Node.js, Express, Supabase JS client |
| AI NLP Service | Python, FastAPI, OpenAI API (GPT-4o-mini), local fallback responder |
| Database | Supabase PostgreSQL, Row Level Security (RLS) |
| Auth | Supabase Auth (JWT) |

---

## Key Features

### Marketplace
- Public `/services` gig discovery with text search, category, and location filters
- Owner-created service gigs with pricing, descriptions, and public/private toggle
- Business profile pages with service catalog, FAQs, and booking flow

### AI Receptionist
- **Instant first reply** — triggered automatically on every new booking
- **Continuous follow-up** — AI replies to every subsequent customer message using full conversation history
- **Safety limiter** — stops auto-sending after 2 consecutive AI replies; escalates to owner review
- **Confidence scoring** — low-confidence replies flag `needs_human_review` instead of auto-sending
- **Offline fallback** — local NLP responder fires if OpenAI or the AI service is unavailable
- **Loop prevention** — owner messages and AI messages never trigger AI auto-reply

### Owner Inbox (`/dashboard/conversations`)
- Three-column workspace: conversation list · active thread · AI assist panel
- AI draft generation with editable preview before sending
- Lead status management (new → contacted → booked → lost)
- Human review flagging and one-click dismiss

### Customer Portal (`/customer/conversations`)
- Full thread view: customer messages, AI receptionist replies, owner replies
- Real-time optimistic append — AI reply appears immediately after send
- Booking tracking and reschedule request flow

### Security & Isolation
- Supabase RLS policies enforce strict owner/customer data boundaries
- Customers can only read their own conversations and leads
- Owners can only access conversations tied to their own business
- All isolation enforced at both API layer and database layer

---

## Local Setup

### Prerequisites
- Node.js v18+
- Python 3.9+
- A Supabase project (free tier works)
- OpenAI API key

### 1. Clone the repo

```bash
git clone https://github.com/Tajwar-Noireet/cleandesk-ai.git
cd cleandesk-ai
```

### 2. Backend API

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AI_SERVICE_URL
npm install
npm run dev
# → http://localhost:5000
# → http://localhost:5000/health
```

### 3. AI Receptionist Service

```bash
cd ai-service
python -m venv venv
# Windows:
.\\venv\\Scripts\\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in OPENAI_API_KEY

uvicorn main:app --reload --port 8000
# → http://localhost:8000
# → http://localhost:8000/health
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_BACKEND_URL

npm install
npm run dev
# → http://localhost:5173
```

### 5. Database migrations

Run these SQL files in your Supabase project **in order** via the SQL editor:

```
docs/schema.sql                       ← core tables
docs/marketplace_migration.sql        ← storefront enhancements
docs/service_gigs_migration.sql       ← owner gig linking
docs/conversation_messaging_migration.sql  ← thread metadata
docs/rls_policies.sql                 ← security isolation
```

---

## Environment Variables

### `backend/.env`

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI service location
AI_SERVICE_URL=http://localhost:8000

# AI receptionist controls
AUTO_AI_REPLY_ON_ENQUIRY=true       # set false to disable all auto-replies
AI_MAX_CONSECUTIVE_REPLIES=2        # max AI replies before handing off to human
```

### `frontend/.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=http://localhost:5000
```

### `ai-service/.env`

```env
OPENAI_API_KEY=sk-...
MODEL_NAME=gpt-4o-mini
PORT=8000
```

---

## Route Map

### Public
| Route | Description |
|---|---|
| `/` | Landing page with scroll-driven "From request to response" story |
| `/services` | Gig marketplace with search and filters |
| `/businesses` | Business directory |
| `/business/:slug` | Business profile, gig catalog, FAQs |
| `/business/:slug/book` | Booking checkout |

### Owner (authenticated)
| Route | Description |
|---|---|
| `/dashboard` | Leads CRM overview |
| `/dashboard/conversations` | Three-column AI inbox workspace |
| `/dashboard/leads` | Lead table with status management |

### Customer (authenticated)
| Route | Description |
|---|---|
| `/customer/dashboard` | Active bookings and request tracking |
| `/customer/conversations` | Thread view with AI + owner replies |
| `/customer/bookings` | Booking history |

---

## AI Receptionist — Safety Design

The AI receptionist is designed to assist, not replace, the business owner.

| Guard | Behaviour |
|---|---|
| **Loop prevention** | Owner and AI messages never trigger AI auto-reply — only `sender: customer` does |
| **Consecutive limit** | After 2 consecutive AI replies without an owner message, auto-send stops and `needs_human_review` is set |
| **Low confidence** | If the AI service returns `needs_human_review: true`, no message is auto-sent; the draft is only visible to the owner |
| **Service offline** | Local NLP fallback fires; reply still saves with `fallback_mode: true` |
| **Customer failure** | AI errors never block the customer message — failure is caught, logged, and the customer's message saves regardless |

The limit is configurable: `AI_MAX_CONSECUTIVE_REPLIES=N` in `backend/.env`.

---

## Message Schema

All messages use a consistent schema:

```sql
messages (
  id               uuid primary key,
  conversation_id  uuid references conversations,
  sender           text,   -- 'customer' | 'ai' | 'owner' | 'system'
  content          text,
  metadata         jsonb,  -- { source, trigger, mode, confidence, intent }
  created_at       timestamptz
)
```

---

## Demo Flow

1. Sign in as an owner → create a business → create a public gig
2. Visit `/services` as a customer → find the gig → book it
3. AI receptionist sends an instant acknowledgement
4. Owner logs into `/dashboard/conversations` → sees the lead and thread
5. Customer replies in their portal
6. AI sends a follow-up using full conversation history
7. Owner generates an AI draft → edits it → sends the final reply
8. Customer sees the reply in real-time

Full scripts in [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md).  
Deployment guide in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## Project Structure

```
cleandesk-ai/
├── backend/                  Express API
│   ├── controllers/          Business logic
│   │   ├── customerController.js   ← AI follow-up + isolation
│   │   ├── conversationController.js
│   │   └── leadController.js
│   ├── lib/
│   │   ├── aiReceptionist.js       ← Draft generation + fallback
│   │   └── localAIResponder.js     ← Offline NLP fallback
│   └── routes/
├── frontend/                 React + Vite
│   └── src/
│       ├── pages/
│       │   ├── Conversations.jsx         ← Owner inbox
│       │   ├── CustomerConversations.jsx ← Customer thread
│       │   └── ...
│       └── services/api.js
├── ai-service/               FastAPI + OpenAI
│   └── main.py
└── docs/                     SQL migrations + docs
```

---

## License

MIT