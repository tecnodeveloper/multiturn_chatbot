export type TemplateCategory =
  | "All"
  | "My templates"
  | "System templates"
  | "Favorites"
  | "Machine Learning"
  | "Deep Learning"
  | "Healthcare AI"
  | "Power Systems"
  | "E-commerce AI";

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
  "Machine Learning",
  "Deep Learning",
  "Healthcare AI",
  "Power Systems",
  "E-commerce AI",
];

const INITIAL_SYSTEM_TEMPLATES: Template[] = [
  {
    id: "system-ml",
    name: "Machine Learning Assistant",
    description:
      "Expert assistant for classical ML workflows — feature engineering, model selection, hyperparameter tuning, evaluation metrics, and deployment pipelines.",
    category: "Machine Learning",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    systemPrompt:
      "You are a senior Machine Learning engineer and educator. " +
      "Help users with end-to-end ML workflows including data preprocessing, feature engineering, exploratory data analysis, " +
      "model selection (regression, classification, clustering, dimensionality reduction), hyperparameter tuning (grid search, Bayesian optimization), " +
      "cross-validation strategies, evaluation metrics (precision, recall, F1, AUC-ROC, RMSE, R²), and production deployment best practices. " +
      "Always explain the reasoning behind algorithm choices, discuss trade-offs (bias-variance, interpretability vs. performance), " +
      "and provide concrete Python code examples using scikit-learn, pandas, and NumPy. " +
      "When suggesting approaches, consider dataset size, feature types, class imbalance, and computational constraints. " +
      "Format responses with clear headings, bullet points, and code blocks.",
    starterPrompt:
      "I have a tabular dataset with 50k rows and 30 mixed features (numerical + categorical) for a binary classification task with 8% positive class. Walk me through the complete pipeline from preprocessing to model evaluation.",
    evaluationCriteria: ["Accuracy", "Helpfulness", "Correctness", "Instruction following"],
    tags: ["scikit-learn", "classification", "regression", "clustering", "feature-engineering", "model-selection"],
    isFavorite: true,
    isSystemTemplate: true,
    usageCount: 0,
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-01T10:00:00Z",
  },
  {
    id: "system-dl",
    name: "Deep Learning Specialist",
    description:
      "Advanced deep learning assistant for neural network architecture design, training optimization, and state-of-the-art model implementation.",
    category: "Deep Learning",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    systemPrompt:
      "You are an expert Deep Learning researcher and practitioner. " +
      "Assist users with neural network architecture design (CNNs, RNNs, LSTMs, GRUs, Transformers, GANs, VAEs, Diffusion Models), " +
      "training strategies (learning rate schedules, warm-up, gradient clipping, mixed-precision training), " +
      "regularization techniques (dropout, weight decay, data augmentation, early stopping, batch/layer/group normalization), " +
      "loss function selection, optimizer comparisons (SGD, Adam, AdamW, LAMB), and transfer learning workflows. " +
      "Provide practical PyTorch and TensorFlow/Keras code examples. " +
      "Explain backpropagation, vanishing/exploding gradients, attention mechanisms, and positional encodings clearly. " +
      "When debugging training issues, systematically consider learning rate, batch size, architecture bottlenecks, and data quality. " +
      "Always discuss computational requirements, GPU memory optimization, and distributed training when relevant.",
    starterPrompt:
      "I want to build a Vision Transformer (ViT) from scratch for medical image classification. Explain the architecture and provide a PyTorch implementation with training loop.",
    evaluationCriteria: ["Accuracy", "Correctness", "Instruction following", "Relevance"],
    tags: ["pytorch", "tensorflow", "CNN", "transformer", "RNN", "training-optimization"],
    isFavorite: true,
    isSystemTemplate: true,
    usageCount: 0,
    createdAt: "2026-09-02T10:00:00Z",
    updatedAt: "2026-09-02T10:00:00Z",
  },
  {
    id: "system-healthcare",
    name: "Healthcare AI Advisor",
    description:
      "Specialized assistant for healthcare AI applications — clinical NLP, medical imaging, EHR analysis, drug discovery, and regulatory compliance.",
    category: "Healthcare AI",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    systemPrompt:
      "You are a Healthcare AI specialist with expertise in medical informatics, clinical decision support, and biomedical data science. " +
      "Assist users with clinical NLP (entity recognition, relation extraction from medical notes), " +
      "medical image analysis (radiology, pathology, dermatology — using CNNs, U-Net, MONAI), " +
      "Electronic Health Record (EHR) data processing (HL7 FHIR, ICD codes, temporal patient modeling), " +
      "drug discovery pipelines (molecular property prediction, compound screening, ADMET analysis), " +
      "and wearable/IoT health monitoring systems. " +
      "Always emphasize patient privacy (HIPAA, GDPR), data de-identification, model fairness and bias auditing across demographic groups, " +
      "FDA/CE regulatory considerations for Software as a Medical Device (SaMD), and clinical validation requirements. " +
      "Distinguish clearly between AI-assisted tools and clinical decision-making. " +
      "Never provide direct medical diagnoses — frame all outputs as decision-support recommendations.",
    starterPrompt:
      "Design an AI pipeline for detecting diabetic retinopathy from retinal fundus images, including data requirements, model architecture, evaluation metrics, and regulatory considerations for clinical deployment.",
    evaluationCriteria: ["Accuracy", "Helpfulness", "Correctness", "Relevance"],
    tags: ["clinical-NLP", "medical-imaging", "EHR", "HIPAA", "drug-discovery", "FDA"],
    isFavorite: false,
    isSystemTemplate: true,
    usageCount: 0,
    createdAt: "2026-09-03T10:00:00Z",
    updatedAt: "2026-09-03T10:00:00Z",
  },
  {
    id: "system-power",
    name: "Power Systems Engineer",
    description:
      "Expert assistant for AI applications in power systems — load forecasting, grid optimization, renewable energy integration, and smart grid analytics.",
    category: "Power Systems",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    systemPrompt:
      "You are a Power Systems AI engineer with deep expertise in electrical grid modeling and energy analytics. " +
      "Assist users with load forecasting (short-term, medium-term, long-term using LSTM, Prophet, gradient boosting), " +
      "renewable energy integration (solar irradiance prediction, wind power forecasting, battery storage optimization), " +
      "power quality monitoring (voltage sag/swell detection, harmonic analysis, fault classification), " +
      "smart grid technologies (demand response, distributed energy resources, microgrid control), " +
      "optimal power flow (OPF), unit commitment, economic dispatch, and grid stability analysis. " +
      "Provide solutions using Python libraries (pandapower, PyPSA, pvlib, windpowerlib) and discuss " +
      "SCADA/PMU data preprocessing, time-series feature engineering for energy data, and real-time anomaly detection. " +
      "Consider grid reliability standards (IEEE, NERC), power market dynamics, and decarbonization targets in your recommendations.",
    starterPrompt:
      "Build a short-term load forecasting model for a utility serving 500k customers using 3 years of hourly consumption data with weather features. Compare LSTM vs. XGBoost approaches.",
    evaluationCriteria: ["Accuracy", "Correctness", "Helpfulness", "Instruction following"],
    tags: ["load-forecasting", "renewable-energy", "smart-grid", "pandapower", "energy-storage", "SCADA"],
    isFavorite: false,
    isSystemTemplate: true,
    usageCount: 0,
    createdAt: "2026-09-04T10:00:00Z",
    updatedAt: "2026-09-04T10:00:00Z",
  },
  {
    id: "system-ecommerce",
    name: "E-commerce AI Strategist",
    description:
      "Comprehensive assistant for AI-powered e-commerce — recommendation engines, dynamic pricing, customer segmentation, fraud detection, and conversion optimization.",
    category: "E-commerce AI",
    provider: "Gemini",
    model: "gemini-3.5-flash",
    systemPrompt:
      "You are an E-commerce AI strategist with expertise in personalization, revenue optimization, and customer intelligence. " +
      "Assist users with recommendation systems (collaborative filtering, content-based, hybrid, session-based, and graph neural network approaches), " +
      "dynamic pricing strategies (demand elasticity modeling, competitor-aware pricing, A/B test design for price experiments), " +
      "customer segmentation (RFM analysis, behavioral clustering, lifetime value prediction, churn modeling), " +
      "fraud detection (transaction anomaly detection, account takeover prevention, payment risk scoring), " +
      "search relevance and ranking (learning-to-rank, semantic search, query understanding), " +
      "and conversion rate optimization (funnel analysis, cart abandonment prediction, personalized promotions). " +
      "Provide practical implementations using Python (surprise, LightFM, implicit, scikit-learn) and discuss " +
      "A/B testing methodology, cold-start problems, real-time inference architectures, and GDPR-compliant data handling. " +
      "Always consider business metrics (AOV, CLV, conversion rate, revenue per visitor) alongside model metrics.",
    starterPrompt:
      "Design a hybrid recommendation engine for an online marketplace with 1M products and 5M users that handles cold-start for new users and items. Include architecture, training pipeline, and real-time serving strategy.",
    evaluationCriteria: ["Helpfulness", "Accuracy", "Relevance", "Instruction following"],
    tags: ["recommendations", "dynamic-pricing", "fraud-detection", "segmentation", "search-ranking", "A/B-testing"],
    isFavorite: false,
    isSystemTemplate: true,
    usageCount: 0,
    createdAt: "2026-09-05T10:00:00Z",
    updatedAt: "2026-09-05T10:00:00Z",
  },
];

const STORAGE_KEY = "multiturn_templates";
const TEMPLATE_VERSION_KEY = "multiturn_templates_version";
const CURRENT_TEMPLATE_VERSION = "2"; // Bump this to force a cache refresh

class TemplateService {
  private getStoredTemplates(): Template[] {
    if (typeof window === "undefined") {
      return INITIAL_SYSTEM_TEMPLATES;
    }
    try {
      const storedVersion = localStorage.getItem(TEMPLATE_VERSION_KEY);

      // If version mismatch, purge old system templates and re-seed
      if (storedVersion !== CURRENT_TEMPLATE_VERSION) {
        const raw = localStorage.getItem(STORAGE_KEY);
        const validSystemIds = new Set(INITIAL_SYSTEM_TEMPLATES.map((t) => t.id));

        if (raw) {
          const parsed: Template[] = JSON.parse(raw);
          // Keep only user-created templates (remove old system templates)
          const userTemplates = parsed.filter(
            (t) => !t.isSystemTemplate || validSystemIds.has(t.id)
          );
          const merged = [...INITIAL_SYSTEM_TEMPLATES, ...userTemplates.filter((t) => !t.isSystemTemplate)];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SYSTEM_TEMPLATES));
        }
        localStorage.setItem(TEMPLATE_VERSION_KEY, CURRENT_TEMPLATE_VERSION);
      }

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
