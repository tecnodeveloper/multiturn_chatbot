/**
 * Canonical Topic Model and Classifier for Multi-Turn AI Chatbot.
 * FR11 / FR15 / FR22: Single source of truth for topic codes, labels, and classification heuristics.
 */

export const TOPIC_CODES = [
  "MachineLearning",
  "DeepLearning",
  "HealthcareAI",
  "PowerSystems",
  "E-commerceAI",
  "Other",
] as const;

export type TopicCode = (typeof TOPIC_CODES)[number];

export const TOPIC_LABELS: Record<string, string> = {
  MachineLearning: "Machine Learning",
  DeepLearning: "Deep Learning",
  HealthcareAI: "Healthcare AI",
  PowerSystems: "Power Systems",
  "E-commerceAI": "E-commerce AI",
  Other: "Other",
  // Legacy alias support
  "Machine Learning": "Machine Learning",
  "Deep Learning": "Deep Learning",
  "Healthcare AI": "Healthcare AI",
  "Power Systems": "Power Systems",
  "E-commerce AI": "E-commerce AI",
};

export const KEYWORD_RULES: Array<{ topic: TopicCode; keywords: string[] }> = [
  {
    topic: "DeepLearning",
    keywords: ["deep learning", "deeplearning", "cnn", "rnn", "neural", "transformer", "pytorch"],
  },
  {
    topic: "HealthcareAI",
    keywords: ["health", "medical", "hospital", "patient", "clinical", "healthcareai", "healthcare"],
  },
  {
    topic: "PowerSystems",
    keywords: ["power", "grid", "voltage", "energy", "solar", "battery", "powersystems"],
  },
  {
    topic: "E-commerceAI",
    keywords: ["e-commerce", "ecommerce", "recommend", "cart", "product", "retail", "e-commerceai"],
  },
  {
    topic: "MachineLearning",
    keywords: ["machine learning", "machinelearning", "regression", "classification", "clustering", "svm", "dataset", "model"],
  },
];

/**
 * Classify user message text into a canonical topic code using deterministic heuristics.
 * Minimum threshold: length >= 6 characters.
 */
export function classifyTopic(text: string): TopicCode {
  if (!text || text.trim().length < 6) {
    return "Other";
  }

  const lowerText = text.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((k) => lowerText.includes(k))) {
      return rule.topic;
    }
  }

  return "Other";
}

/**
 * Resolves a canonical topic code from either an existing category label or query text fallback.
 */
export function resolveTopic(query: string, rawCat?: string | null): TopicCode {
  if (rawCat) {
    const clean = rawCat.replace(/\s+/g, "").toLowerCase();
    for (const code of TOPIC_CODES) {
      if (code.toLowerCase() === clean) {
        return code;
      }
    }
  }

  return classifyTopic(query);
}
