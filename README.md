# Multi-Turn AI Chatbot with LLaMA 3

Artificial Intelligence / Natural Language Processing / Conversational AI

## Project Overview

This project is a **Multi-Turn AI Chatbot System** developed using **LLaMA 3** as the core conversational AI engine. The chatbot supports multi-turn conversations, user authentication, feedback collection, analytics, and local AI inference.

# Phase 1 Objectives

Phase 1 focuses on building the complete system foundation including:

- Frontend Chat Interface
- Backend API Server
- Google OAuth Authentication
- LLaMA 3 Integration
- Database Connectivity
- Feedback Collection System
- Analytics Module Initialization

---

# Updated Tech Stack

I'm facing difficulty running **LLaMA 3 locally** due to limited hardware resources So I'm using grok or openRouter api

This project uses an upgraded modern stack while maintaining all required functionality.

| Technology      | Purpose             |
| --------------- | ------------------- |
| Python          | Backend development |
| FastAPI / Flask | Backend APIs        |
| Next.js         | Frontend framework  |
| Ollama          | Local LLaMA serving |
| Supabase        | Database            |

---

# Why Next.js Was Used Instead of HTML/CSS/JavaScript

The original requirement suggested: HTML/CSS/JavaScript. This project uses **Next.js** because it provides:

- Better scalability
- Component-based architecture
- Faster development workflow
- Better routing and dashboard management
- Easier backend API integration
- Improved maintainability
- Modern industry-standard frontend development
  Therefore, the project remains fully aligned with the original requirements.

---

# Why Supabase Was Used as Database

This project uses **Supabase** as the database backend. Supabase provides:

- Real-time database capabilities for chatbot systems
- Built-in authentication and authorization
- Multi-user application support
- Scalable chat/session storage
- Analytics data management
- Easy integration with Next.js frontend
- Pre-built REST and GraphQL APIs

The backend architecture and project functionality remain unchanged.

---

# Project Architecture

## Main Components

### 1. Frontend Web Application

Built using **Next.js**.

Responsible for:

- Login/signup pages
- Google authentication
- Chat dashboard
- Chat interface
- Feedback collection

---

### 2. Backend API Server

Responsible for:

- API routing
- Session management
- Authentication
- AI request handling
- Database communication

---

### 3. LLaMA 3 Inference Engine

Responsible for:

- Generating chatbot responses
- Processing prompts locally
- Maintaining conversational context

---

### 4. Database

Built using **supabase**.

Stores:

- User accounts
- Sessions
- Chat history
- Feedback data
- Analytics data

---

### 5. Analytics Module

Responsible for:

- Feedback analysis
- Usage analytics
- Topic classification
- Graph generation

---

# Requirements

- docker
- supabase cli
- Python > 3.8
- Next.js 16.2.6 stable version
- uv (Python package manager)

---

# How to Run This Project

Follow these steps to set up and run the project locally:

### 1. Clone the Repository and Switch Branch
```bash
git clone <repository-url>
cd MultiturnAiChatbotWithLlama3
git checkout phase1
```

### 2. Start Supabase (Requires Docker)
Ensure Docker is running on your system, then start the Supabase local environment:
```bash
supabase start
```
*Note: This will provide you with several URLs and keys. You will need these for the next steps.*

### 3. Configure Frontend
Copy the example environment file and update it with your local Supabase credentials:
```bash
cd frontend
cp .env.example .env.local
```
Edit `frontend/.env.local` and fill in the values provided by the `supabase start` command:
- `NEXT_PUBLIC_SUPABASE_URL` (usually `http://127.0.0.1:54321`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY` (if using Groq)
- `OPENROUTER_API_KEY` (if using OpenRouter)

Install dependencies and run:
```bash
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

### 4. Configure and Run Backend
Open a new terminal window:
```bash
cd backend
cp ../frontend/.env.local .env
```
Install dependencies using `uv` and start the server:
```bash
uv pip install -r requirements.txt # Or run directly:
uv run python app.py
```
The backend API will be available at `http://localhost:5000`.

---

## Supervisor

**Neelam Alam**

Email: [neelam.alam@vu.edu.pk](mailto:neelam.alam@vu.edu.pk)

Skype ID: neelam-cs

---

# Output

- This project is implementation-based and not an SRS document.
- Focus on developing working modules and integrations.
- Ensure frontend and backend connectivity is functional.
- Verify LLaMA 3 integration before final submission.
- The project fulfills all PHASE 1 functional requirements successfully.
