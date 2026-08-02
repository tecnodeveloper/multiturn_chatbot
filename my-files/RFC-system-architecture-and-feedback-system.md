# RFC: Multi-Turn AI Chatbot Architecture & Feedback System

| Header Field | Value |
| :--- | :--- |
| **Authors:** | Project Engineering Team |
| **To be reviewed by:** | Lead Architect & Project Supervisor |
| **Revisit Date:** | 2026-08-15 |
| **State:** | Approved / Ready for Implementation |

---

## Need

In modern conversational AI systems, building a reliable, dynamic multi-turn chatbot requires more than simply calling an LLM API. Standard chatbot implementations frequently suffer from loss of context memory across long sessions, inconsistent quality control, uncollected user feedback, and lack of real-time operational analytics.

Currently, Phase 1 and Phase 2 require constructing a **Multi-Turn AI Chatbot System** powered by **LLaMA 3.3 70B** that maintains multi-turn conversation context across session re-logins, tracks model response times (Float in seconds), and enforces a **mandatory 3-point feedback mechanism** (Rating 1–4, Correctness, Length Type) after every single assistant response before unlocking user text inputs (FR12, FR13).

Moreover, Phase 3 demands dynamic session phase segmentation (`start`, `middle`, `end`), domain topic classification (Machine Learning, Deep Learning, Healthcare AI, Power Systems, E-commerce AI), and graphical analytics dashboards.

Without a structured Request for Comments (RFC), there is potential ambiguity regarding backend runtime split, model inference hosting, schema constraints, and feedback workflow execution.

In summary, we need a clear and explicit architectural RFC that outlines the system needs, chosen technical approach, and operational execution plan.

---

## Approach

The recommended approach to fulfill all project requirements across Phase 1, Phase 2, and Phase 3 is a **Hybrid Dual-Backend Architecture** using **Next.js 16**, **Groq Cloud API**, **Supabase (PostgreSQL)**, and a **Python Flask Microservice**:

1. **Next.js 16 Web Application & API Layer (Port 3000)**:
   - Serves modern web chat interface and administrative dashboard.
   - Handles Google OAuth 2.0 authentication and session state via `@supabase/ssr`.
   - Executes chat completion requests via `/api/chat` using Groq API (`llama-3.3-70b-versatile`) due to local hardware constraints.
   - Enforces mandatory input-freezing logic until feedback submission.

2. **Supabase PostgreSQL Relational Database**:
   - Manages relational tables for `profiles`, `chats`, `messages`, and `feedback`.
   - Links feedback directly per assistant message (`message_id FK`).
   - Stores `response_time` (Float in seconds), `topic_label`, and dynamic `session_phase`.

3. **Standalone Python Flask Analytics Microservice (Port 5000)**:
   - Exposes REST API endpoints (`/api/analytics`) on a separate terminal process.
   - Leverages the Python ML stack (`pandas`, `scikit-learn`) for domain classification, session segmentation metrics, and analytics generation.

---

## Detailed Implementation Breakdown

### 1. Model Inference Strategy (Groq API)
Due to limited local hardware resources unable to run LLaMA 3 locally via Ollama, inference is offloaded to Groq's LPU infrastructure running `llama-3.3-70b-versatile`. On every turn, Next.js retrieves full past session history for the active `chat_id` from Supabase and passes it to Groq to maintain complete multi-turn conversational memory.

### 2. Mandatory Feedback & Input Control Mechanism (FR12, FR13)
- Immediately upon response completion, Next.js disables the chat text area and send button.
- An inline feedback component requires 3 mandatory inputs:
  - **Rating**: Enum `1–4`
  - **Correctness**: Enum (`correct`, `partial`, `Incorrect`)
  - **Length Type**: Enum (`short`, `To the point`, `lengthy`)
- Submitting feedback writes to the `feedback` table and instantly unlocks the chat input.

### 3. Dynamic Session Segmentation & Analytics
- Chat sessions are dynamically divided into Start (~33%), Middle (~34%), and End (~33%) phases based on message sequence.
- The Python Flask microservice processes interaction records from Supabase to serve analytical JSON data to Next.js dashboard charts.

---

## Referenced Decision Records (ADRs)

- **ADR-0001**: Hybrid Dual-Backend Architecture (Next.js 16 + Exposed Python Flask REST API)
- **ADR-0002**: Groq API LLaMA 3.3 70B Model Integration
- **ADR-0003**: Supabase Relational Database Schema Aligned with Project ERD
- **ADR-0004**: Mandatory Per-Response Feedback Collection & Input Control Mechanism
- **ADR-0005**: Dynamic Session Segmentation & Full Multi-Turn Context Management
- **ADR-0006**: Tech Stack Migration to Next.js 16
- **ADR-0007**: Context Window Token Limits & Future History Truncation Strategy
- **ADR-0008**: Google OAuth 2.0 User Authentication & Profile Synchronization
