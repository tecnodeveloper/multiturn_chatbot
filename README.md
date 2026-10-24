<div align="center">

# Multi-Turn AI Chatbot System

A full-stack, context-aware conversational AI platform with persistent multi-turn sessions,
streaming responses, human-in-the-loop feedback, automatic topic classification, and a
complete analytics dashboard.

**Final Year Project**

<img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-000000?style=flat-square" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square" />
<img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_3-38BDF8?style=flat-square" />
<img alt="Flask" src="https://img.shields.io/badge/Flask_2.3-000000?style=flat-square" />
<img alt="Python" src="https://img.shields.io/badge/Python_3.10+-3776AB?style=flat-square" />
<img alt="Supabase" src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square" />

</div>

---

## Index

<div align="center">

**[Overview](#overview)** &nbsp;|&nbsp; **[Architecture](#architecture)** &nbsp;|&nbsp; **[Tech Stack](#tech-stack)** &nbsp;|&nbsp; **[Repository Layout](#repository-layout)**
**[Features](#features)** &nbsp;|&nbsp; **[Prerequisites](#prerequisites)** &nbsp;|&nbsp; **[Installation](#installation)** &nbsp;|&nbsp; **[Configuration](#configuration)**
**[Running the Project](#running-the-project)** &nbsp;|&nbsp; **[Scripts](#scripts)** &nbsp;|&nbsp; **[API Reference](#api-reference)**
**[Database Schema](#database-schema)** &nbsp;|&nbsp; **[Topic Classification](#topic-classification)**
**[Session Lifecycle](#session-lifecycle)** &nbsp;|&nbsp; **[Error Handling](#error-handling)**
**[Authentication](#authentication)** &nbsp;|&nbsp; **[Analytics](#analytics)**
**[Testing](#testing)** &nbsp;|&nbsp; **[Troubleshooting](#troubleshooting)**
**[For AI Agents](#for-ai-agents)** &nbsp;|&nbsp; **[Credits](#credits)**

</div>

---

<div align="center"><img alt="Overview" src="https://img.shields.io/badge/Overview-1F6FEB?style=for-the-badge" /></div>

## Overview

The Multi-Turn AI Chatbot System is a decoupled full-stack application for sustained,
context-aware conversation with a large language model. It keeps every conversation, every
message, the measured response latency, the classified topic, and the user's evaluation of
each reply, then turns that stored data into a set of analytical tables and graphs.

The system is built around three concerns:

- **Conversation** — a streaming chat interface that reconstructs full history on every turn
  and switches between a cloud provider (Google Gemini) and a local provider (Ollama).
- **Evaluation** — a mandatory feedback step after each reply (rating, correctness, length),
  which is what makes the analytics meaningful rather than decorative.
- **Analysis** — classification of each conversation into one of five project domains, session
  phase tracking (start / middle / end), and an analytics module that aggregates accuracy,
  ratings, response times, and topic distribution.

The frontend is a Next.js application, the backend is a Flask service, and persistence and
authentication are handled by Supabase (PostgreSQL with Row-Level Security).

---

<div align="center"><img alt="Architecture" src="https://img.shields.io/badge/Architecture-6E40C9?style=for-the-badge" /></div>

## Architecture

```
                         +-----------------------------+
                         |          Browser            |
                         |  Next.js UI (App Router)    |
                         +--------------+--------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
    +---------------------------+                 +-----------------------------+
    |  Next.js Edge API routes  |                 |  Supabase (PostgreSQL)      |
    |  /api/chat   (streaming)  |                 |  Auth + Row-Level Security  |
    |  /api/chat/topic          |                 |  chats, messages, feedback, |
    |  /api/analytics           |                 |  domains, analytics_summary |
    |  /api/analytics/summary   |                 +--------------+--------------+
    |  /api/analytics/sessions/ |                                ^
    |  finalize-stale           |                                |
    +-------------+-------------+                                |
                  |                                              |
                  v                                              |
    +---------------------------+                                |
    |   AI provider             |                                |
    |   Gemini (cloud) or       |                                |
    |   Ollama (local)          |                                |
    +---------------------------+                                |
                                                                 |
    +------------------------------------------------------------+
    |  Flask backend (port 5000)                                 |
    |  /api/chat    streaming + topic classification + persistence|
    |  /api/analytics   feedback_processor.py aggregation        |
    |  /health                                                   |
    +------------------------------------------------------------+
```

**Two inference paths.** The primary chat path is the Next.js route `/api/chat` (Vercel AI SDK,
Edge runtime), which streams tokens to the browser. The Flask service exposes its own
independent streaming `/api/chat` on port 5000. The UI drives the Next.js path; the Flask
analytics endpoint is used as a fallback by the analytics hook.

**Who writes what.** The browser persists chats and messages directly to Supabase (subject to
Row-Level Security). Topic classification is persisted once per chat through `/api/chat/topic`.
Session summaries are written through the authenticated finalization endpoint described in the
Session Lifecycle chapter.

---

<div align="center"><img alt="Tech Stack" src="https://img.shields.io/badge/Tech_Stack-0E7490?style=for-the-badge" /></div>

## Tech Stack

| Layer | Technology | Notes |
|:---|:---|:---|
| Frontend framework | Next.js 16 (App Router) + TypeScript 5 | Server and Edge API routes, file-based routing |
| Styling | Tailwind CSS 3, Radix UI, `next-themes` | Dark and light themes, accessible primitives |
| AI SDK | Vercel AI SDK v6 (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`) | `streamText`, Edge-compatible |
| AI providers | Google Gemini (cloud), Ollama (local) | Runtime-selectable per chat |
| Backend | Python 3.10+ / Flask 2.3.3 + `flask-cors` | Streaming chat, analytics, classification |
| Backend tooling | `uv` (dependency + run manager), `pytest` | See `backend/pyproject.toml` |
| Data processing | pandas, numpy, scikit-learn | Analytics aggregation |
| Database | Supabase (PostgreSQL) + PostgREST | Row-Level Security on every user table |
| Authentication | Supabase Auth | Email/password and Google OAuth 2.0 |
| Charts | Recharts 3 | Analytics visualizations |
| Motion | Framer Motion 10 | Transitions and micro-interactions |
| Forms | React Hook Form + Zod | Type-safe validation |
| Markdown / files | react-markdown, mammoth, pdf-parse | Message rendering, PDF/DOCX context |
| Notifications | Sonner | Toast feedback |
| Testing | pytest, Playwright, Node fixture scripts | See the Testing chapter |

---

<div align="center"><img alt="Repository Layout" src="https://img.shields.io/badge/Repository_Layout-57606A?style=for-the-badge" /></div>

## Repository Layout

```
multiturn_chatbot/
├── frontend/                       Next.js 16 application
│   ├── app/
│   │   ├── (auth)/                 Login and signup route group
│   │   ├── (chat)/                 Protected route group
│   │   │   ├── dashboard/          Chat interface
│   │   │   ├── analytics/          Analytics routes: overview, sessions,
│   │   │   │                       sessions/[sessionId], graphs, tables
│   │   │   └── templates/          Domain template browser
│   │   ├── account/                Profile and settings
│   │   └── api/                    Edge API routes (chat, analytics, auth, health)
│   ├── components/                 Chat, analytics, sidebar, feedback, templates, ui
│   ├── context/                    auth-context, chat-context
│   ├── hooks/                      use-dashboard, use-analytics
│   ├── lib/                        Service layer (see key modules below)
│   ├── db/                         Direct Supabase query helpers
│   ├── types/                      Shared TypeScript types
│   ├── scripts/                    Seed + fixture test scripts (Node)
│   ├── supabase/migrations/        11 versioned SQL migrations
│   └── proxy.ts                    Auth proxy / route protection
│
├── backend/                        Flask service
│   ├── app.py                      All Flask routes
│   ├── analytics/scripts/
│   │   ├── topics.py               Canonical topic model (codes, labels, classifier)
│   │   ├── ai_errors.py            Canonical AI error taxonomy
│   │   └── feedback_processor.py   Analytics aggregation engine
│   ├── tests/test_analytics.py     Backend tests
│   └── pyproject.toml              Dependencies (uv)
│
└── shared/                         Cross-stack contracts
    ├── topic-fixtures.json         Topic classification fixtures (TS + Python)
    └── ai-error-fixtures.json      Error classification fixtures (TS + Python)
```

**Key frontend modules**

| Path | Responsibility |
|:---|:---|
| `lib/classify-topic.ts` | Canonical topic codes, labels, and classifier (single source of truth) |
| `lib/ai-errors.ts` | Canonical AI error taxonomy and `classifyAIError` |
| `lib/finalize-session.ts` | The single authenticated session-finalization operation |
| `lib/supabase.ts`, `lib/supabase/` | Browser and SSR Supabase clients |
| `db/chats.ts`, `db/analytics.ts` | Persistence helpers for chats, messages, feedback, domains, summaries |
| `hooks/use-dashboard.ts` | Chat orchestration: send, stream, persist, classify, finalize |

**Key backend modules**

| Path | Responsibility |
|:---|:---|
| `backend/app.py` | Flask routes: health, chat, analytics, templates |
| `backend/analytics/scripts/topics.py` | Topic codes, labels, `classify_topic`, `resolve_topic` |
| `backend/analytics/scripts/ai_errors.py` | Error taxonomy, `classify_exception`, status mapping |
| `backend/analytics/scripts/feedback_processor.py` | Reads Supabase and produces the analytics payload |

---

<div align="center"><img alt="Features" src="https://img.shields.io/badge/Features-1A7F37?style=for-the-badge" /></div>

## Features

**Conversational AI**
- Multi-turn dialogue with full history persisted in Supabase and rebuilt on every request.
- Token-by-token streaming responses.
- Runtime provider switching between Google Gemini and local Ollama, with model selection.
- Document upload (PDF, DOCX) injected as context.
- Automatic chat titling from the first user message.

**Sessions and organisation**
- Persistent sessions restored across reloads.
- Collapsible sidebar with rename and delete.
- Folder grouping for chats.
- Saved prompts and parameter presets.

**Domain templates**
Five specialised assistants, each with a curated system prompt and starter questions:
Machine Learning, Deep Learning, Healthcare AI, Power Systems, and E-commerce AI.

**Feedback (human-in-the-loop)**
- A mandatory feedback panel after each reply: rating (1–4), correctness
  (correct / partial / incorrect), and length preference (short / to the point / lengthy).
- Input is locked until the current reply is evaluated.
- Every evaluation is stored and linked to the exact assistant message it describes.

**Analytics**
- Overview statistics (messages, sessions, average response time, rating distribution).
- Response volume and feedback distribution charts.
- Topic accuracy and accuracy trend charts.
- Six analytical tables (topic accuracy, reply correctness, phase accuracy, response time,
  rating distribution, length preference).
- Seven analytical graphs, including topic distribution and response-time trend.
- Session explorer with per-session detail, phase breakdown, and permanent summary.

---

<div align="center"><img alt="Prerequisites" src="https://img.shields.io/badge/Prerequisites-9A6700?style=for-the-badge" /></div>

## Prerequisites

| Requirement | Version / Note |
|:---|:---|
| Node.js | 18 or newer |
| Python | 3.10 or newer |
| `uv` | Python dependency and run manager |
| Supabase project | Hosted or local; migrations must be applied |
| Google Gemini API key | Required for the default provider |
| Ollama | Optional, only for local models |

---

<div align="center"><img alt="Installation" src="https://img.shields.io/badge/Installation-0B7285?style=for-the-badge" /></div>

## Installation

### Clone

```bash
git clone https://github.com/tecnodeveloper/multiturn_chatbot.git
cd multiturn_chatbot
```

### Frontend

```bash
cd frontend
cp .env.example .env.local     # then fill in the values (see Configuration)
npm install
```

### Backend

```bash
cd backend
uv sync
```

### Database

Apply the migrations in `frontend/supabase/migrations/` to your Supabase project, in filename
order. If you use the Supabase CLI:

```bash
cd frontend
supabase link --project-ref <your-project-ref>
supabase db push
```

Migrations must be applied before first use, otherwise topic persistence and session
finalization will fail against the database enums and constraints (see Database Schema).

### Optional local model

```bash
ollama pull llama3
# Ollama serves on http://127.0.0.1:11434 by default
```

Then select Ollama as the provider in the dashboard.

---

<div align="center"><img alt="Configuration" src="https://img.shields.io/badge/Configuration-953800?style=for-the-badge" /></div>

## Configuration

All environment variables live in `frontend/.env.local`. The Flask backend reads this same file
directly, so no separate backend `.env` is required.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000

# AI providers
GEMINI_API_KEY=your_gemini_api_key
OLLAMA_URL=http://127.0.0.1:11434/v1

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
```

| Variable | Scope | Purpose |
|:---|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key (safe for the browser; RLS applies) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Bypasses RLS; used only for admin and seeding operations |
| `NEXT_PUBLIC_APP_URL` | Public | Base URL used for OAuth redirects |
| `NEXT_PUBLIC_API_URL` | Public | Flask backend base URL (analytics fallback and health) |
| `GEMINI_API_KEY` | Server only | Default AI provider key |
| `OLLAMA_URL` | Server only | Local Ollama endpoint (OpenAI-compatible) |
| `FLASK_DEBUG` | Server only | Flask debug mode; defaults to `false`. Set `true` only for local debugging |
| `PORT` | Server only | Flask port; defaults to `5000` |

**Security rule.** Never prefix a provider key with `NEXT_PUBLIC_`. Anything with that prefix is
inlined into the client bundle. Provider keys must be `GEMINI_API_KEY` (server-side) only.

---

<div align="center"><img alt="Running the Project" src="https://img.shields.io/badge/Running_the_Project-116329?style=for-the-badge" /></div>

## Running the Project

Open two terminals.

**Terminal 1 — frontend**

```bash
cd frontend
npm run dev
# http://localhost:3000
```

**Terminal 2 — backend**

```bash
cd backend
uv run python app.py
# http://localhost:5000
```

The application runs with only the frontend and Supabase for core chat and analytics; the Flask
service provides the Python analytics aggregation and the independent backend chat path.

---

<div align="center"><img alt="Scripts" src="https://img.shields.io/badge/Scripts-4C4F56?style=for-the-badge" /></div>

## Scripts

**Frontend (npm)**

```bash
npm run dev            # Development server (http://localhost:3000)
npm run build          # Production build
npm run start          # Production server
npm run lint           # ESLint
npm run lint:fix       # ESLint autofix
npm run type-check     # tsc --noEmit
npm run format:write   # Prettier write
npm run format:check   # Prettier check
```

**Frontend (Node scripts in `frontend/scripts/`)**

```bash
node scripts/seed-analytics.mjs          # Seed demo analytics data for a test user
node scripts/test-topic-fixtures.mjs     # Assert TS classifier against shared/topic-fixtures.json
node scripts/test-ai-error-fixtures.mjs  # Assert TS taxonomy against shared/ai-error-fixtures.json
node scripts/test-analytics-pipeline.mjs # Analytics pipeline smoke test
```

**Backend**

```bash
uv sync                        # Install or sync dependencies
uv run python app.py           # Run the Flask server
uv run python -m pytest tests/ # Run backend tests
```

---

<div align="center"><img alt="API Reference" src="https://img.shields.io/badge/API_Reference-0969DA?style=for-the-badge" /></div>

## API Reference

### Frontend pages (port 3000)

| Route | Description |
|:---|:---|
| `/` | Redirects to `/login` or `/dashboard` |
| `/login`, `/signup` | Authentication pages |
| `/dashboard` | Chat interface (protected) |
| `/analytics` | Analytics dashboard (protected) |
| `/analytics/overview` | Overview statistics |
| `/analytics/sessions` | Session explorer |
| `/analytics/sessions/[sessionId]` | Single session detail and finalization |
| `/analytics/graphs` | Analytical graphs |
| `/analytics/tables` | Analytical tables |
| `/templates` | Domain template browser (protected) |
| `/account` | Profile and settings (protected) |

### Frontend API routes (port 3000)

| Route | Method | Description |
|:---|:---|:---|
| `/api/chat` | POST | Streaming AI completion (Edge runtime) |
| `/api/chat/topic` | POST | Classify a chat's topic and persist one `domains` row |
| `/api/analytics` | GET | Aggregated analytics payload |
| `/api/analytics/summary` | GET | Fetch a saved session summary |
| `/api/analytics/summary` | POST | Finalize a session (authenticated) |
| `/api/analytics/sessions/finalize-stale` | POST | Finalize the user's stale eligible sessions |
| `/api/auth/login` | POST | Email/password sign-in |
| `/api/auth/signup` | POST | Registration |
| `/api/auth/google` | POST | Begin Google OAuth |
| `/api/auth/callback` | GET | OAuth redirect handler |
| `/api/auth/logout` | POST | Sign out |
| `/api/health` | GET | Frontend health check |

### Backend routes (port 5000)

| Route | Method | Description |
|:---|:---|:---|
| `/` | GET | Server info string |
| `/health`, `/api/health` | GET | API, analytics module, and database connectivity |
| `/api/chat` | POST | Streaming Gemini inference with topic classification and persistence |
| `/api/analytics` | GET | Analytics aggregation via `feedback_processor.py` |
| `/api/templates` | GET | Returns the five domain template identifiers |

---

<div align="center"><img alt="Database Schema" src="https://img.shields.io/badge/Database_Schema-336791?style=for-the-badge" /></div>

## Database Schema

Managed by **11 versioned migrations** in `frontend/supabase/migrations/`.

| Table | Purpose |
|:---|:---|
| `profiles` | User profile (display name, avatar, bio, auth provider) |
| `chats` | Chat sessions (title, user, timestamps) |
| `messages` | Messages with `role`, `content`, `response_time`, `session_phase`, `domain_id` |
| `feedback` | Evaluations with `rating`, `correctness`, `length_type`, `comment`, `message_id` |
| `domains` | One row per chat holding the classified `category` (unique `chat_id`) |
| `analytics_summary` | Permanent per-chat summary (`summary_data` JSONB, unique `chat_id`) |
| `folders` | Chat folder grouping |
| `prompts` | Saved reusable prompts |
| `presets` | Parameter presets |
| `files` | Uploaded file records |

**Enums**

| Type | Values |
|:---|:---|
| `auth_provider_type` | `email`, `google` |
| `session_phase_type` | `start`, `middle`, `end` |
| `domain_category_type` | `MachineLearning`, `DeepLearning`, `HealthcareAI`, `PowerSystems`, `E-commerceAI`, `Other` |

**Migration order matters.** The canonical-code migration renames the domain enum values and adds
`Other`; a later migration adds a unique constraint on `domains.chat_id`. Apply them in filename
order. Every user-owned table has Row-Level Security enabled, with ownership verified through the
owning `chats` row.

---

<div align="center"><img alt="Topic Classification" src="https://img.shields.io/badge/Topic_Classification-8250DF?style=for-the-badge" /></div>

## Topic Classification

A single canonical model is shared by the TypeScript and Python stacks. The definitions live in
`frontend/lib/classify-topic.ts` and `backend/analytics/scripts/topics.py`, and both are held to
the same contract by `shared/topic-fixtures.json`.

**Canonical codes and display labels**

| Code | Label | Example keywords |
|:---|:---|:---|
| `MachineLearning` | Machine Learning | regression, classification, clustering, svm, dataset |
| `DeepLearning` | Deep Learning | cnn, rnn, transformer, pytorch, neural |
| `HealthcareAI` | Healthcare AI | medical, clinical, patient, hospital, healthcare |
| `PowerSystems` | Power Systems | grid, voltage, energy, solar, battery, power |
| `E-commerceAI` | E-commerce AI | product, cart, recommend, retail, e-commerce |
| `Other` | Other | short, ambiguous, or off-topic messages |

**Rules**

- Classification is deterministic keyword matching against a single ordered rule set (deep
  learning is tested before machine learning so specific terms win).
- Messages shorter than 6 characters classify as `Other`.
- The classifier returns a canonical code; the display label is derived from one mapping table.
- The Flask backend layers an optional Gemini fallback on top of the same heuristics, but the
  codes it emits are identical.

**Persistence.** A chat's topic is stored once, as a single `domains` row keyed by `chat_id`. The
analytics read path uses the stored code and falls back to classifying the message text only for
legacy chats without a stored row.

---

<div align="center"><img alt="Session Lifecycle" src="https://img.shields.io/badge/Session_Lifecycle-A371F7?style=for-the-badge" /></div>

## Session Lifecycle

A session progresses through three phases, computed from turn count and stored on each message:

| Phase | Turn range |
|:---|:---|
| `start` | Turns 1–2 |
| `middle` | Turns 3–5 |
| `end` | Turns 6+ |

**Finalization** permanently records a session's performance summary as a single
`analytics_summary` row. It is an authenticated server operation implemented once in
`frontend/lib/finalize-session.ts` and used by every trigger:

1. The user's explicit **End and Finalize Session** action in the session detail view.
2. A server-side safety net (`/api/analytics/sessions/finalize-stale`) that finalizes the user's
   completed-but-unsummarized sessions when a new chat is created.

Properties of the operation:

- It authenticates the caller from the request session and verifies chat ownership
  (401 when unauthenticated, 403 when the chat belongs to another user, 404 when absent).
- It refuses to finalize unless the latest assistant reply has been evaluated, unless the caller
  explicitly allows a partial evaluation.
- It is idempotent: one row per chat, upserted on `chat_id`, so repeated finalization does not
  create duplicates.

Finalization is deliberately **not** hooked to logout. Logout is client-initiated and skippable
(tab close, token expiry), so it is not a reliable boundary for "session end".

---

<div align="center"><img alt="Error Handling" src="https://img.shields.io/badge/Error_Handling-CF222E?style=for-the-badge" /></div>

## Error Handling

Provider failures are classified into one canonical taxonomy rather than being flattened into
arbitrary codes. The definitions live in `frontend/lib/ai-errors.ts` and
`backend/analytics/scripts/ai_errors.py`, verified against `shared/ai-error-fixtures.json`.

| Kind | Code | Retryable | Condition |
|:---|:---|:---|:---|
| `MISCONFIG` | 500 | no | Missing or invalid API key; provider 401/403 |
| `MODEL_NOT_FOUND` | 404 | no | Provider returned 404 or the model is absent |
| `BAD_REQUEST` | 400 | no | Provider returned 400 or 422 |
| `RATE_LIMIT` | 429 | yes | Provider returned 429 |
| `OVERLOADED` | 503 | yes | Provider returned 503 or 529 |
| `TIMEOUT` | 504 | yes | Request or response timed out |
| `NETWORK` | 502 | yes | Connection or DNS failure before reaching the provider |
| `UPSTREAM_5XX` | 502 | yes | Any other provider 5xx |
| `UNKNOWN` | 500 | no | Anything unclassified |

Failures are represented as data (`kind`, `code`, `message`, `retryable`), not as prose, and the
UI detects errors from that structured field rather than by searching message text.

---

<div align="center"><img alt="Authentication" src="https://img.shields.io/badge/Authentication-BF3989?style=for-the-badge" /></div>

## Authentication

```
User -> /login -> Supabase Auth
                    |-- Email / password -----> JWT session cookie --+
                    +-- Google OAuth --------> /api/auth/callback ---+--> /dashboard
```

- **Supabase Auth** handles email/password and Google OAuth; `@supabase/ssr` manages server-side
  session cookies, and `proxy.ts` protects authenticated routes.
- **Row-Level Security** is enabled on every user-owned table. Policies grant access only when the
  owning `chats` row belongs to `auth.uid()`.
- **Server API routes** authenticate the caller from the request session and verify ownership
  before writing; they do not trust a user identifier supplied in the request.
- **Secrets** are server-only. The service-role key is never exposed to the browser, and provider
  keys must not use the `NEXT_PUBLIC_` prefix.

---

<div align="center"><img alt="Analytics" src="https://img.shields.io/badge/Analytics-1F883D?style=for-the-badge" /></div>

## Analytics

```
User feedback + messages + stored domain code   (Supabase)
        |
        v
/api/analytics        ->  Next.js aggregation route (primary)
   or
/api/analytics (Flask) ->  feedback_processor.py (fallback)
        |
        v
Analytics dashboard: overview, tables, graphs, sessions
```

The aggregation produces, from genuine stored data only (no synthetic rows):

- Rating distribution (1–4), correctness breakdown, and length preference.
- Topic distribution and per-topic accuracy, computed over all feedback records.
- Phase-wise accuracy across start, middle, and end.
- Response-time summary (minimum, maximum, average, median) and a chronological trend.
- Six analytical tables and seven analytical graphs, plus a session explorer.
- Per-session permanent summaries after finalization.

Both the Next.js route and the Python processor compute these metrics independently; they read
the same tables and the same canonical topic codes.

---

<div align="center"><img alt="Testing" src="https://img.shields.io/badge/Testing-6E7781?style=for-the-badge" /></div>

## Testing

```bash
# Backend tests (includes topic classification and error taxonomy fixtures)
cd backend
uv run python -m pytest tests/ -v

# Cross-stack contract fixtures
cd frontend
node scripts/test-topic-fixtures.mjs
node scripts/test-ai-error-fixtures.mjs

# Type checking
cd frontend
npm run type-check

# End-to-end (Playwright)
cd frontend
npx playwright test
```

The fixture scripts assert that the TypeScript and Python implementations agree on the same
inputs, so the two stacks cannot silently drift.

---

<div align="center"><img alt="Troubleshooting" src="https://img.shields.io/badge/Troubleshooting-D1242F?style=for-the-badge" /></div>

## Troubleshooting

| Symptom | Cause | Resolution |
|:---|:---|:---|
| Analytics page shows an offline state | Flask backend not running or unreachable | Start the backend and confirm `NEXT_PUBLIC_API_URL` |
| Topic or finalization writes fail | Migrations not applied | Apply all migrations in `frontend/supabase/migrations/` in order |
| `invalid input value for enum` on domains | Enum migration missing | Run the canonical domain enum migration |
| AI failures show an unexpected code | Expected | Errors are classified by kind (see Error Handling), not by prose |
| Ollama provider errors | No local Ollama instance | Start Ollama and confirm `OLLAMA_URL` |
| Auth redirect loop | Missing or stale session cookie | Clear site cookies and sign in again |
| Backend cannot reach the database | Credentials not in `frontend/.env.local` | The backend reads the frontend env file directly |

---

<div align="center"><img alt="For AI Agents" src="https://img.shields.io/badge/For_AI_Agents-24292F?style=for-the-badge" /></div>

## For AI Agents

This section is a compact, machine-readable summary for agents working on this repository.

**What this is.** A decoupled multi-turn LLM chatbot: Next.js frontend, Flask backend, Supabase
persistence with Row-Level Security, streaming responses, mandatory per-reply feedback, topic
classification, session phase tracking, and an analytics module with tables and graphs.

**JSON summary**

```json
{
  "name": "multiturn-chatbot",
  "frontend": { "framework": "next", "version": "16.2.6", "lang": "typescript", "port": 3000 },
  "backend": { "framework": "flask", "version": "2.3.3", "lang": "python", "port": 5000, "pm": "uv" },
  "database": { "provider": "supabase", "engine": "postgres", "rls": true },
  "ai": { "default_provider": "gemini", "alt_provider": "ollama" },
  "enums": {
    "session_phase_type": ["start", "middle", "end"],
    "domain_category_type": ["MachineLearning", "DeepLearning", "HealthcareAI", "PowerSystems", "E-commerceAI", "Other"]
  },
  "canonical_modules": {
    "topic_ts": "frontend/lib/classify-topic.ts",
    "topic_py": "backend/analytics/scripts/topics.py",
    "errors_ts": "frontend/lib/ai-errors.ts",
    "errors_py": "backend/analytics/scripts/ai_errors.py",
    "finalize": "frontend/lib/finalize-session.ts"
  },
  "contracts": ["shared/topic-fixtures.json", "shared/ai-error-fixtures.json"]
}
```

**Commands**

```bash
cd frontend && npm install && npm run dev        # UI on :3000
cd frontend && npm run type-check                # type check
cd frontend && npm run build                     # build
cd backend  && uv sync && uv run python app.py   # API on :5000
cd backend  && uv run python -m pytest tests/     # backend tests
```

**Conventions and invariants**

- Topic codes are canonical and come only from `lib/classify-topic.ts` (TS) and `topics.py`
  (Python). Never introduce a new topic string. Display labels derive from one mapping table.
- AI failures are classified only through `lib/ai-errors.ts` / `ai_errors.py`. Do not fabricate
  HTTP codes or match on error text.
- Session finalization goes through `lib/finalize-session.ts`. It is authenticated, ownership
  checked, and idempotent on `chat_id`.
- One `domains` row per chat (unique `chat_id`); one `analytics_summary` row per chat.
- Never place a provider key behind a `NEXT_PUBLIC_` variable.
- All user tables enforce Row-Level Security. Write through clients that respect it, and verify
  ownership server-side before any service-role write.
- Change the database only through new, ordered migration files.
- The Flask backend reads `frontend/.env.local`; there is no backend `.env`.

---

<div align="center"><img alt="Credits" src="https://img.shields.io/badge/Credits-6E40C9?style=for-the-badge" /></div>

## Credits

A final year project by `tecnodeveloper`.

Built with Next.js, TypeScript, Tailwind CSS, Flask, Python, and Supabase, using the Vercel AI
SDK, Recharts, and Radix UI.
