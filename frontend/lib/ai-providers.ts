export interface AIModel {
  id: string;
  name: string;
}

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "Groq",
    name: "Groq Cloud",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Versatile)" },
      { id: "llama3-70b-8192", name: "Llama 3 70B (High Intelligence)" },
      { id: "llama3-8b-8192", name: "Llama 3 8B (Fast)" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
    ],
  },
  {
    id: "Ollama",
    name: "Local Llama (Ollama)",
    models: [
      { id: "llama3:latest", name: "Llama 3 (Latest)" },
      { id: "llama2", name: "Llama 2" },
      { id: "mistral", name: "Mistral" },
    ],
  },
  {
    id: "OpenRouter",
    name: "OpenRouter",
    models: [
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
      { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Free)" },
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
    ],
  },
];
