# CleanDesk AI (MVP Setup & Architecture)

CleanDesk AI is an intelligent, startup-grade AI receptionist and lead-capture platform built specifically for local home cleaning businesses. It helps companies automate standard pricing, coverage, and rescheduling inquiries, captures qualified booking leads, and escalates complaints or complex customer conversations directly to the business owner.

## Project Structure

The codebase is organized as a modular monorepo:

```
cleandesk-ai/
  ├── frontend/       # React + Vite client-side SPA
  ├── backend/        # Node.js + Express API server
  ├── ai-service/     # Python FastAPI NLP & extraction service
  ├── docs/           # DB schemas and project documentation
  └── README.md       # Root overview & setup instructions
```

---

## 🛠️ Getting Started & Local Launch

CleanDesk AI is designed to run in **offline mock modes** gracefully. If you only launch the frontend, it uses local client fallbacks. Running the backend and AI services activates mock in-memory stores and local NLP rule-matching respectively, with placeholders and code comments ready for Supabase/OpenAI integration.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM** (v9 or higher)
- **Python** (v3.9 or higher recommended)

---

### 1. Frontend Setup (React + Vite)
The frontend contains landing pages, interactive client chat widgets, and the owner management dashboard.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

### 2. Backend Setup (Node.js + Express)
The backend routes API endpoints, manages CORS/middleware, and acts as the lead orchestrator.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend dev server (monitored by Nodemon):
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`. You can inspect the API health at `http://localhost:5000/health`.

---

### 3. AI Service Setup (FastAPI)
The AI service manages slot-extraction (name, phone, address, services, and preferred dates) and intent classification.

1. Navigate to the ai-service directory:
   ```bash
   cd ai-service
   ```
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Create and activate a Python virtual environment:
   - **Windows (CMD/PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
4. Install packages:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   FastAPI will launch on `http://localhost:8000`. Verify its state at `http://localhost:8000/health`.

---

## 🗄️ Database Schema & Supabase Integration

The SQL schema configuration is stored at [docs/schema.sql](file:///c:/Users/tazwa/cleandesk-ai/docs/schema.sql). 

To migrate to a live Supabase PostgreSQL database:
1. Log into your [Supabase Dashboard](https://supabase.com/).
2. Create a new project.
3. Open the **SQL Editor** in Supabase and paste the contents of [schema.sql](file:///c:/Users/tazwa/cleandesk-ai/docs/schema.sql), then click **Run**.
4. Retrieve your **Project URL** and **Service Role Key** under API settings.
5. Update your backend `.env` variables (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) and your frontend `.env` variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) to transition automatically from Mock Data to Live Database mode.