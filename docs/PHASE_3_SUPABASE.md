# Phase 3 Supabase Integration Guide

This document describes how to set up, connect, and verify your live Supabase PostgreSQL database for CleanDesk AI.

---

## 1. Supabase Project Setup

1. **Create Account / Project**:
   - Go to [Supabase](https://supabase.com) and sign in.
   - Click **New Project** and select your organization.
   - Enter `CleanDesk AI` as the name, generate a secure database password, and choose your region.

2. **Execute Database Schema**:
   - Once your project is provisioned, click on the **SQL Editor** in the left sidebar.
   - Click **New Query**.
   - Copy the full contents of [docs/schema.sql](file:///c:/Users/tazwa/cleandesk-ai/docs/schema.sql) and paste them into the editor.
   - Click **Run**. You should see success messages indicating the tables and the seed business data have been successfully created.

---

## 2. Configure Local Environment Variables

To switch the Express backend and Vite frontend from Mock Mode to Live Supabase Database Mode, populate the keys in your local `.env` files.

> [!WARNING]
> Do not commit these `.env` files. They are excluded globally by gitignore configurations.

### Backend Configurations
1. Go to `backend/` and create or edit `.env`.
2. Add your keys:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
   AI_SERVICE_URL=http://localhost:8000
   ```
   *(Note: The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS) to manage leads, services, and FAQ operations securely from your Node server).*

### Frontend Configurations
1. Go to `frontend/` and create or edit `.env`.
2. Add your keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   VITE_BACKEND_URL=http://localhost:5000
   ```

---

## 3. Verify Database Connectivity

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```
2. Verify the startup logs. You should see a clear banner:
   ```
   ==================================================
   🚀 DATABASE STATE: Live Supabase Database Mode Active
   ==================================================
   ```
   *(If you see `Running in Offline Mock Mode`, check that your `.env` file exists and is populated correctly).*

3. Visit `http://localhost:5000/health` in your browser. The output should show:
   ```json
   {
     "status": "ok",
     "message": "CleanDesk AI Backend is running smoothly",
     "mode": "Supabase Database Active"
   }
   ```

---

## 4. Manual Testing Checklist

Ensure everything connects end-to-end:

- [ ] **Read Business Profile**: Navigate to the Demo page (`http://localhost:5173/demo`). It should query the backend, which queries Supabase to successfully load the name, descriptions, and list of services of `SparkleHome Cleaning`.
- [ ] **AI Chat Logging**: Interact with the chat widget in the demo page. Verify in your Supabase **Table Editor** under `messages` that each message you type and each response generated is successfully written.
- [ ] **Lead Generation**: Enter booking details in the chat (e.g. "My name is Sarah, reach me at +44 7700 900077, Wembley, regular cleaning"). Verify that a new row is automatically added to the `leads` table in Supabase.
- [ ] **Dashboard CRUD**: Navigate to the Dashboard settings. Modify opening hours, add a new service, or delete an FAQ. Refresh the page to verify changes persist and reflect directly inside your Supabase tables.
