# 🛡️ Shadow AI Guardrail

> An AI security proxy that intercepts, scrubs, and audits prompts before they reach an LLM — built for organizations that need safe, controlled AI usage.

---

## What is Shadow AI Guardrail?

Most organizations using AI tools have a hidden problem — employees submit prompts containing sensitive data: names, emails, ID numbers, financial details. That data reaches external LLM providers with no filtering, no logging, and no control.

**Shadow AI Guardrail** sits between the user and the LLM. Every prompt is intercepted, scrubbed of personally identifiable information (PII), processed through a structured AI pipeline, and logged with a full audit trail. Organizations get the power of AI without the compliance risk.

---

## Live Demo

| Role  | Email              | Password |
| ----- | ------------------ | -------- |
| User  | demo@shadowai.com  | demo1234 |
| Admin | admin@shadowai.com | demo1234 |

> Demo accounts are read-only. User registration is disabled in demo mode.

---

## Key Features

### 🧹 PII Scrubbing

Every prompt is scanned and cleaned before it touches the LLM. Names, email addresses, phone numbers, ID numbers, and other sensitive identifiers are stripped automatically. The original and cleaned prompts are both stored for audit purposes.

### ⚙️ Structured AI Pipeline

Prompts don't go directly to the LLM. They pass through a multi-stage pipeline: scrubbing → LLM processing → response parsing → structured output. Responses are always returned in a consistent, validated format with a summary and cited sources.

### 📋 Full Audit Logging

Every interaction is logged to a secure database with a timestamp, the original prompt, the cleaned prompt, and the AI response. Admins can review all activity from their organization in real time via the admin dashboard.

### 🏢 Multi-Organization Support

The system is built for multiple organizations. Each org is isolated — admins only see logs from their own organization. Users belong to an org and their activity is scoped accordingly.

### 👤 Role-Based Access Control

Two roles: `admin` and `user`. Admins can register new users into their organization and view all logs. Users access the chat interface only. Authentication is handled via Supabase Auth with RLS policies enforcing data isolation.

### 🚦 Rate Limiting

Each user is limited to 10 requests per day to prevent abuse and control API costs. The limit resets daily. When the limit is hit, the user receives a clear message in the chat interface.

---

## System Architecture

```
User Input
    │
    ▼
┌─────────────────────────────┐
│      React Frontend         │
│  Chat UI + Admin Dashboard  │
└────────────┬────────────────┘
             │ HTTP (axios)
             ▼
┌─────────────────────────────┐
│      FastAPI Backend        │
│                             │
│  1. Rate Limit Check        │
│  2. PII Scrubber            │
│  3. LLM Pipeline            │
│  4. Response Parser         │
│  5. Audit Logger            │
└────────┬──────────┬─────────┘
         │          │
         ▼          ▼
   ┌──────────┐  ┌──────────┐
   │          │  │ Supabase │
   │   LLM    │  │ Database │
   │          │  │  + Auth  │
   └──────────┘  └──────────┘
```

---

## Tech Stack

**Frontend**

- React
- Tailwind CSS
- Axios
- Supabase JS Client

**Backend**

- FastAPI (Python)
- LangChain + GPT-4o mini
- Pydantic (structured output validation)
- Supabase Python Client
- python-dotenv

**Infrastructure**

- Supabase (PostgreSQL + Auth + RLS)
- Uvicorn (ASGI server)

---

## Project Structure

```
shadow-ai-guardrail/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Chat.jsx          # User chat interface
│   │   │   ├── Admin.jsx         # Admin dashboard
│   │   │   └── Login.jsx         # Auth + demo access
│   │   ├── lib/
│   │   │   └── supabase.js       # Supabase client
│   │   └── App.js                # Routing + session restore
│   └── .env
│
└── backend/
    ├── main.py                   # FastAPI app + CORS
    ├── routes/
    │   ├── research.py           # POST /research
    │   ├── logs.py               # GET /logs
    │   └── admin.py              # POST /admin/register-user
    ├── services/
    │   ├── pipeline.py           # Orchestrates scrub → LLM → log
    │   ├── pii_scrubber.py       # PII detection and removal
    │   ├── llm_service.py        # LangChain + GPT-4o mini
    │   ├── logger.py             # Audit log writer
    │   ├── rate_limiter.py       # Daily request limiting
    │   └── db.py                 # Supabase client
    ├── models/
    │   └── schemas.py            # Pydantic request/response models
    └── .env
```

---

## Database Schema

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- User profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',         -- 'admin' or 'user'
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Audit logs
CREATE TABLE logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  organization_id UUID REFERENCES organizations(id),
  timestamp TEXT,
  original_prompt TEXT,
  cleaned_prompt TEXT,
  response JSONB
);

-- Rate limiting
CREATE TABLE rate_limits (
  user_id TEXT NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  request_count INT DEFAULT 1,
  PRIMARY KEY (user_id, request_date)
);
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Supabase project
- An OpenAI API key

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the backend folder:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:3001
DEMO_ORG_ID=your_demo_organization_uuid
```

Start the server:

```bash
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:

```env
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the app:

```bash
npm start
```

---

## API Endpoints

| Method | Endpoint               | Description                                    |
| ------ | ---------------------- | ---------------------------------------------- |
| `POST` | `/research`            | Submit a prompt through the guardrail pipeline |
| `GET`  | `/logs`                | Fetch audit logs filtered by organization      |
| `POST` | `/admin/register-user` | Register a new user (admin only)               |

### POST `/research`

```json
{
  "query": "My name is John Doe. What is zero-trust security?",
  "user_id": "uuid",
  "organization_id": "uuid"
}
```

Response:

```json
{
  "answer": "Zero-trust security is a model that assumes no user or system...",
  "sources": ["https://www.nist.gov/zero-trust"]
}
```

The original prompt contained a name. The LLM never saw it.

---

## Security Considerations

- **Service role key** is used server-side only and never exposed to the frontend
- **RLS policies** on Supabase ensure users can only read their own profile
- **Demo org isolation** — demo accounts cannot register users or access real org data
- **Rate limiting** is enforced server-side, not just on the frontend
- **CORS** is restricted to the configured frontend URL only

---

## Roadmap

- [ ] Webhook notifications for flagged prompts
- [ ] Custom PII rules per organization
- [ ] Usage analytics dashboard
- [ ] SSO / enterprise login
- [ ] Export audit logs as CSV
- [ ] Slack / Teams integration

---

## Author

Built by **Lethabo Rabutla**  
[GitHub](https://github.com/yourgithub) · [LinkedIn](https://linkedin.com/in/yourlinkedin) · [PortFolio](https://lethaborabutla.com/)

---

> _Shadow AI Guardrail was built to demonstrate how organizations can adopt AI responsibly — with guardrails, not restrictions._
