/**
 * TypeScript Definitions for Phase 3 Topics Analytics Module
 * Multi-Turn AI Chatbot Analytics (FR15, FR17, FR20, FR21)
 */

export interface TopicMetricsRecord {
  topic: string;
  total_ai_responses: number;
  evaluated_responses: number;
  correct: number;
  partial: number;
  incorrect: number;
  strict_accuracy: number | null; // Correct / Evaluated * 100 (null if 0 evaluated)
  helpfulness: number | null; // (Correct + Partial) / Evaluated * 100 (null if 0 evaluated)
  average_rating: number | null; // Sum of ratings / rating count (null if 0 rated)
  feedback_coverage: number; // Evaluated / Total AI responses * 100
  color: string;
}

export interface TopicsOverviewKPIs {
  topics_identified: number;
  total_ai_responses: number;
  total_evaluated_responses: number;
  overall_strict_accuracy: number | null;
  overall_helpfulness: number | null;
  overall_average_rating: number | null;
  overall_feedback_coverage: number;
}

export interface TopicDistributionItem {
  topic: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopicAccuracyItem {
  topic: string;
  strict_accuracy: number | null;
  helpfulness: number | null;
  total_evaluated: number;
  total_ai_responses: number;
  color: string;
}

export interface TopicInsight {
  id: string;
  type: "success" | "warning" | "info" | "neutral";
  title: string;
  description: string;
  metric_label?: string;
  metric_value?: string;
}

export interface AnalyticsTopicsPayload {
  kpis: TopicsOverviewKPIs;
  topics: TopicMetricsRecord[];
  distribution: TopicDistributionItem[];
  accuracy_comparison: TopicAccuracyItem[];
  insights: TopicInsight[];
}
