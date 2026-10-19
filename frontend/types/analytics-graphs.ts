/**
 * TypeScript Definitions for Phase 3 FR20 Analytics Graphs
 * Multi-Turn AI Chatbot Analytics Module
 */

export interface TopicDistributionSlice {
  topic: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AccuracyByTopicPoint {
  topic: string;
  accuracy: number; // (correct + partial) / total_evaluated * 100
  total_evaluated: number;
  correct: number;
  partial: number;
  incorrect: number;
}

export interface PhaseAccuracyPoint {
  phase: "Start" | "Middle" | "End";
  label: string;
  turns_range: string;
  accuracy: number | null; // null if 0 evaluations, not fake 0%
  total_evaluated: number;
  correct: number;
  partial: number;
  incorrect: number;
}

export interface ReplyCorrectnessPoint {
  id: string;
  index: number;
  timestamp: string; // ISO 8601
  formatted_time: string;
  chat_id: string;
  session_title: string;
  topic: string;
  rating: number; // 1 to 4
  status: "Correct" | "Partial" | "Incorrect";
  correctness: "correct" | "partial" | "incorrect";
  preview: string;
  user_query: string;
  assistant_response: string;
  response_time: number | null; // seconds
}

export interface ResponseTimeTrendPoint {
  id: string;
  chat_id: string;
  session_title: string;
  timestamp: string; // ISO 8601
  formatted_time: string;
  turn_index: number;
  response_time: number; // in seconds
  topic: string;
}

export interface RatingDistributionBar {
  rating: number; // 1, 2, 3, 4
  label: string; // "Poor", "Fair", "Good", "Excellent"
  count: number;
  percentage: number;
  color: string;
}

export interface LengthPreferenceSlice {
  type: "Short" | "To the Point" | "Lengthy";
  raw_type: "short" | "to_the_point" | "lengthy";
  count: number;
  percentage: number;
  avg_rating: number | null;
  color: string;
}

export interface AnalyticsGraphsPayload {
  topic_distribution: TopicDistributionSlice[];
  accuracy_by_topic: AccuracyByTopicPoint[];
  phase_accuracy: PhaseAccuracyPoint[];
  reply_correctness: ReplyCorrectnessPoint[];
  response_time_trend: ResponseTimeTrendPoint[];
  rating_distribution: RatingDistributionBar[];
  length_preference: LengthPreferenceSlice[];
  total_evaluations: number;
  total_measured_responses: number;
  average_latency: number | null;
}
