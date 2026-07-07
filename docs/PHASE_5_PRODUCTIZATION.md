# Phase 5 Productization & Multi-Tenancy Security Guide

This document describes how to activate, verify, and test real Supabase Auth, backend token verification middleware, multi-tenant row-ownership logic, and the embeddable floating chat widget.

---

## 1. Supabase Authentication Setup

1. **Activate Email/Password Sign-In**:
   - Go to your [Supabase Dashboard](https://supabase.com/).
   - Navigate to **Authentication** > **Providers** > **Email**.
   - Ensure the provider is enabled and toggle **Confirm Email** off to allow instant test user creations.

2. **Locate Client Keys**:
   - Navigate to **Project Settings** > **API**.
   - Copy the `Project URL` and `anon public` API key.

3. **Configure Frontend Environment**:
   - Populate `frontend/.env` with your public keys:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     VITE_BACKEND_URL=http://localhost:5000
     ```

---

## 2. Row Level Security (RLS) SQL Script

To safeguard database tables from direct query manipulation, execute the contents of **[rls_policies.sql](file:///c:/Users/tazwa/cleandesk-ai/docs/rls_policies.sql)** in the Supabase **SQL Editor**:

- Run the query block. This will restrict direct table mutations on `businesses`, `services`, `faqs`, `leads`, `conversations`, and `messages` to their authenticated creators (where `user_id = auth.uid()`).
- Direct client-side reads are disabled for critical tables (`leads`, `conversations`, `messages`) for data privacy.
- The Express backend queries the database using the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS, but strictly enforces ownership checks in Express application logic.

---

## 3. Backend Multi-Tenant Verification Architecture

When a request hits a private route on the Express backend:

1. **Token Interception**:
   - The [authMiddleware.js](file:///c:/Users/tazwa/cleandesk-ai/backend/middleware/authMiddleware.js) middleware extracts the bearer token from the header: `Authorization: Bearer <JWT_TOKEN>`.
   
2. **Token Verification**:
   - The token is verified against Supabase Auth: `await supabase.auth.getUser(token)`.
   - On success, the decrypted user payload is attached to the request: `req.user = user`.
   
3. **Multi-Tenant Ownership Assertions**:
   - The controllers (e.g. `serviceController.js`, `faqController.js`, `leadController.js`, `conversationController.js`) execute pre-checks to assert that the `business_id` of the queried resource belongs to the logged-in user:
     ```javascript
     const isOwner = await checkBusinessOwnership(req.user.id, businessId);
     if (!isOwner) return res.status(403).json({ error: 'Forbidden' });
     ```
   - This prevents Owner A from query-forging or accessing data belonging to Owner B.

---

## 4. Floating Embeddable Chat Widget

CleanDesk AI supports embedding the automated chatbot onto third-party business websites.

1. **Copy the Script Snippet**:
   - Inside the owner settings page (`Settings` > `Business Profile Setup`), copy the script tag rendered in the **Embed Chat Widget** panel.
     ```html
     <script 
       src="http://localhost:5000/widget.js" 
       data-business-id="your-business-uuid" 
       async>
     </script>
     ```

2. **Verify Locally**:
   - Start the backend server (`npm run dev` in `backend/`).
   - Open **[widget-test.html](file:///c:/Users/tazwa/cleandesk-ai/docs/widget-test.html)** directly in your browser.
   - Click the chat launcher bubble at the bottom right to verify conversation interactions with the AI receptionist.
   - Verify that your chat sessions are tracked inside `localStorage` to keep conversation transcripts persistent on refresh.
