# Google OAuth 2.0 User Authentication and Profile Management

- Status: accepted
- Deciders: Project Team, Lead Architect
- Date: 2026-08-02

Technical Story: Implementing Google OAuth 2.0 user authentication via Supabase Auth and syncing user profiles (FR2 & FR6).

## Context and Problem Statement

How should the system authenticate users securely and retrieve/manage user profile information across session loads?

## Decision Drivers

- Requirement for Google OAuth login capability specified in FR2 and FR6.
- Strict authentication requirement: Users must log in before creating or accessing any chat sessions.
- Seamless profile record creation and authorization checks.

## Considered Options

- Option 1: Custom JWT / Auth system built from scratch
- Option 2: Supabase Auth with Google OAuth 2.0 integration and custom `profiles` table sync (Chosen)

## Decision Outcome

Chosen option: "Option 2: Supabase Auth with Google OAuth 2.0 integration", because Supabase handles Google OAuth 2.0 flows securely via `@supabase/ssr`, and automatically creates/retrieves user profile records linked to `auth.users(id)` in PostgreSQL.

### Positive Consequences

- Secure, enterprise-grade Google OAuth 2.0 login flow.
- Seamless session cookie handling across Next.js 16 App Router and API routes.
- Strict access control preventing unauthenticated users from using the chatbot.

### Negative Consequences

- Requires configuring Google Cloud Console OAuth 2.0 credentials and Supabase redirect URLs.

## Pros and Cons of the Options

### Option 1: Custom JWT / Auth system built from scratch

- Good, because total manual control.
- Bad, because high maintenance, security risks, and extra complexity.

### Option 2: Supabase Auth with Google OAuth 2.0 integration

- Good, because native SSR integration with Next.js 16.
- Good, because strictly satisfies FR2 and FR6 authentication requirements.

## Links

- Relates to [ADR-0001](ADR-0001-hybrid-dual-backend-architecture.md)
- Relates to [ADR-0003](ADR-0003-supabase-relational-database-schema.md)
