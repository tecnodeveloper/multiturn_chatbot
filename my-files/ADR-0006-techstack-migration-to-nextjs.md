# ADR-0006: Tech Stack Migration from Vanilla HTML/CSS/JS to Next.js 16

- Status: accepted
- Deciders: Project Lead / Student Engineer
- Date: 2026-08-02

Technical Story: Transitioning the frontend architecture of the Multi-Turn AI Chatbot from static Vanilla HTML/CSS/JS (originally listed in project requirements) to modern Next.js 16 with React and TypeScript.

## Context and Problem Statement

The initial proposal (`Multi-chatbot using LLama3.pdf`) specified using basic HTML, CSS, and plain JavaScript for building the chatbot frontend interface. 

However, building a multi-turn AI chatbot with Google OAuth authentication, session management, dynamic feedback forms, interactive analytics charts, and server-side rendering required a modern, scalable web framework.

## Decision Drivers

- **Industry Relevance & Internship Alignment**: Aligning the project stack with hands-on experience and industry best practices gained during software house internship working with **Next.js**.
- **Developer Productivity & Experience**: Leverages past project experience building full-stack applications with Next.js, TypeScript, and React components.
- **Modern UI & Authentication Capabilities**: Next.js 16 provides built-in SSR auth integrations (`@supabase/ssr`), server actions/API routes, TypeScript strict safety, and component libraries (Tailwind CSS, Radix UI).
- **Single Deployment Target**: Next.js allows seamless hosting on Vercel with serverless API routes while maintaining clean separation for the Python Flask analytics backend.

## Considered Options

- **Option 1: Vanilla HTML / CSS / JavaScript** (Original PDF proposal).
- **Option 2: React SPA with Vite**.
- **Option 3: Next.js 16 (App Router + TypeScript + Tailwind CSS)** (Chosen).

## Decision Outcome

Chosen option: **Option 3 (Next.js 16)**:
The frontend was upgraded to Next.js 16. This provides standard UI components, native integration with Supabase SSR for Google OAuth, type safety with TypeScript, and seamless connection to Groq API and Python Flask endpoints.

### Positive Consequences

- Significantly faster UI development and component reusability.
- Seamless authentication handling via `@supabase/ssr`.
- Built-in type safety across chat sessions, feedback forms, and analytical charts.
- Direct alignment with current software house internship skillset.
