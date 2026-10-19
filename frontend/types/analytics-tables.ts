/**
 * TypeScript Definitions for Phase 3 FR19 Analytical Tables
 * Multi-Turn AI Chatbot Analytics Module
 */

export interface TopicAccuracyRow {
  topic: string;
  total_evaluated: number;
  correct: number;
  partial: number;
  incorrect: number;
  accuracy: number; // (correct + partial) / total_evaluated * 100
}

export interface ReplyCorrectnessRecord {
  id: string;
  message_id?: string;
  chat_id: string;
  session_title: string;
  timestamp: string; // ISO 8601
  formatted_time: string;
  topic: string;
  user_query: string;
  assistant_response: string;
  preview: string;
  rating: number; // 1 to 4
  correctness: "correct" | "partial" | "incorrect" | "none";
  status: "Correct" | "Partial" | "Incorrect";
  response_time: number | null; // in seconds
  feedback_status: "up" | "down" | "none";
  length_type: string;
  comment?: string;
}

export interface PhaseAccuracyRow {
  phase: "Start" | "Middle" | "End";
  phase_label: string;
  turns_range: string;
  total_evaluated: number;
  correct: number;
  partial: number;
  incorrect: number;
  accuracy: number;
}

export interface ResponseTimeMetricRow {
  metric: string;
  value: number | null;
  formatted_value: string;
  unit: string;
  sample_count: number;
  description: string;
}

export interface ResponseTimeSummary {
  min: number | null;
  max: number | null;
  avg: number | null;
  median: number | null;
  count: number;
  unit: string;
  population: string;
  metrics: ResponseTimeMetricRow[];
}

export interface RatingDistributionRow {
  rating: number; // 4, 3, 2, 1
  label: string; // "Excellent", "Good", "Fair", "Poor"
  count: number;
  percentage: number;
}

export interface LengthPreferenceRow {
  length_type: "Short" | "To the Point" | "Lengthy";
  raw_type: "short" | "to_the_point" | "lengthy";
  count: number;
  percentage: number;
  avg_rating: number | null;
}

export interface AnalyticsTablesPayload {
  topic_accuracy: TopicAccuracyRow[];
  reply_correctness: ReplyCorrectnessRecord[];
  phase_accuracy: PhaseAccuracyRow[];
  response_time_summary: ResponseTimeSummary;
  rating_distribution: RatingDistributionRow[];
  length_preference: LengthPreferenceRow[];
}
