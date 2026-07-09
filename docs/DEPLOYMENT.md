# CleanDesk AI Deployment Guide

This guide details instructions for deploying the CleanDesk AI stack (Frontend, Backend, and AI Receptionist service) to production.

---

## 🏗️ Production Architecture

CleanDesk AI is divided into three separate components:
1. **Frontend**: React + Vite SPA (Client-side)
2. **Backend**: Express.js API Server (Connects directly to Supabase with service-role privileges)
3. **AI Receptionist Service**: FastAPI NLP & Slot-Extraction Service (Invoked by the Backend API)

```
[ Frontend Client (Vercel) ]
             │
             ▼ (CORS API Requests)
[ Backend Express Server (Render / Railway) ]
      │                                │
      ▼ (Service-Role SQL queries)     ▼ (NLP Slot-Extraction)
[ Supabase database ]            [ FastAPI AI Service (Render / Railway) ]
                                       │
                                       ▼ (Completion generation)
                                 [ OpenAI API ]
```

---

## 1. Supabase Setup
Create a production database project on Supabase and run the SQL migration files in this exact sequence:
1. `docs/schema.sql` (Creates table layouts, fields, indexes, and initial triggers)
2. `docs/marketplace_migration.sql` (Enables storefront catalogs and categories)
3. `docs/service_gigs_migration.sql` (Links service gigs to customer lead capture)
4. `docs/conversation_messaging_migration.sql` (Powers active workspace messaging)
5. `docs/rls_policies.sql` (Secures database rows per tenant isolation boundaries)

**Production Env Variables to copy:**
- `SUPABASE_URL`: Project URL found under API settings.
- `SUPABASE_ANON_KEY`: Client anon key for frontend auth.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key (keep private to Backend Express server).

---

## 2. AI Receptionist Service Deployment (FastAPI)
**Target Platform**: Render, Railway, or Fly.io

- **Source root**: `ai-service/`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables
Configure the following environment keys on your hosting provider:
```env
PORT=8000
MODEL_NAME=gpt-4o-mini
OPENAI_API_KEY=sk-proj-... # Your real OpenAI secret key
```

### Health Check URL
`https://your-ai-service.railway.app/health` (Should return `{"status":"ok"}`)

---

## 3. Backend Express Server Deployment
**Target Platform**: Render, Railway, or Fly.io

- **Source root**: `backend/`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment Variables
```env
PORT=5000
SUPABASE_URL=https://your-supabase-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey... # Your Supabase service role secret
AI_SERVICE_URL=https://your-ai-service.railway.app # FastAPI production URL
```

### CORS Configuration
Ensure `backend/server.js` lists your production frontend domain under the allowed CORS origins.

### Health Check URL
`https://your-backend-api.railway.app/health`

---

## 4. Frontend Client Deployment (React + Vite)
**Target Platform**: Vercel or Netlify

- **Source root**: `frontend/`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-supabase-id.supabase.co
VITE_SUPABASE_ANON_KEY=ey... # Your Supabase public anon key
VITE_BACKEND_URL=https://your-backend-api.railway.app # Express server production URL
```

---

## 🏁 Pre-Flight Production Checklist
1. **Security Isolation**: Verify that `VITE_SUPABASE_ANON_KEY` is the only Supabase key compiled into the frontend. **Never** bundle `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` into frontend environment files.
2. **CORS Policies**: Restrict permitted CORS origins in the Express server to your Vercel/Netlify frontend domains.
3. **Health Validation**: Confirm both `/health` endpoints return status `ok` post-deployment.
