# Multi-Turn AI Chatbot System with LLaMA 3

## Project Overview

The Multi-Turn AI Chatbot System is an advanced conversational artificial intelligence application engineered to deliver context-aware, multi-turn dialogues powered by Meta's LLaMA 3 architecture. The system combines high-performance natural language generation with continuous human-in-the-loop feedback collection, real-time topic classification, latency delta monitoring, and a dedicated analytics processing microservice.

The application enables authenticated users to maintain persistent conversational state across multiple dialogue turns, evaluate model response quality via a structured rating taxonomy, switch dynamically between reasoning models, and inspect visual analytics regarding system throughput, domain distribution, and user satisfaction trends.

---

## Summary of Tech Stack Upgrades

The core technology stack was upgraded and modernized from initial basic monolithic specifications into a decoupled enterprise architecture. This modernization was executed to achieve sub-second model response times, streaming client-side hydration, robust authentication security, and scalable execution.

| Subsystem Layer | Original Specification | Upgraded Technical Stack | Architectural Rationale & Technical Advantages |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Static HTML / CSS | **Next.js 16 (App Router + TypeScript)** | Server-side rendering (SSR), hydration efficiency, Edge API middleware, and type-safe component state management. |
| **Backend REST API** | Monolithic Service | **Python Flask (WSGI Microservices)** | Asynchronous event streaming, lightweight WSGI execution, and native integration with Python data processing pipelines. |
| **Conversational AI Engine** | Local Ollama Instance | **Meta LLaMA 3 via Groq Cloud LPU** | Sub-second completion latency via Groq LPU hardware acceleration without local GPU hardware dependencies. |
| **Database & Security** | Local Postgres Instance | **Supabase Cloud (PostgreSQL + RLS)** | PostgREST protocol API, Row-Level Security (RLS) policies, and managed Google OAuth 2.0 single sign-on authentication. |
| **Styling & Theme Engine** | Plain CSS Stylesheets | **Tailwind CSS + Next-Themes** | Dynamic theme tokens, responsive flexbox/grid primitives, dark-mode/light-mode state persistence, and glassmorphism styling. |

---

## Component Architecture & System Modules

The repository is structured into two primary operational sub-modules:

### 1. Frontend Web Module (`frontend/`)
Built with Next.js 16, TypeScript, and Tailwind CSS. It manages:
- Client-side routing, page layouts (`/login`, `/signup`, `/dashboard`, `/analytics`, `/account`, `/projects`).
- Multi-turn conversational user interface with incremental SSE stream processing.
- Input control state locking during generation until feedback submission.
- User authentication state management and profile persistence.

### 2. Backend Microservice Engine (`backend/`)
Implemented in Python using the Flask microservice framework. It manages:
- Session history aggregation and multi-turn prompt context assembly.
- Execution of real-time topic classification using lightweight Groq LLM inference across technical domains (*Machine Learning, Deep Learning, Healthcare AI, Power Systems, E-commerce AI, Other*).
- Precise millisecond-level response latency delta measurement (`response_time`).
- Database interaction via REST API for message logging and statistical metric calculation.

---

## Getting Started & Local Setup Guide

Follow these sequential steps to set up, initialize, and execute the application environment locally.

### Prerequisites
- Node.js version 18.0 or higher
- Python version 3.10 or higher
- npm or yarn package manager

---

### Step 1: Initialize and Run the Frontend Application

Open a terminal window and navigate to the frontend directory:

```bash
cd frontend

# Install Node.js package dependencies
npm install

# Launch the Next.js development server
npm run dev
```

The web application interface will be operational at `http://localhost:3000`.

---

### Step 2: Initialize and Run the Python Backend API

Open a second terminal window to start the primary Python Flask backend service:

```bash
cd backend

# Install Python requirements
pip install -r requirements.txt

# Start the primary Flask API server (Port 5000)
python app.py
```

The primary inference and conversational API will be running on `http://localhost:5000`.

---

### Step 3: Initialize and Run the Analytics Engine Microservice

To process real-time analytics, statistical graphs, and user feedback metrics, launch the analytics microservice in a new terminal:

```bash
cd backend/analytics

# Execute the analytics processing server (Port 5001)
python app.py
```

The analytics processing engine will be operational on `http://localhost:5001`.

---

## Complete Application Endpoints & Routes Reference

### 1. Frontend Page Routes & API Endpoints (Next.js Application - Port 3000)

| Endpoint / Route Name | HTTP Method | URL | Concise Description |
| :--- | :--- | :--- | :--- |
| **Login Page** | `GET` | `http://localhost:3000/login` | User login with email or Google OAuth. |
| **Signup Page** | `GET` | `http://localhost:3000/signup` | New user registration and account creation. |
| **Password Reset** | `GET` | `http://localhost:3000/reset` | Account recovery and password reset page. |
| **Main Dashboard** | `GET` | `http://localhost:3000/dashboard` | Main multi-turn AI chatbot chat interface. |
| **Analytics Dashboard** | `GET` | `http://localhost:3000/analytics` | Visual dashboard for system performance metrics. |
| **Account Settings** | `GET` | `http://localhost:3000/account` | User profile management and preference settings. |
| **Projects View** | `GET` | `http://localhost:3000/projects` | System prompt presets and folder management. |
| **Streaming Chat API** | `POST` | `http://localhost:3000/api/chat` | Streaming AI completion route for chat. |
| **OAuth Callback API** | `GET` | `http://localhost:3000/api/auth/callback` | Google OAuth authentication redirect callback handler. |

---

### 2. Backend Microservice API Endpoints (Python Flask - Port 5000 & 5001)

| Endpoint Name | HTTP Method | URL | Concise Description |
| :--- | :--- | :--- | :--- |
| **Server Health Check** | `GET` | `http://localhost:5000/` | Operational status check for backend server. |
| **Chat & Classifier API** | `POST` | `http://localhost:5000/api/chat` | Streaming inference, topic classification, message logging. |
| **Analytics Engine** | `GET` | `http://localhost:5001/api/analytics` | Aggregates feedback metrics for analytics dashboard. |

---

## Environment Variables Configuration

Both the frontend and backend components rely on environment configuration files to maintain security and operational parameters.

### 1. Frontend Environment File (`frontend/.env.local`)

- NEXT_PUBLIC_SUPABASE_URL: The public URL of your Supabase Cloud instance.
- NEXT_PUBLIC_SUPABASE_ANON_KEY: The anonymous public key used for client-side database authentication.
- SUPABASE_SERVICE_ROLE_KEY: The administrative service role key for privileged database queries.
- NEXT_PUBLIC_APP_URL: The base URL of the running frontend application (http://localhost:3000).
- NEXT_PUBLIC_API_URL: The HTTP URL pointing to the running Python Flask backend server (http://localhost:5000).
- GROQ_API_KEY: The authentication API key for accessing Groq LLaMA 3 inference endpoints.
- SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: The OAuth 2.0 Client ID generated in Google Cloud Console.
- SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: The OAuth 2.0 Client Secret generated in Google Cloud Console.

### 2. Backend Environment File (`backend/.env`)

- GROQ_API_KEY: The API key required by the Flask application to execute LLaMA 3 completions via Groq.
- NEXT_PUBLIC_SUPABASE_URL: The database REST endpoint URL for saving messages, topics, and metrics.
- SUPABASE_SERVICE_ROLE_KEY: The secret key allowing the backend to write server logs directly to database tables.
