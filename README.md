# CleanDesk AI

CleanDesk AI is an intelligent, premium two-sided service marketplace and operations CRM built for local business owners and customers. It features a public storefront directory for discovering service gigs, an automated **AI Receptionist** that replies to bookings, and a unified owner dashboard to manage leads, view conversations, and draft responses.

---

## 🏗️ Architecture Overview

CleanDesk AI uses a modular, monorepo architecture:

```
                  ┌──────────────────────────┐
                  │  React + Vite Frontend   │
                  └─────────────┬────────────┘
                                │
                      HTTP APIs │ (CORS Allowed)
                                ▼
                  ┌──────────────────────────┐
                  │    Express API Server    │
                  └──────┬────────────┬──────┘
                         │            │
       SQL Queries / RLS │            │ HTTP calls
                         ▼            ▼
                  ┌──────────┐  ┌──────────────────────────┐
                  │ Supabase │  │   FastAPI AI Service     │
                  └──────────┘  └─────────────┬────────────┘
                                              │
                                   Completion │ HTTP
                                              ▼
                                       ┌──────────┐
                                       │  OpenAI  │
                                       └──────────┘
```

---

## 🛠️ Tech Stack
- **Frontend**: React (v19) + Vite, React Router (v7), Motion for React (Animations), Vanilla CSS (Monochrome layout and blue accenting).
- **Backend API**: Node.js + Express, Supabase JS client.
- **AI NLP Service**: Python FastAPI, OpenAI API SDK.
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) policies.

---

## 🗄️ Database Setup & Migration Order

To set up the Supabase database instance, run the migration scripts located in the `docs/` directory in this exact order:

1. **`docs/schema.sql`** (Initial table setups: users, businesses, leads, messages, conversations)
2. **`docs/marketplace_migration.sql`** (Storefront and public directory enhancements)
3. **`docs/service_gigs_migration.sql`** (Owner-created marketplace service gigs linking)
4. **`docs/conversation_messaging_migration.sql`** (Thread message layouts and metadata triggers)
5. **`docs/rls_policies.sql`** (Row Level Security boundary isolation policies)

---

## 🚀 Local Quickstart Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)

### 1. Backend Server Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the example environment variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```
   *Runs on `http://localhost:5000`. Health endpoint: `http://localhost:5000/health`*

### 2. AI Receptionist Service Setup
1. Navigate to the ai-service directory:
   ```bash
   cd ai-service
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate   # Windows (PowerShell)
   source venv/bin/activate  # macOS / Linux
   ```
3. Install packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *Runs on `http://localhost:8000`. Health endpoint: `http://localhost:8000/health`*

### 3. Frontend Client Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Copy the example environment variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start Vite developer server:
   ```bash
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

---

## 🗺️ Key Routes Map

### Public Routes
- `/` - Landing page with "From request to response" interactive scroll-driven story.
- `/services` - Gigs discovery marketplace with text search and category/location filters.
- `/businesses` - Storefront profiles business directory.
- `/business/:slug` - Public business portfolio, FAQs, and gig service catalog.
- `/business/:slug/book` - Strict checkout form with service gig pre-selections.

### Owner Dashboard (Authenticated)
- `/dashboard` - CRM leads overview.
- `/dashboard/conversations` - 3-column inbox assistant workspace.

### Customer Support Portal
- `/customer/login` - Booking tracking login.
- `/customer/dashboard` - Active requests checklist tracking.
- `/customer/conversations` - Real-time client support thread.

---

## 🔮 Demo Workflow & Storytelling
1. **Discover**: Browse `/services` and search for local owner-created gigs.
2. **Book**: Select a gig, preview details, and submit a booking request at `/business/:slug/book`.
3. **Acknowledge**: An AI receptionist instantly intercepts the booking and submits a response acknowledging the customer's request.
4. **CRM Capture**: The business owner logs in to `/dashboard` to see the lead captured under "Needs Review".
5. **Manage Thread**: Owner opens `/dashboard/conversations`, reviews the thread, generates an AI draft response, edits it, and sends the reply.
6. **Track Status**: Customer signs in to the portal to follow the conversation in real-time.