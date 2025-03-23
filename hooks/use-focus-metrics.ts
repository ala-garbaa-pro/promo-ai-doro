"use client";

import { useState, useEffect } from "react";

export interface FocusMetrics {
  focusScore: number;
  completedSessions: number;
  totalFocusTime: number; // in minutes
  averageSessionLength: number; // in minutes
  streak: number;
  mostProductiveTime: string;
  completedTasks: number;
  interruptionRate: number; // average interruptions per session
  focusTrend: "improving" | "stable" | "declining";
  recommendedSessionLength: number; // in minutes
  recommendedBreakLength: number; // in minutes
}

export function useFocusMetrics() {
  const [metrics, setMetrics] = useState<FocusMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analytics/focus");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch focus metrics: ${response.statusText}`
        );
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching focus metrics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch focus metrics"
      );
      setMetrics(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
  };
}
