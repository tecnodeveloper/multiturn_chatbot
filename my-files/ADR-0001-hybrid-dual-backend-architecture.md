# Hybrid Dual-Backend Architecture (Next.js 16 + Exposed Python Flask API)

- Status: accepted
- Deciders: Project Team, Lead Architect
- Date: 2026-08-02

Technical Story: Microservice API communication between Next.js frontend/backend and independent Python Flask backend running in a separate terminal.

## Context and Problem Statement

How should the Next.js frontend/backend interact with the Python Flask analytics microservice running on a separate terminal process?

## Decision Drivers

- Python Flask microservice runs on an independent terminal process (port 5000) and exposes REST API endpoints.
- Next.js acts as the primary web application and proxies/fetches analytics endpoints from Flask when needed.
- Clear decoupling between real-time operational chat (Next.js) and Python ML analytics computations.

## Considered Options

- Option 1: Monolithic Python application
- Option 2: Monolithic Next.js application
- Option 3: Standalone Python Flask API exposed on separate terminal process, connected to Next.js via REST fetch (Chosen)

## Decision Outcome

Chosen option: "Option 3: Standalone Python Flask API connected to Next.js", because the Python backend runs in a separate terminal process exposing REST endpoints (`/api/analytics`), which Next.js calls whenever analytics computations are required for the dashboard.

### Positive Consequences

- Clean microservice interaction: Next.js connects via HTTP REST endpoints directly to the exposed Python Flask API.
- Full access to Python ML libraries (`pandas`, `scikit-learn`) for analytics computation without blocking Next.js UI rendering.

### Negative Consequences

- Requires both terminal processes (`npm run dev` on port 3000 and `python app.py` on port 5000) running concurrently.

## Pros and Cons of the Options

### Option 1: Monolithic Python application

- Good, because single process.
- Bad, because slower UI performance compared to Next.js 16 App Router.

### Option 2: Monolithic Next.js application

- Good, because single process.
- Bad, because lacks native Python ML tools for Phase 3 analytics.

### Option 3: Standalone Python Flask API connected to Next.js

- Good, because Next.js calls exposed Flask REST APIs dynamically whenever analytical data is requested.
- Good, because allows independent development and execution of the Python analytics module.

## Links

- Relates to [ADR-0007](ADR-0007-context-window-limits-and-future-truncation.md)
