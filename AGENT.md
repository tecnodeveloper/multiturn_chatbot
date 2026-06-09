an# Project Overview

## Project Name

Multi-Turn AI Chatbot with LLaMA 3

## Domain

Artificial Intelligence / Natural Language Processing / Conversational AI

## Goal

Build a multi-turn AI chatbot system with:

- Google OAuth authentication
- Real-time AI chat
- Session management
- Feedback collection
- Analytics dashboard
- PostgreSQL database
- OpenRouter/Groq API integration

This project is focused on Phase 1 implementation and functional development.

---

# Current Architecture

## Frontend

- Next.js
- React
- Tailwind CSS

## Backend

- Python
- Flask / FastAPI
- UV for package management

## Database

- Supabase (PostgreSQL hosted)

## AI Integration

- OpenRouter API OR Groq API
- LLaMA 3 model

## Authentication

- Google OAuth 2.0

---

# Build and Run Commands

## Frontend

### Install Dependencies

```bash
cd frontend
npm install
```

### Phase 1

1. Setup Next.js frontend
2. Setup FastAPI backend
3. Setup PostgreSQL connection
4. Implement Google OAuth
5. Create chat UI
6. Integrate AI API
7. Store chat history
8. Implement session management
9. Add feedback system

# IMPORTANT RULES

## Rule 1: Do NOT Create Unnecessary Files

- Never create extra markdown files.
- Never create duplicate components.
- Never create temp files.
- Never create multiple config files for same purpose.
- Only create files if absolutely necessary.

# Project Stacks

Build Phase 1 of a multi-turn AI chatbot system using:

- Next.js 16.2.6 (stable) frontend
- FastAPI/Flask backend
- Supabase (PostgreSQL hosted) database
- Google OAuth via Supabase Auth
- OpenRouter/Groq API for LLaMA 3 inference
- Analytics + feedback system
  project-root/
  │
  ├── frontend/ # Next.js frontend
  │ ├── app/
  │ │ ├── (auth)/
  │ │ ├── dashboard/
  │ │ ├── chat/
  │ │ └── api/
  │ │
  │ ├── components/
  │ │ ├── ui/
  │ │ ├── chat/
  │ │ ├── auth/
  │ │ └── feedback/
  │ │
  │ ├── hooks/
  │ ├── lib/
  │ ├── services/
  │ ├── store/
  │ ├── styles/
  │ ├── types/
  │ ├── public/
  │ ├── middleware.ts
  │ ├── tailwind.config.ts
  │ └── package.json
  │
  ├── backend/ # Python backend
  │ ├── app.py
  │ ├── pyproject.toml
  │ ├── uv.lock
  │ └── analytics/
  │
  ├── database/
  │ ├── migrations/
  │ ├── seeds/
  │ └── schema.sql
  │
  ├── docs/
  │ ├── diagrams/
  │ └── api/
  │
  ├── .github/
  │ └── workflows/
  │
  ├── README.md
  ├── AGENT.md
  ├── .gitignore
  └── docker-compose.yml

---

# Phase 2-3 IMPLEMENTATION STATUS

## Build & Dependencies (May 24, 2026)

### COMPLETED

**Frontend Setup:**

- Next.js 16.2.6 build successful (Turbopack)
- TypeScript strict mode fully passing
- All 580 npm packages installed
- Dev server running on localhost:3000

**UI Components (8 components):**

- Button (6 variants)
- Input, Label, Dialog, Avatar
- Dropdown Menu, Sonner Toast
- MultiTurn AI Brand component

**Authentication Pages:**

- /login - Google OAuth + email/password form
- /signup - Google OAuth registration form
- /api/auth/google - OAuth initiation route
- /api/auth/callback - OAuth callback handler

**Utilities & Config:**

- Supabase SSR client (server + browser)
- Auth helper functions
- Tailwind CSS with MultiTurn AI blue (#0055FF)
- Dark/Light mode via next-themes
- TypeScript paths alias (@/\*)
- Root layout with Providers
- Middleware with auth context

**Dependencies Added:**

- Radix UI (11 packages) for accessible components
- @supabase/ssr, @supabase/supabase-js
- next-themes, framer-motion, sonner
- react-hook-form, zod for forms
- class-variance-authority for component variants
- lucide-react for icons
- @radix-ui/react-icons

**Bug Fixes Applied:**

- Fixed missing @radix-ui/react-icons package
- Fixed TypeScript errors in supabase.ts (type annotation for cookiesToSet)
- Fixed NextResponse import in middleware.ts
- All TypeScript strict mode errors resolved

**Files Modified:**

- frontend/lib/supabase.ts - Added proper type annotations
- frontend/proxy.ts - Replaced middleware.ts to align with Next.js 16 conventions

### 🔧 Middleware to Proxy Transition & Dashboard Access (June 7, 2026)

#### COMPLETED

- **Renamed `middleware.ts` to `proxy.ts`**: Next.js 16 has deprecated the `middleware.ts` convention in favor of `proxy.ts`.
- **Broke Redirection Loop**: Successfully reached the `/dashboard` page using the "Sledgehammer" token extraction fix in `proxy.ts`.
- **Fixed Dashboard UI Crash**: Resolved a runtime error where `TabsList` was used outside of a `Tabs` parent in `sidebar-switcher.tsx`.
- **Supabase URL Standardization**: Standardized `NEXT_PUBLIC_SUPABASE_URL` to `http://127.0.0.1:54321` in `.env.local` to prevent cookie naming mismatches.
- **Hard Redirection & Cookie Hardening**: Implemented global `path: "/"` and `secure: false` (for local) to ensure session persistence.
- **Environment Cleanup**: Removed the redundant `.env.local` from the root directory; all configuration is now centralized in `frontend/.env.local`.

#### ❗ IMPORTANT RULES

- **NEVER write `middleware.ts`**: The project has shifted 100% to `proxy.ts`. Next.js will ignore `middleware.ts` or throw deprecation errors.
- **Always use `127.0.0.1` for local Supabase**: Never use `localhost` in the Supabase URL to avoid "Ghost Cookie" session mismatches.
- **Nest Tabs Components correctly**: Always ensure `TabsList` and `TabsTrigger` are wrapped in a `Tabs` root.

#### Files Modified

- `frontend/proxy.ts`
- `frontend/components/sidebar/sidebar-switcher.tsx`
- `frontend/lib/supabase/route.ts`
- `frontend/app/(auth)/login/page.tsx`
- `.env.local` (Deleted)

### 🔧 Diagnostic Hardening & Cookie Path Fix (June 7, 2026 - Session 7)

#### COMPLETED

- **Resolved "Cookie Path Trap"**: Forced `path: "/"` for all cookies in both `proxy.ts` and auth API routes. This prevents the browser from locking session cookies to specific sub-folders and ensures they are sent with dashboard requests.
- **TypeScript Type Hardening**: Added explicit types for `cookiesToSet` in all `setAll` handlers to satisfy VS Code and prevent "implicit any" errors.
- **Localhost Persistence Fix**: Forced `secure: false` and `sameSite: 'lax'` for local development (`127.0.0.1`/`localhost`) to ensure browsers correctly save tokens over insecure HTTP connections.
- **Diagnostic Proxy Implementation**: Added aggressive logging (`[PROXY TRACKER]`) to trace incoming requests, cookie visibility, and server-side auth failures.
- **Redirection Race Condition Fix**: Added a 100ms buffer in `login/page.tsx` to allow the browser to physically write cookies to disk before the final redirect to `/dashboard`.

#### ❗ IMPORTANT RULES

- **NEVER write `middleware.ts`**: Standardized on `proxy.ts` for Next.js 16 compatibility.
- **Always Force Global Cookie Path**: Every `response.cookies.set` call MUST include `path: "/"`.
- **Local Dev Standard**: Always use `http://127.0.0.1:54321` for local Supabase URLs in `.env.local`.

#### Files Modified

- `frontend/proxy.ts`
- `frontend/lib/supabase/route.ts`
- `frontend/app/api/auth/login/route.ts`
- `frontend/app/(auth)/login/page.tsx`

### 🔧 Multi-Provider Model Synchronization & API Keys (June 7, 2026 - Session 8)

#### COMPLETED

- **Fixed Model-Provider Mismatch**: Resolved issues where Ollama and OpenRouter would fail because they were receiving Groq-specific model IDs.
- **Frontend Sync Logic**: Updated `ChatUI` to automatically reset the `selectedModel` to the first valid model whenever the `selectedProvider` is changed.
- **Backend Model Recovery**: Hardened the `/api/chat` route to detect and ignore incompatible model IDs from other providers, automatically falling back to valid defaults.
- **API Key Integration**:
  - Integrated **Groq** API key.
  - Integrated **OpenRouter** API key (updated with new key).
  - Configured **Ollama** local URL (`http://127.0.0.1:11434/v1`).
- **Environment Consistency**: Standardized `OLLAMA_URL` usage in the backend to ensure reliable local connections.

#### ❗ IMPORTANT RULES

- **Provider Changes must trigger Model Changes**: Always ensure the `selectedModel` state is updated when `selectedProvider` changes to prevent API 404/400 errors.
- **Backend Model Validation**: The chat API route should always validate that the requested model ID is compatible with the selected provider before making the upstream call.

#### Files Modified

- `frontend/components/chat/chat-ui.tsx`
- `frontend/app/api/chat/route.ts`
- `frontend/.env.local` (Added/Updated Groq, OpenRouter, and Ollama keys)

### 🔧 Auth Route Cleanup (May 24, 2026)

#### COMPLETED

- Removed duplicate session checks from `frontend/app/(auth)/layout.tsx` and `frontend/app/(chat)/layout.tsx`
- Simplified `frontend/app/page.tsx` to rely on middleware for root routing
- Deleted the redundant redirect-only `frontend/app/(chat)/page.tsx`
- Consolidated route protection to avoid dashboard reload loops in `npm run dev`

#### Files Modified

- `frontend/app/(auth)/layout.tsx`
- `frontend/app/(chat)/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/app/(chat)/page.tsx`

### Key Metrics

- **TypeScript Errors**: 0
- **Build Time**: 4.8s
- **Package Vulnerabilities**: 7 (to be addressed)
- **Dev Server Status**: Running

### 🔧 Final Project Cleanup & Auth Flow Debugging (June 9, 2026)

#### COMPLETED

- **Resolved Authentication Stall**: Debugged an issue where the application would get stuck on the "Signing in..." state. The fix involved removing a blocking `await` from the `fetchUserProfile` call inside the `onAuthStateChange` listener in `auth-context.tsx`. This ensures the UI updates immediately based on the session state without waiting for a potentially slow database query.
- **Fixed Dashboard Build Error**: Removed accidental placeholder characters (`...`) that were causing an "Expression expected" syntax error during the build of `dashboard/page.tsx`.
- **Cleaned Console Warnings**: Fixed an aspect ratio warning in the `Brand` component by removing redundant inline styles that conflicted with Next.js `Image` optimizations.
- **Submission Preparation**: Removed all verbose debug logging (`console.log`, `logger.info`, `logger.warn`) across the frontend codebase to ensure a clean console output for the final submission. Error logs (`console.error`) were retained for critical failure points. The `pino` logger package was kept installed for potential future use in v2.
- **Project Structure Reorganization**: Moved `app.py`, `pyproject.toml`, `uv.lock`, and the `analytics` folder from the project root into a dedicated `backend/` directory to strictly align with the planned architecture. Updated `README.md` with explicit instructions on how to install and run the Python backend from the `backend/` directory.

#### Files Modified

- `frontend/context/auth-context.tsx`
- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/signup/page.tsx`
- `frontend/app/(chat)/dashboard/page.tsx`
- `frontend/app/api/auth/login/route.ts`
- `frontend/app/api/chat/route.ts`
- `frontend/components/ui/brand.tsx`
- `frontend/lib/auth.ts`
- `frontend/lib/consume-stream.ts`
- `frontend/proxy.ts`
- `frontend/hooks/use-dashboard.ts`
- `/` (Moved `app.py`, `pyproject.toml`, `uv.lock`, `analytics` to `backend/`)
- `README.md`
- `AGENT.md`

### 🔧 Project Structure Reorganization & Cleanup (June 9, 2026)

#### COMPLETED

- **Root Directory Cleanup**: Removed stray `node_modules` and moved `.venv` (virtual environment) into the `backend/` directory to adhere strictly to the project architecture.
- **Supabase Folder Cleanup**: Deleted the unused, empty `supabase/` folder from the root directory to avoid confusion with the actual active `frontend/supabase/` configuration.
- **Documentation Updates**: Removed all emoji tick signs from the project documentation to ensure a clean and professional presentation. Added final structural cleanup summary to `AGENT.md`.
