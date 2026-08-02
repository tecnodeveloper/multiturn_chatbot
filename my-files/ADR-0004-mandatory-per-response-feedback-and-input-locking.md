# Strict Mandatory Per-Response Feedback System

- Status: accepted
- Deciders: Project Team, Lead Architect
- Date: 2026-08-02

Technical Story: Enforcing strict mandatory 3-field feedback compliance and input locking after every AI assistant message response (FR12 & FR13).

## Context and Problem Statement

Should feedback collection be optional or strictly enforced, and how should input controls behave until feedback is completed?

## Decision Drivers

- Requirement for 100% feedback capture compliance per model response.
- Strict enforcement of FR12 (Feedback Panel) and FR13 (Input Control Mechanism).
- Preventing conversational drift by blocking text input until rating is completed.

## Considered Options

- Option 1: Optional feedback buttons or periodic prompts
- Option 2: Strictly enforced 3-field mandatory feedback loop with immediate input lock (Chosen)

## Decision Outcome

Chosen option: "Option 2: Strictly enforced 3-field mandatory feedback loop with immediate input lock", because feedback must be strictly collected after every single assistant response. Text input and send controls freeze instantly upon response completion and unlock only after submitting Rating (1-4), Correctness, and Length Type.

### Positive Consequences

- Guarantees 100% feedback data entry for all assistant responses in the database.
- Strictly satisfies requirements FR12 and FR13 without exception.
- Provides precise dataset quality for Phase 3 analytics reporting.

### Negative Consequences

- User must submit feedback before typing the next chat prompt.

## Pros and Cons of the Options

### Option 1: Optional feedback buttons or periodic prompts

- Good, because unconstrained typing experience.
- Bad, because yields incomplete feedback data, failing project requirements.

### Option 2: Strictly enforced 3-field mandatory feedback loop with immediate input lock

- Good, because 100% strict compliance with project requirements.
- Good, because ensures every message has paired Rating (1-4), Correctness, and Length Type metrics.

## Links

- Relates to [ADR-0003](ADR-0003-supabase-relational-database-schema.md)
