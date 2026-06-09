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
    time: string;
    topic: string;
    preview: string;
    feedback: "up" | "down" | "none";
    status: string;
    rating: number;
  }>;
  topics: Array<{
    cluster: number;
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
