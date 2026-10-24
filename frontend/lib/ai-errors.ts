/**
 * Canonical AI Error Taxonomy for Multi-Turn AI Chatbot.
 * Single source of truth for error classification across the TypeScript stack.
 */

export const AI_ERROR_KINDS = [
  "MISCONFIG",
  "MODEL_NOT_FOUND",
  "BAD_REQUEST",
  "RATE_LIMIT",
  "OVERLOADED",
  "TIMEOUT",
  "NETWORK",
  "UPSTREAM_5XX",
  "UNKNOWN",
] as const;

export type AIErrorKind = (typeof AI_ERROR_KINDS)[number];

export interface AIErrorSpec {
  kind: AIErrorKind;
  code: number;
  message: string;
  retryable: boolean;
}

export const AI_ERROR_TAXONOMY: Record<
  AIErrorKind,
  { code: number; retryable: boolean; defaultMessage: string }
> = {
  MISCONFIG: {
    code: 500,
    retryable: false,
    defaultMessage: "AI provider configuration error or invalid API key.",
  },
  MODEL_NOT_FOUND: {
    code: 404,
    retryable: false,
    defaultMessage: "The requested AI model was not found.",
  },
  BAD_REQUEST: {
    code: 400,
    retryable: false,
    defaultMessage: "Invalid AI request parameters or bad payload.",
  },
  RATE_LIMIT: {
    code: 429,
    retryable: true,
    defaultMessage: "Rate limit reached. Please wait a moment before trying again.",
  },
  OVERLOADED: {
    code: 503,
    retryable: true,
    defaultMessage: "The AI service is currently overloaded. Please try again shortly.",
  },
  TIMEOUT: {
    code: 504,
    retryable: true,
    defaultMessage: "The AI request timed out waiting for a response.",
  },
  NETWORK: {
    code: 502,
    retryable: true,
    defaultMessage: "Network connection error communicating with AI provider.",
  },
  UPSTREAM_5XX: {
    code: 502,
    retryable: true,
    defaultMessage: "Upstream AI provider encountered an internal server error.",
  },
  UNKNOWN: {
    code: 500,
    retryable: false,
    defaultMessage: "An unexpected error occurred while generating the AI response.",
  },
};

/**
 * Maps an upstream HTTP status code directly to a canonical AIErrorKind.
 */
export function mapHttpStatusToErrorKind(status: number): AIErrorKind {
  if (status === 401 || status === 403) return "MISCONFIG";
  if (status === 404) return "MODEL_NOT_FOUND";
  if (status === 400 || status === 422) return "BAD_REQUEST";
  if (status === 429) return "RATE_LIMIT";
  if (status === 503 || status === 529) return "OVERLOADED";
  if (status === 504 || status === 408) return "TIMEOUT";
  if (status >= 500 && status < 600) return "UPSTREAM_5XX";
  return "UNKNOWN";
}

/**
 * Classifies any error object or exception into the typed AIErrorSpec.
 */
export function classifyAIError(err: any): AIErrorSpec {
  if (!err) {
    const spec = AI_ERROR_TAXONOMY.UNKNOWN;
    return { kind: "UNKNOWN", code: spec.code, message: spec.defaultMessage, retryable: spec.retryable };
  }

  // Already classified
  if (err.kind && AI_ERROR_TAXONOMY[err.kind as AIErrorKind]) {
    const kind = err.kind as AIErrorKind;
    const spec = AI_ERROR_TAXONOMY[kind];
    return {
      kind,
      code: typeof err.code === "number" ? err.code : spec.code,
      message: err.message || spec.defaultMessage,
      retryable: typeof err.retryable === "boolean" ? err.retryable : spec.retryable,
    };
  }

  const status = typeof err.status === "number" ? err.status : typeof err.statusCode === "number" ? err.statusCode : undefined;
  const msg = String(err.message || err || "").toLowerCase();
  const name = String(err.name || "").toLowerCase();

  // 1. Timeout detection
  if (
    status === 504 ||
    status === 408 ||
    name === "aborterror" ||
    name === "timeouterror" ||
    msg.includes("timed out") ||
    msg.includes("timeout") ||
    err === "TIMEOUT_20S"
  ) {
    const spec = AI_ERROR_TAXONOMY.TIMEOUT;
    return {
      kind: "TIMEOUT",
      code: spec.code,
      message: "AI request timed out after 20 seconds. Please try again.",
      retryable: spec.retryable,
    };
  }

  // 2. Network connection errors
  if (
    msg.includes("econnrefused") ||
    msg.includes("econnreset") ||
    msg.includes("enotfound") ||
    msg.includes("network error") ||
    msg.includes("fetch failed") ||
    name === "typeerror" && msg.includes("fetch")
  ) {
    const spec = AI_ERROR_TAXONOMY.NETWORK;
    return {
      kind: "NETWORK",
      code: spec.code,
      message: "Network connection error communicating with AI provider.",
      retryable: spec.retryable,
    };
  }

  // 3. Provider status code resolution
  if (typeof status === "number") {
    const kind = mapHttpStatusToErrorKind(status);
    const spec = AI_ERROR_TAXONOMY[kind];
    const customMessage =
      kind === "MODEL_NOT_FOUND"
        ? "The requested AI model was not found or is unavailable."
        : kind === "OVERLOADED"
        ? "The AI model is experiencing high demand. Please try again shortly."
        : kind === "RATE_LIMIT"
        ? "Rate limit reached. Please wait a moment before trying again."
        : err.message || spec.defaultMessage;

    return {
      kind,
      code: spec.code,
      message: customMessage,
      retryable: spec.retryable,
    };
  }

  // 4. Misconfiguration detection (API keys)
  if (
    msg.includes("api key") ||
    msg.includes("missing api key") ||
    msg.includes("unauthorized") ||
    msg.includes("forbidden")
  ) {
    const spec = AI_ERROR_TAXONOMY.MISCONFIG;
    return {
      kind: "MISCONFIG",
      code: spec.code,
      message: "AI provider API key is missing or invalid.",
      retryable: spec.retryable,
    };
  }

  // 5. Semantic string patterns
  if (msg.includes("high demand") || msg.includes("overloaded") || msg.includes("503")) {
    const spec = AI_ERROR_TAXONOMY.OVERLOADED;
    return {
      kind: "OVERLOADED",
      code: spec.code,
      message: "The AI service is currently overloaded. Please try again shortly.",
      retryable: spec.retryable,
    };
  }

  if (msg.includes("rate limit") || msg.includes("429")) {
    const spec = AI_ERROR_TAXONOMY.RATE_LIMIT;
    return {
      kind: "RATE_LIMIT",
      code: spec.code,
      message: "Rate limit reached. Please wait a moment before trying again.",
      retryable: spec.retryable,
    };
  }

  if (msg.includes("not found") && (msg.includes("model") || msg.includes("endpoint"))) {
    const spec = AI_ERROR_TAXONOMY.MODEL_NOT_FOUND;
    return {
      kind: "MODEL_NOT_FOUND",
      code: spec.code,
      message: "The requested AI model was not found.",
      retryable: spec.retryable,
    };
  }

  const spec = AI_ERROR_TAXONOMY.UNKNOWN;
  return {
    kind: "UNKNOWN",
    code: spec.code,
    message: err.message || spec.defaultMessage,
    retryable: spec.retryable,
  };
}
