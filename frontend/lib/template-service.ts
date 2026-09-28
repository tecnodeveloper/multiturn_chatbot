export type TemplateCategory =
  | "All"
  | "My templates"
  | "System templates"
  | "Favorites"
  | "Customer support"
  | "Coding"
  | "Research"
  | "Evaluation"
  | "General assistant";

export type EvaluationCriterion =
  | "Accuracy"
  | "Helpfulness"
  | "Correctness"
  | "Response length"
  | "Relevance"
  | "Instruction following";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  systemPrompt: string;
  starterPrompt?: string;
  provider: string;
  model: string;
  evaluationCriteria: EvaluationCriterion[];
  tags: string[];
  isFavorite: boolean;
  isSystemTemplate: boolean;
  usageCount: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTemplateInput = Omit<
  Template,
  "id" | "isSystemTemplate" | "usageCount" | "createdAt" | "updatedAt"
>;

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export const ALL_EVALUATION_CRITERIA: EvaluationCriterion[] = [
  "Accuracy",
  "Helpfulness",
  "Correctness",
  "Response length",
  "Relevance",
  "Instruction following",
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Customer support",
  "Coding",
  "Research",
  "Evaluation",
  "General assistant",
];

const INITIAL_SYSTEM_TEMPLATES: Template[] = [
  {
    id: "system-1",
    name: "Customer support evaluation",
    description: "Evaluate AI responses in realistic customer support situations for empathy, accuracy, and brand voice.",
    category: "Customer support",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    systemPrompt: "You are a professional customer support specialist for an e-commerce platform. Provide empathetic, helpful, and solution-oriented answers while strictly adhering to company return, warranty, and shipping policies.",
    starterPrompt: "A customer says their order arrived damaged. How should you respond?",
    evaluationCriteria: ["Accuracy", "Helpfulness", "Correctness", "Response length"],
    tags: ["support", "evaluation", "ecommerce"],
    isFavorite: true,
    isSystemTemplate: true,
    usageCount: 28,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "system-2",
    name: "Coding assistant",
    description: "Software engineering assistant specialized in debugging, refactoring, and producing clean, idiomatic code.",
    category: "Coding",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    systemPrompt: "You are an expert senior software engineer. Write clean, idiomatic, type-safe code with clear explanatory comments. Prioritize performance, edge-case coverage, and security best practices.",
    starterPrompt: "Review this TypeScript function for potential memory leaks and edge case failures.",
    evaluationCriteria: ["Accuracy", "Correctness", "Instruction following"],
    tags: ["typescript", "debugging", "coding"],
    isFavorite: false,
    isSystemTemplate: true,
    usageCount: 42,
    createdAt: "2026-08-02T10:00:00Z",
    updatedAt: "2026-08-02T10:00:00Z",
  },
  {
    id: "system-3",
    name: "Factual accuracy evaluation",
    description: "Rigorous test scenario to measure hallucination resistance and factual precision across domain queries.",
    category: "Evaluation",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    systemPrompt: "You are a factual verification assistant. State only verified facts. If information is uncertain, disputed, or unknown, explicitly state your uncertainty rather than guessing.",
    starterPrompt: "Explain the timeline of discovery for gravitational waves and verify the key research teams involved.",
    evaluationCriteria: ["Accuracy", "Correctness", "Relevance"],
    tags: ["evaluation", "hallucination", "accuracy"],
    isFavorite: true,
    isSystemTemplate: true,
    usageCount: 35,
    createdAt: "2026-08-03T10:00:00Z",
    updatedAt: "2026-08-03T10:00:00Z",
  },
  {
    id: "system-4",
    name: "General assistant",
    description: "All-purpose conversational assistant optimized for helpful, well-structured, and concise responses.",
    category: "General assistant",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    systemPrompt: "You are MultiTurn AI, a helpful, precise, and thoughtful general assistant. Provide structured, factual, and concise responses. Always ask clarifying questions when user intent is ambiguous.",
    starterPrompt: "Can you help me break down a complex project into manageable milestones?",
    evaluationCriteria: ["Helpfulness", "Accuracy", "Response length", "Relevance"],
    tags: ["general", "productivity", "assistant"],
    isFavorite: false,
    isSystemTemplate: true,
    usageCount: 56,
    createdAt: "2026-08-04T10:00:00Z",
    updatedAt: "2026-08-04T10:00:00Z",
  },
  {
    id: "system-5",
    name: "Research assistant",
    description: "Conduct comprehensive synthesis, comparative analysis, and structured literature summaries.",
    category: "Research",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    systemPrompt: "You are a rigorous research analyst. Synthesize information objectively, highlight conflicting evidence, cite assumptions, and present findings in clear tabular or hierarchical formats.",
    starterPrompt: "Summarize the key trade-offs between monolithic and microservice architectures for early-stage startups.",
    evaluationCriteria: ["Accuracy", "Relevance", "Instruction following", "Helpfulness"],
    tags: ["research", "analysis", "synthesis"],
    isFavorite: false,
    isSystemTemplate: true,
    usageCount: 19,
    createdAt: "2026-08-05T10:00:00Z",
    updatedAt: "2026-08-05T10:00:00Z",
  },
  {
    id: "system-6",
    name: "Multi-turn consistency evaluation",
    description: "Test and score an AI's ability to maintain context, instructions, and persona coherence across extended turns.",
    category: "Evaluation",
    provider: "Ollama",
    model: "llama3:latest",
    systemPrompt: "You are playing the role of a municipal planning advisor in a multi-turn urban simulation. Remember all constraints introduced by the user across previous turns and maintain strict budget rules.",
    starterPrompt: "We have a $5M budget for downtown revitalization. What should our first three priorities be?",
    evaluationCriteria: ["Instruction following", "Relevance", "Response length", "Helpfulness"],
    tags: ["evaluation", "consistency", "multi-turn"],
    isFavorite: true,
    isSystemTemplate: true,
    usageCount: 22,
    createdAt: "2026-08-06T10:00:00Z",
    updatedAt: "2026-08-06T10:00:00Z",
  },
];

const STORAGE_KEY = "multiturn_templates";

class TemplateService {
  private getStoredTemplates(): Template[] {
    if (typeof window === "undefined") {
      return INITIAL_SYSTEM_TEMPLATES;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SYSTEM_TEMPLATES));
        return INITIAL_SYSTEM_TEMPLATES;
      }
      const parsed: Template[] = JSON.parse(raw);
      // Ensure all initial system templates exist
      const existingIds = new Set(parsed.map((t) => t.id));
      let updated = false;
      for (const sys of INITIAL_SYSTEM_TEMPLATES) {
        if (!existingIds.has(sys.id)) {
          parsed.unshift(sys);
          updated = true;
        }
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      console.error("Failed to read templates from storage", e);
      return INITIAL_SYSTEM_TEMPLATES;
    }
  }

  private saveTemplates(templates: Template[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error("Failed to write templates to storage", e);
    }
  }

  async getTemplates(): Promise<Template[]> {
    return this.getStoredTemplates();
  }

  async getTemplateById(id: string): Promise<Template | null> {
    const templates = this.getStoredTemplates();
    return templates.find((t) => t.id === id) || null;
  }

  async createTemplate(input: CreateTemplateInput): Promise<Template> {
    const templates = this.getStoredTemplates();
    const newTemplate: Template = {
      ...input,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `template-${Date.now()}`,
      isSystemTemplate: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templates.unshift(newTemplate);
    this.saveTemplates(templates);
    return newTemplate;
  }

  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<Template> {
    const templates = this.getStoredTemplates();
    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Template with id ${id} not found`);
    }
    const current = templates[index];
    if (current.isSystemTemplate) {
      throw new Error("System templates cannot be edited directly. Duplicate it first.");
    }
    const updated: Template = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    templates[index] = updated;
    this.saveTemplates(templates);
    return updated;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const templates = this.getStoredTemplates();
    const target = templates.find((t) => t.id === id);
    if (!target) return false;
    if (target.isSystemTemplate) {
      throw new Error("System templates cannot be deleted");
    }
    const filtered = templates.filter((t) => t.id !== id);
    this.saveTemplates(filtered);
    return true;
  }

  async duplicateTemplate(id: string): Promise<Template> {
    const templates = this.getStoredTemplates();
    const original = templates.find((t) => t.id === id);
    if (!original) {
      throw new Error(`Template with id ${id} not found`);
    }
    const duplicated: Template = {
      ...original,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `template-${Date.now()}`,
      name: `${original.name} (Copy)`,
      isSystemTemplate: false,
      isFavorite: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templates.unshift(duplicated);
    this.saveTemplates(templates);
    return duplicated;
  }

  async toggleFavorite(id: string): Promise<Template> {
    const templates = this.getStoredTemplates();
    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Template with id ${id} not found`);
    }
    const updated = {
      ...templates[index],
      isFavorite: !templates[index].isFavorite,
      updatedAt: new Date().toISOString(),
    };
    templates[index] = updated;
    this.saveTemplates(templates);
    return updated;
  }

  async incrementUsage(id: string): Promise<Template> {
    const templates = this.getStoredTemplates();
    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Template with id ${id} not found`);
    }
    const updated = {
      ...templates[index],
      usageCount: (templates[index].usageCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    templates[index] = updated;
    this.saveTemplates(templates);
    return updated;
  }
}

export const templateService = new TemplateService();
