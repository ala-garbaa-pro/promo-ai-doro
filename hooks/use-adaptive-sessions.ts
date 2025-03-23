"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface SessionRecommendation {
  recommendedWorkDuration: number;
  recommendedShortBreakDuration: number;
  recommendedLongBreakDuration: number;
  confidence: number;
  basedOn: {
    totalSessions: number;
    completedSessions: number;
    averageInterruptions: number;
    timeOfDay: string | null;
  };
}

interface UserFocusPattern {
  optimalTimeOfDay: string | null;
  optimalDuration: number | null;
  averageInterruptions: number;
  completionRate: number;
  mostProductiveDay: string | null;
  focusScore: number;
}

export function useAdaptiveSessions() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] =
    useState<SessionRecommendation | null>(null);
  const [focusPatterns, setFocusPatterns] = useState<UserFocusPattern | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch session recommendations
  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/adaptive-sessions/recommendations");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch session recommendations"
        );
      }

      const data = await response.json();
      setRecommendations(data);
      return data;
    } catch (err) {
      console.error("Error fetching session recommendations:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch session recommendations"
      );

      toast({
        title: "Error",
        description:
          "Failed to fetch session recommendations. Please try again later.",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user focus patterns
  const fetchFocusPatterns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/adaptive-sessions/focus-patterns");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch focus patterns");
      }

      const data = await response.json();
      setFocusPatterns(data);
      return data;
    } catch (err) {
      console.error("Error fetching focus patterns:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch focus patterns"
      );

      toast({
        title: "Error",
        description: "Failed to fetch focus patterns. Please try again later.",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Apply recommended settings to user's settings
  const applyRecommendedSettings = async () => {
    if (!recommendations) {
      toast({
        title: "Error",
        description: "No recommendations available to apply.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // This would typically update the user's settings in the database
      // For now, we'll just return the recommendations for the settings context to use
      return {
        pomodoroDuration: recommendations.recommendedWorkDuration,
        shortBreakDuration: recommendations.recommendedShortBreakDuration,
        longBreakDuration: recommendations.recommendedLongBreakDuration,
      };
    } catch (err) {
      console.error("Error applying recommended settings:", err);

      toast({
        title: "Error",
        description:
          "Failed to apply recommended settings. Please try again later.",
        variant: "destructive",
      });

      return false;
    }
  };

  return {
    recommendations,
    focusPatterns,
    isLoading,
    error,
    fetchRecommendations,
    fetchFocusPatterns,
    applyRecommendedSettings,
  };
}
