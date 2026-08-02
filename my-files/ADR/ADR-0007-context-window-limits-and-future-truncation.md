# Context Window Token Limits and Future History Truncation Strategy

- Status: accepted
- Deciders: Project Team, Lead Architect
- Date: 2026-08-02

Technical Story: Setting current context behavior for session messages and defining future token limit truncation strategy.

## Context and Problem Statement

How should long-running multi-turn chat sessions handle full message history context when sending requests to the LLaMA 3.3 70B model via Groq API, and how will future context window limits be handled?

## Decision Drivers

- Requirement for complete session context continuity during multi-turn conversations (FR8).
- Groq API LLaMA 3.3 70B token limits (128k context window).
- Need to document future truncation strategies (e.g. Sliding N-message window or summarization) for extremely long sessions.

## Considered Options

- Option 1: Truncating message history immediately (Sliding window of last 10 messages)
- Option 2: Full session history propagation for current implementation, documenting sliding window / token truncation for future scaling (Chosen)

## Decision Outcome

Chosen option: "Option 2: Full session history propagation for current implementation, documenting sliding window / token truncation for future scaling", because current chat sessions send all previous session messages back to the AI model to guarantee complete context memory. If session length exceeds Groq token limits in future iterations, a sliding context truncation strategy will be implemented.

### Positive Consequences

- Guarantees complete conversational memory for all standard multi-turn chat sessions.
- Establishes a documented architectural plan for future sliding-window token management if chat history grows excessively large.

### Negative Consequences

- Prompt payload grows with session length (handled efficiently by Groq API's high token limits for current session lengths).

## Pros and Cons of the Options

### Option 1: Truncating message history immediately

- Good, because fixed token payload.
- Bad, because causes early conversational context loss during standard multi-turn sessions.

### Option 2: Full session history propagation for current implementation, documenting sliding window / token truncation for future scaling

- Good, because delivers full multi-turn memory without losing early context.
- Good, because explicitly defines future architectural extension point for token window management.

## Links

- Relates to [ADR-0005](ADR-0005-dynamic-session-segmentation-and-context-management.md)
