# Dynamic Session Segmentation and Full Multi-Turn Context Management

- Status: accepted
- Deciders: Project Team, Lead Architect
- Date: 2026-08-02

Technical Story: Defining dynamic session phase segmentation (Start, Middle, End) and conversation history context propagation (FR8 & FR16).

## Context and Problem Statement

How should conversation sessions be segmented into phases for performance analytics, and how should session context be passed back to the AI model on new turns?

## Decision Drivers

- Variable chat session lengths (some sessions have 4 messages, others have 20+).
- Requirement for multi-turn model context awareness across session loads (FR8).
- Need to calculate positional accuracy across `start`, `middle`, and `end` phases (FR16).

## Considered Options

- Option 1: Static turn count phase assignment (e.g. Turn 1-2 = Start, Turn 3-5 = Middle, Turn 6+ = End) with truncated N-message context window.
- Option 2: Dynamic phase segmentation based on total session percentage with full past message context sent on each turn (Chosen).

## Decision Outcome

Chosen option: "Option 2: Dynamic phase segmentation with full past message context", because dynamic segmentation adjusts phases proportionally based on actual chat length (Start ~33%, Middle ~34%, End ~33%), and sending all previous session messages back to the AI model maintains complete conversational context across re-logins.

### Positive Consequences

- Dynamic phase segmentation provides balanced analytical metrics regardless of session length.
- Resuming a chat session sends entire past message history to Groq (LLaMA 3.3 70B), ensuring zero loss of context memory.
- Fulfills FR8 (Multi-Turn Chat Functionality) and FR16 (Session Segmentation).

### Negative Consequences

- Prompt payload size increases as session length grows (managed efficiently by Groq API's high token limits).

## Pros and Cons of the Options

### Option 1: Static turn count phase assignment with truncated context

- Good, because fixed context payload size.
- Bad, because static turn bounds fail for short (3-message) or very long (30-message) sessions.
- Bad, because truncating history loses early conversation context.

### Option 2: Dynamic phase segmentation with full past message context

- Good, because dynamic phase calculation adapts accurately to any chat session length.
- Good, because sending all previous messages gives LLaMA 3.3 70B complete context memory when a user resumes a session.

## Links

- Relates to [ADR-0001](ADR-0001-hybrid-dual-backend-architecture.md)
- Relates to [ADR-0002](ADR-0002-groq-llama3-inference-engine.md)
