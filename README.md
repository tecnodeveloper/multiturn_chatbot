# Multi-Turn AI Chatbot System with LLaMA 3

## Project Overview

The Multi-Turn AI Chatbot System is an advanced conversational artificial intelligence application designed to deliver context-aware, multi-turn dialogues powered by Meta's LLaMA 3 architecture. The system combines high-performance natural language generation with rigorous user feedback collection, real-time topic classification, latency monitoring, and comprehensive analytical reporting.

The application allows authenticated users to initiate persistent chat sessions, maintain context across multiple turns of conversation, evaluate model output quality through a structured rating system, and inspect detailed visual analytics regarding system performance and topic distribution.

---

## Tech Stack & Architecture Evolution

During development, the core technology stack was upgraded and modernized from initial basic HTML/CSS/monolithic specs to a decoupled enterprise architecture. This transition was undertaken to achieve sub-second model response times, seamless streaming UI components, robust authentication security, and scalable cloud deployment.

### Summary of Tech Stack Upgrades

- Frontend Framework: Upgraded from static HTML/CSS to Next.js 16 (App Router with TypeScript and Tailwind CSS) for server-side rendering, dynamic client state management, and modern component architecture.
- Backend Engine: Developed using Python Flask to provide microservice endpoints for streaming LLaMA 3 inference, response time metrics, and statistical analytics.
- Conversational AI Engine: Integrated Meta LLaMA 3 (LLaMA-3.3-70B-Versatile and LLaMA-3.1-8B-Instant) via the Groq LLaMA Processing Unit (LPU) Cloud API to overcome local hardware constraints while preserving real-time generation speed.
- Database & Security: Migrated to Supabase Cloud (PostgreSQL) incorporating Row-Level Security (RLS) policies and integrated Google OAuth 2.0 authentication.

---

## Component Architecture

The project repository is structured into two primary operational directories:

### 1. Frontend Directory (`frontend/`)
The user interface and web application are contained within the `frontend/` directory, built using Next.js 16. It handles:
- User onboarding, sign-in, and Google OAuth authentication flows.
- Multi-turn conversational user interface with full dynamic chat history rendering.
- Mandatory per-response feedback forms and real-time input locking mechanisms.
- Interactive graphical dashboards presenting feedback distributions, response latency trends, and topic classification breakdown.

### 2. Backend Directory (`backend/`)
The operational server and analytical processing engines are located inside the `backend/` directory, implemented in Python using the Flask micro-framework. It is responsible for:
- Receiving prompt requests from the frontend and assembling conversational memory history.
- Communicating with the Groq API to stream LLaMA 3 completions back to the client.
- Executing real-time topic classification algorithms across primary domain categories (Machine Learning, Deep Learning, Healthcare AI, Power Systems, E-commerce AI, and Other).
- Calculating response latency timestamps (in floating-point seconds) and writing conversation metadata back to the database.
- Running statistical processing routines for feedback analysis.

---

## Key System Features

1. Multi-Turn Conversational Memory: Automatically maintains and passes session history to LLaMA 3, ensuring contextually accurate responses across extended conversations.
2. Real-Time Latency Tracking: Measures exact dispatch and completion timestamps for every assistant response to evaluate inference throughput.
3. Automated Topic Classification: Analyzes user inputs on a turn-by-turn basis to classify chat queries into predefined technical domains using high-speed lightweight inference.
4. Per-Turn Feedback Mechanism: Features a per-turn evaluation modal that collects rating scores (1 to 5 stars), correctness ratings, and length preferences.
5. Graphical Analytics Dashboard: Visualizes feedback trends, domain distribution, and system performance metrics using chart visualizers.
6. Google OAuth Integration: Provides secure single sign-on capabilities backed by Supabase Auth and Google Cloud OAuth credentials.

---

## Environment Variables Configuration

Both the frontend and backend components rely on environment configuration files to maintain security and operational parameters.

### 1. Frontend Environment File (`frontend/.env.local`)

- NEXT_PUBLIC_SUPABASE_URL: The public URL of your Supabase Cloud instance.
- NEXT_PUBLIC_SUPABASE_ANON_KEY: The anonymous public key used for client-side database authentication.
- SUPABASE_SERVICE_ROLE_KEY: The administrative service role key for privileged database queries.
- NEXT_PUBLIC_APP_URL: The base URL of the deployed frontend application (e.g., http://localhost:3000 or Vercel URL).
- NEXT_PUBLIC_API_URL: The HTTP URL pointing to the running Python Flask backend server (e.g., http://localhost:5000 or ngrok tunnel URL).
- GROQ_API_KEY: The authentication API key for accessing Groq LLaMA 3 inference endpoints.
- SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: The OAuth 2.0 Client ID generated in Google Cloud Console.
- SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: The OAuth 2.0 Client Secret generated in Google Cloud Console.

### 2. Backend Environment File (`backend/.env`)

- GROQ_API_KEY: The API key required by the Flask application to execute LLaMA 3 completions via Groq.
- NEXT_PUBLIC_SUPABASE_URL: The database REST endpoint URL for saving messages, topics, and metrics.
- SUPABASE_SERVICE_ROLE_KEY: The secret key allowing the backend to write server logs directly to database tables.

---

## Local Setup and Execution

### Running the Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install node package dependencies: `npm install`
3. Start the Next.js development server: `npm run dev`
4. Access the web interface at `http://localhost:3000`

### Running the Backend
1. Navigate to the backend directory: `cd backend`
2. Install required Python packages: `pip install -r requirements.txt`
3. Launch the Flask API server: `python app.py`
4. The backend service will run on `http://localhost:5000`
