"use client";

import { useState, useEffect } from "react";

export interface AnalyticsData {
  summary: {
    total_feedback: number;
    average_rating: number;
    last_updated: string;
  };
  stats: {
    ratings: Record<string, number>;
    correctness: Record<string, number>;
    length_distribution: Record<string, number>;
  };
  trends: Array<{
    day: string;
    total: number;
    helpful: number;
    accuracy: number;
  }>;
  recent_feedback: Array<{
    id?: string;
    time: string;
    topic: string;
    preview: string;
    user_query?: string;
    model_response?: string;
    feedback: "up" | "down" | "none";
    status: string;
    rating: number;
    correctness?: string;
    length_type?: string;
  }>;

  topics: Array<{
    cluster: number;
    name?: string;
    keywords: string[];
    count: number;
  }>;

  raw_data_count: number;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:5001/api/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Live auto-refresh polling every 5 seconds for real-time analytics updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}

