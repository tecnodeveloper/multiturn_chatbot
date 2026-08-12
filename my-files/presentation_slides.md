# Video Presentation Slide Deck & Recording Script

**Project Title:** Multi-Turn AI Chatbot System with LLaMA 3  
**Target Duration:** ~3 to 5 minutes  
**Slide Deck File:** `my-files/presentation_slides.html` (Open in browser and press Left/Right Arrow keys to switch slides)

---

## Slide 1: The Core Problem – LLM Statelessness & Loss of Context
* **Theme:** Crimson / Coral Accent (Problem Statement)
* **Slide Title:** The Challenge: LLMs Are Stateless
* **Key Visual Elements:**
  * Turn 1 Card: *"Tell me about Shahid Afridi's cricket career."* (Model responds with stats).
  * Turn 2 Card: *"How many fours did he hit in ODI cricket?"* (Stateless API fails because it forgets who "he" refers to).
  * Highlight Box: Foundational Large Language Model APIs process every prompt independently with zero memory of past turns.
* **Spoken Video Script:**
  > *"Hello everyone! In this video, I am introducing our Multi-Turn AI Chatbot project. The fundamental challenge we address is that LLM APIs are inherently stateless. For example, if a user asks about Shahid Afridi's career and then follows up asking 'How many fours did HE hit?', a standard LLM loses context and doesn't know who 'he' refers to. Without context persistence, continuous human-like dialogue is broken."*

---

## Slide 2: Architectural Solution – Dynamic Context Persistence
* **Theme:** Emerald / Cyan Accent (Solution & Architecture)
* **Slide Title:** The Solution: Dynamic Context Persistence
* **Key Visual Elements:**
  1. **Persistent Storage:** Every prompt and response is logged in real-time to Supabase Cloud PostgreSQL.
  2. **Context Assembly:** Backend automatically fetches full past conversation history upon new prompt dispatch.
  3. **Model Execution:** Prepends history and delivers to Meta LLaMA 3 via Groq API.
* **Spoken Video Script:**
  > *"To solve this, our application implements a full-stack context management architecture. Every message is saved to a Supabase PostgreSQL database under a session ID. When a user sends a new prompt, our Python Flask backend automatically retrieves the entire conversation history, prepends it to the prompt, and passes it to Meta LLaMA 3 via Groq API. This enables true, seamless multi-turn conversational intelligence."*

---

## Slide 3: Intelligent Features – Per-Turn Feedback & Closed-Loop Quality
* **Theme:** Electric Violet Accent (System Features & UX)
* **Slide Title:** Per-Turn Feedback & Closed-Loop Learning
* **Key Visual Elements:**
  * **Per-Turn Feedback:** Mandatory evaluation widget (1–5 Star Rating, Correctness, Output Length).
  * **Input Locking Control:** Input freezes during generation until feedback is submitted to guarantee data quality.
  * **Ergonomic Appearance:** Instant Dark Mode & Light Mode theme selector built with Tailwind CSS.
* **Spoken Video Script:**
  > *"Beyond multi-turn conversation, our platform includes human-in-the-loop quality evaluation. After every AI response, input locks until the user provides mandatory feedback rating correctness, output length, and score. This creates a valuable dataset that enables real-time monitoring and continuous evaluation of model quality."*

---

## Slide 4: Analytics Engine – Real-Time AI Domain & Quality Insights
* **Theme:** Cyber Blue Accent (Analytics & Insights)
* **Slide Title:** Real-Time Analytics & Topic Intelligence
* **Key Visual Elements:**
  * **Topic Classification:** Real-time classification into 5 AI domains (*Machine Learning, Deep Learning, Healthcare AI, Power Systems, E-commerce AI*).
  * **Latency Tracking:** Measures response dispatch & completion timestamps in milliseconds per turn.
  * **Graphical Analytics:** Live visual graphs mapping rating distributions, phase accuracy trends, and response volume.
* **Spoken Video Script:**
  > *"Finally, our system includes a dedicated Analytics Engine. Using lightweight Groq LLM inference, every user query is classified in real-time into specific technical domains like Machine Learning or Healthcare AI. Combined with millisecond-accurate response latency tracking, our visual dashboard presents real-time graphs for rating trends, domain distribution, and model throughput."*
