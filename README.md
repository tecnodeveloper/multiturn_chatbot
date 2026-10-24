# Multi-Turn AI Chatbot System

<div align="center">

**A production-grade, context-aware conversational AI platform powered by Google Gemini & Ollama**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-lightgrey?logo=flask)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org/)

</div>

---

## 📖 Project Overview

The **Multi-Turn AI Chatbot System** is a full-stack, decoupled conversational AI application that delivers persistent, context-aware multi-turn dialogues. It combines real-time streaming AI responses, structured human-in-the-loop feedback collection, intelligent topic classification, session phase tracking, and a rich analytics dashboard.

Users can authenticate via email/password or Google OAuth, maintain persistent chat sessions across browser reloads, switch dynamically between AI providers and models, organize conversations with a sidebar, upload documents for RAG-style context, and review system-wide performance metrics in a dedicated analytics view.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|:---|:---|:---|
| **Frontend Framework** | Next.js 16.2.6 (App Router + TypeScript) | SSR, Edge Runtime API routes, file-based routing |
| **AI Providers** | Google Gemini API + Ollama (local) | Dual-provider: cloud or local LLM, runtime-switchable |
| **AI SDK** | Vercel AI SDK v6 (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`) | Streaming `streamText`, Edge-compatible |
| **Backend API** | Python Flask 2.3.3 (WSGI) + `uv` runtime | Streaming `/api/chat`, analytics, topic classification |
| **Database** | Supabase Cloud (PostgreSQL + RLS) | Row-Level Security, PostgREST, real-time |
| **Auth** | Supabase Auth (Email + Google OAuth 2.0) | `@supabase/ssr` for server-side session handling |
| **Styling** | Tailwind CSS 3 + `next-themes` | Dark/Light mode, glassmorphism, Radix UI primitives |
| **UI Components** | Radix UI + Lucide React + Tabler Icons | Fully accessible, headless component library |
| **Charts** | Recharts 3 | Analytics visualizations and trend graphs |
| **Animations** | Framer Motion 10 | Page transitions, micro-animations |
| **Form Handling** | React Hook Form + Zod | Type-safe validation |
| **Notifications** | Sonner | Toast notification system |

---

## 🏗️ Repository Structure

```
multiturn_chatbot/
├── frontend/                       # Next.js 16 web application
│   ├── app/                        # App Router pages & API routes
│   │   ├── (auth)/                 # Auth route group
│   │   │   ├── login/              # Login page (email + Google OAuth)
│   │   │   └── signup/             # Registration page
│   │   ├── (chat)/                 # Protected chat route group
│   │   │   ├── dashboard/          # Main chatbot UI
│   │   │   ├── analytics/          # Analytics dashboard
│   │   │   └── templates/          # AI template browser
│   │   ├── account/                # User profile & settings
│   │   └── api/                    # Edge API routes
│   │       ├── chat/route.ts       # Streaming chat (Gemini / Ollama)
│   │       ├── analytics/route.ts  # Analytics data aggregation
│   │       ├── analytics/summary/  # Analytics summary endpoint
│   │       ├── auth/callback/      # Supabase OAuth callback
│   │       └── health/             # Health check endpoint
│   ├── components/                 # React component library
│   │   ├── chat/                   # Chat UI, input, message list
│   │   ├── analytics/              # Charts, tables, stat cards
│   │   ├── sidebar/                # Collapsible sidebar + switcher
│   │   ├── templates/              # Template cards & detail modal
│   │   ├── feedback/               # Feedback components
│   │   ├── account/                # Account settings components
│   │   ├── ui/                     # Shared UI primitives (shadcn-style)
│   │   ├── feedback-modal.tsx      # Post-response feedback dialog
│   │   ├── profile-modal.tsx       # User profile modal
│   │   ├── theme-toggle.tsx        # Dark/Light mode switcher
│   │   └── providers.tsx           # Global context providers
│   ├── context/                    # React Context providers
│   │   ├── auth-context.tsx        # Auth state (user, session)
│   │   └── chat-context.tsx        # Chat state (messages, session)
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-dashboard.ts        # Dashboard state & actions
│   │   └── use-analytics.ts        # Analytics data fetching
│   ├── lib/                        # Service layer & utilities
│   │   ├── ai-providers.ts         # AI provider configuration
│   │   ├── auth.ts                 # Auth helpers (Supabase)
│   │   ├── template-service.ts     # Domain template definitions
│   │   ├── feedback-service.ts     # Feedback submission logic
│   │   ├── supabase.ts             # Supabase client (browser)
│   │   ├── supabase/               # Supabase SSR client
│   │   ├── consume-stream.ts       # SSE stream consumer
│   │   └── validators.ts           # Zod validation schemas
│   ├── db/                         # Database query helpers
│   │   ├── chats.ts                # Chat CRUD operations
│   │   ├── analytics.ts            # Analytics queries
│   │   ├── profiles.ts             # User profile queries
│   │   ├── files.ts                # File attachment queries
│   │   ├── folders.ts              # Folder/organization queries
│   │   ├── presets.ts              # System prompt presets
│   │   └── prompts.ts              # Saved prompts
│   ├── types/                      # TypeScript type definitions
│   │   ├── analytics-graphs.ts     # Chart data types
│   │   ├── analytics-sessions.ts   # Session analytics types
│   │   ├── analytics-tables.ts     # Table data types
│   │   └── analytics-topics.ts     # Topic classification types
│   ├── supabase/
│   │   └── migrations/             # 8 versioned SQL migration files
│   ├── styles/                     # Global CSS overrides
│   ├── public/                     # Static assets
│   ├── next.config.ts              # Next.js configuration
│   ├── tailwind.config.ts          # Tailwind CSS configuration
│   └── .env.example                # Environment variable template
│
└── backend/                        # Python Flask API service
    ├── app.py                      # Main Flask application (all routes)
    ├── analytics/
    │   └── scripts/
    │       └── feedback_processor.py  # Analytics aggregation engine
    └── pyproject.toml              # Python dependencies (uv)
```

---

## ✨ Key Features

### 💬 Conversational AI
- **Multi-turn dialogue** — full conversation history persisted in Supabase and reconstructed on every request
- **Streaming responses** — real-time token-by-token streaming via Server-Sent Events (SSE)
- **Dual AI provider** — switch between **Google Gemini** (cloud) and **Ollama** (local) at runtime
- **Model selection** — choose specific models (e.g., `gemini-3.5-flash`, `llama3:latest`)
- **Document upload** — attach PDF or DOCX files as context (RAG-style via `mammoth` + `pdf-parse`)
- **Auto chat titling** — chat sessions are automatically titled from the first user message

### 🗂️ Session & Organization
- **Persistent sessions** — chats are saved and restored across browser sessions via Supabase
- **Sidebar navigation** — collapsible sidebar listing all past chats with rename/delete support
- **Folder organization** — group chats into folders
- **Saved prompts & presets** — reusable system prompts and parameter presets

### 🤖 Domain Templates
Five specialized AI personas, each with curated system prompts and starter questions:
1. **Machine Learning Assistant** — regression, classification, clustering
2. **Deep Learning Specialist** — CNNs, RNNs, Transformers, PyTorch
3. **Healthcare AI Advisor** — clinical decision support, medical imaging
4. **Power Systems Engineer** — smart grid, voltage control, renewables
5. **E-commerce AI Strategist** — recommendation systems, cart optimization

### ⭐ Feedback & Rating System
- Structured post-response feedback modal (thumbs up/down + written comments)
- Input control locking during generation — feedback must be submitted before the next message
- All feedback persisted to Supabase for analytics aggregation

### 📊 Analytics Dashboard
- **Overview stats** — total messages, sessions, average response time, rating distribution
- **Response volume chart** — time-series bar chart of message volume
- **Feedback distribution chart** — pie/donut chart of positive vs. negative ratings
- **Topic accuracy chart** — classification accuracy per domain
- **Accuracy trend chart** — time-series trend of classification confidence
- **Feedback table** — paginated, filterable table of all user feedback records
- **Session phase breakdown** — Start / Middle / End turn analysis
- **Performance insights** — derived metrics on latency and user satisfaction

### 🔒 Authentication & Security
- **Email + password** authentication with Supabase Auth
- **Google OAuth 2.0** single sign-on
- **Row-Level Security (RLS)** — users only access their own data
- **SSR session management** — `@supabase/ssr` for secure server-side auth cookies

### 🏥 Health Monitoring
- `/api/health` and `/health` endpoint checks: API availability, analytics module, and Supabase connectivity
- Returns structured JSON with per-service status flags

---

## ⚙️ Backend — Topic Classification Engine

The Flask backend (`backend/app.py`) performs intelligent topic classification using a two-stage approach:

1. **Keyword heuristics** (fast, zero-latency): Pattern matching against domain-specific vocabulary
2. **Gemini LLM fallback**: If keywords don't match, classifies using `gemini-3.5-flash` with `temperature=0.0`

**Classification domains:**

| Domain Label | Keywords / Description |
|:---|:---|
| `MachineLearning` | regression, classification, clustering, sklearn |
| `DeepLearning` | CNN, RNN, transformer, PyTorch, deep learning |
| `HealthcareAI` | medical, clinical, patient, hospital, healthcare |
| `PowerSystems` | grid, voltage, energy, solar, battery, power |
| `E-commerceAI` | product, cart, recommend, retail, e-commerce |
| `Other` | casual, short, ambiguous, or off-topic messages |

**Session phase tracking (FR16):**

| Phase | Turn Range | Description |
|:---|:---|:---|
| `start` | Turns 1–2 | Early conversation |
| `middle` | Turns 3–5 | Main engagement |
| `end` | Turns 6+ | Extended dialogue |

---

## 🗄️ Database Schema

Managed via **8 versioned Supabase SQL migrations**:

| Table | Purpose |
|:---|:---|
| `profiles` | User profile data (display name, avatar, bio) |
| `chats` | Chat sessions (title, created_at, user_id) |
| `messages` | All messages with `role`, `content`, `response_time`, `topic_label`, `session_phase` |
| `domains` | Per-message topic classification log |
| `feedback` | User feedback records (rating, comments, message_id) |
| `folders` | Chat folder/group organization |
| `prompts` | Saved reusable prompts |
| `presets` | AI parameter preset configurations |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|:---|:---|
| Node.js | ≥ 18.0 |
| Python | ≥ 3.10 |
| `uv` package manager | latest |
| Supabase project | — |
| Google Gemini API key | — |

---

### Step 1 — Configure Environment Variables

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000

# AI Providers
GEMINI_API_KEY=your_gemini_api_key
OLLAMA_URL=http://127.0.0.1:11434/v1   # Optional – for local Ollama

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
```

> **Note:** The backend reads credentials directly from `frontend/.env.local` — no separate backend `.env` file is required.

---

### Step 2 — Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at → **http://localhost:3000**

---

### Step 3 — Run the Backend

```bash
cd backend
uv sync
uv run python app.py
```

Backend API available at → **http://localhost:5000**

---

### Step 4 — (Optional) Run Local Ollama

```bash
# Pull and serve a local model
ollama pull llama3
# Ollama serves on http://127.0.0.1:11434 by default
```

Then select **Ollama** as the provider in the dashboard model switcher.

---

## 🌐 API Endpoints Reference

### Frontend — Next.js Edge API Routes (Port 3000)

| Route | Method | Description |
|:---|:---|:---|
| `/` | `GET` | Redirects to `/login` or `/dashboard` |
| `/login` | `GET` | Email & Google OAuth login page |
| `/signup` | `GET` | New user registration |
| `/dashboard` | `GET` | Main chatbot interface (protected) |
| `/analytics` | `GET` | Analytics dashboard (protected) |
| `/templates` | `GET` | Domain template browser (protected) |
| `/account` | `GET` | User profile & settings (protected) |
| `/api/chat` | `POST` | Streaming AI completion (Edge runtime) |
| `/api/analytics` | `GET` | Aggregated analytics data |
| `/api/analytics/summary` | `GET` | Analytics summary statistics |
| `/api/auth/callback` | `GET` | Supabase OAuth redirect handler |
| `/api/health` | `GET` | Frontend health check |

### Backend — Flask REST API (Port 5000)

| Endpoint | Method | Description |
|:---|:---|:---|
| `/` | `GET` | Server info string |
| `/health` | `GET` | Full health check (API + analytics module + Supabase) |
| `/api/health` | `GET` | Alias for `/health` |
| `/api/chat` | `POST` | Streaming Gemini inference + topic classification + Supabase persistence |
| `/api/analytics` | `GET` | Analytics aggregation via `feedback_processor.py` |
| `/api/templates` | `GET` | Returns 5 domain template identifiers |

---

## 🔧 Development Scripts

### Frontend

```bash
npm run dev           # Start development server (http://localhost:3000)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run type-check    # TypeScript type check (tsc --noEmit)
npm run format:write  # Prettier format all source files
npm run format:check  # Prettier format check
```

### Backend

```bash
uv sync               # Install/sync all Python dependencies
uv run python app.py  # Run Flask server (port 5000)
```

---

## 📦 Key Dependencies

### Frontend

| Package | Purpose |
|:---|:---|
| `next@16.2.6` | App Router framework |
| `ai@^6.0` + `@ai-sdk/google` | Vercel AI SDK — streaming, Gemini provider |
| `@ai-sdk/openai` | Ollama (OpenAI-compatible) provider |
| `@supabase/ssr` + `@supabase/supabase-js` | Auth & database client |
| `recharts` | Analytics charts |
| `framer-motion` | Animations & transitions |
| `@radix-ui/*` | Accessible headless UI primitives |
| `react-markdown` | Markdown rendering in chat |
| `mammoth` + `pdf-parse` | Document parsing (DOCX, PDF) |
| `react-hook-form` + `zod` | Form handling & validation |
| `next-themes` | Dark/Light mode |
| `sonner` | Toast notifications |
| `lucide-react` + `@tabler/icons-react` | Icon libraries |
| `playwright` | E2E testing |

### Backend

| Package | Purpose |
|:---|:---|
| `flask==2.3.3` | WSGI web framework |
| `flask-cors==4.0.0` | Cross-origin request handling |
| `requests==2.31.0` | HTTP client for Gemini API calls |
| `python-dotenv` | `.env` file loader |
| `pandas` + `numpy` + `scikit-learn` | Analytics data processing |
| `postgrest` | Supabase REST API client |

---

## 🔐 Authentication Flow

```
User → /login → Supabase Auth
                    ├── Email/Password → JWT session cookie
                    └── Google OAuth → /api/auth/callback → JWT session cookie
                                                               ↓
                                                    /dashboard (protected)
```

All protected routes validate session server-side via `@supabase/ssr`. RLS policies on every table ensure users can only read/write their own data.

---

## 📈 Analytics Architecture

```
User feedback (Supabase: feedback, messages, domains tables)
        ↓
/api/analytics (Flask) → feedback_processor.py
        ↓                   ├── Aggregates ratings, response times
        ↓                   ├── Computes topic distributions
        ↓                   └── Session phase breakdown
        ↓
/api/analytics (Next.js Edge Route) → transforms & forwards to frontend
        ↓
Analytics Dashboard (Recharts visualizations)
```

> The analytics microservice is **not** a separate process — it is embedded as a Python module (`analytics/scripts/feedback_processor.py`) inside the main Flask app.

---

##  Testing

```bash
# E2E tests (Playwright)
cd frontend
npx playwright test

# Backend tests
cd backend
uv run python -m pytest tests/
```

---

## Important Notes

- The **backend** loads `frontend/.env.local` automatically — no separate `backend/.env` is needed.
- The **Vercel AI SDK** handles streaming on the Next.js side (`/api/chat`); the Flask backend manages its own independent streaming for `/api/chat` on port 5000.
- **Ollama** integration requires a locally running Ollama instance; the `OLLAMA_URL` env var defaults to `http://127.0.0.1:11434/v1`.
