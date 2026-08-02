# Groq API LLaMA 3 Model Integration

- Status: accepted
- Deciders: Project Team, Lead Architect
- Date: 2026-08-02

Technical Story: Selection of cloud inference provider for LLaMA 3 execution due to local hardware constraints.

## Context and Problem Statement

How should the system serve LLaMA 3 model inferences when local hardware resources (GPU/RAM) are insufficient to host and run LLaMA 3 locally via Ollama?

## Decision Drivers

- Hardware resource limitations preventing smooth local execution of LLaMA 3.
- Requirement for high-speed inference to ensure fast multi-turn response times.
- Need for high response accuracy and large parameter model support (LLaMA 3.3 70B).
- Cost efficiency and low-latency API infrastructure.

## Considered Options

- Option 1: Local Deployment via Ollama (Original FR4 specification)
- Option 2: Cloud Inference via Groq API (`llama-3.3-70b-versatile`)
- Option 3: Cloud Inference via OpenRouter API

## Decision Outcome

Chosen option: "Option 2: Cloud Inference via Groq API", because local hardware resources are insufficient to run LLaMA 3 locally, and Groq API provides ultra-fast LLaMA 3.3 70B inference with zero local GPU overhead.

### Positive Consequences

- Eliminates local GPU and memory hardware bottlenecks completely.
- Delivers extremely fast response generation for multi-turn conversations.
- Leverages the powerful `llama-3.3-70b-versatile` parameter model.

### Negative Consequences

- Requires active internet connection and valid Groq API key (`GROQ_API_KEY`).

## Pros and Cons of the Options

### Option 1: Local Deployment via Ollama

- Good, because completely offline capability.
- Bad, because causes severe lag, out-of-memory errors, and system slowdown on limited hardware resources.

### Option 2: Cloud Inference via Groq API

- Good, because state-of-the-art inference speed and zero local hardware strain.
- Good, because seamless integration with LLaMA 3.3 70B parameter model.
- Bad, because requires external cloud API dependency.

### Option 3: Cloud Inference via OpenRouter API

- Good, because multi-provider routing options.
- Bad, because higher latency compared to Groq's dedicated LPU hardware.

## Links

- Relates to [ADR-0001](ADR-0001-hybrid-dual-backend-architecture.md)
