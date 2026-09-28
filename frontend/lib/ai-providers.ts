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
    id: "Gemini",
    name: "Google Gemini",
    models: [
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash (Recommended)" },
      { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite (High Speed)" },
      { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (High Intelligence)" },
    ],
  },
  {
    id: "Ollama",
    name: "Local Llama 3 (Ollama)",
    models: [
      { id: "llama3:latest", name: "Llama 3 (Local)" },
      { id: "llama3.1:latest", name: "Llama 3.1 (Local)" },
      { id: "llama3.2:latest", name: "Llama 3.2 (Local)" },
    ],
  },
];
