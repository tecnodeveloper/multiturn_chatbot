# Supabase Relational Database Schema Alignment with Project ERD

- Status: accepted
- Deciders: Project Team, Lead Architect
- Date: 2026-08-02

Technical Story: Designing the relational PostgreSQL schema in Supabase to strictly align with `MultiTurnAIChatbot-ERD.drawio.png` and Phase 1-3 requirements.

## Context and Problem Statement

How should we structure the database schema in Supabase to accurately store user profiles, chat sessions, multi-turn messages, response time tracking, dynamic session phases, and mandatory per-reply feedback?

## Decision Drivers

- Strict visual and relational alignment with `MultiTurnAIChatbot-ERD.drawio.png`.
- Need to associate mandatory feedback directly with individual assistant messages (`message_id FK`).
- Tracking response time as Float (in seconds) and session phase (`start`, `middle`, `end`).
- Enforcing enum constraints on feedback fields: Rating (1-4), Correctness (`correct`, `partial`, `Incorrect`), and Length Type (`short`, `To the point`, `lengthy`).

## Considered Options

- Option 1: Basic Unconstrained Schema (Generic chat and session tables)
- Option 2: ERD-Aligned Relational Schema in Supabase PostgreSQL (Chosen)

## Decision Outcome

Chosen option: "Option 2: ERD-Aligned Relational Schema in Supabase PostgreSQL", because it strictly reflects `MultiTurnAIChatbot-ERD.drawio.png`, linking feedback directly per assistant message (`message_id FK`), capturing float response times, and enforcing exact enum values for rating (1-4), correctness, and length type.

### Positive Consequences

- Ensures 100% alignment between system architecture, ERD diagram, and database migrations.
- Enables accurate Phase 3 analytics reporting per message, per topic, and per session phase.
- Prevents invalid data entry via strict SQL CHECK and Enum constraints.

### Negative Consequences

- Requires updating existing database migrations to align with new constraints.

## Pros and Cons of the Options

### Option 1: Basic Unconstrained Schema

- Good, because quick initial setup.
- Bad, because feedback is loosely tied to sessions instead of specific messages, violating ERD specifications.

### Option 2: ERD-Aligned Relational Schema in Supabase PostgreSQL

- Good, because precise 1-to-Many mapping between Chat Sessions, Messages, and Per-Response Feedback.
- Good, because stores `response_time` as Float (in seconds) and `session_phase` (`start`, `middle`, `end`).
- Good, because enforces rating (1-4), correctness, and length type enums.

## Links

- Relates to [ADR-0001](ADR-0001-hybrid-dual-backend-architecture.md)
- Relates to [ADR-0002](ADR-0002-groq-llama3-inference-engine.md)
