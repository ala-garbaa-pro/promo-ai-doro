"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/components/ui/use-toast";

interface SessionData {
  id: string;
  type: "work" | "short_break" | "long_break";
  duration: number;
  startedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  wasInterrupted?: boolean;
  interruptionCount?: number;
  notes?: string;
}

interface UseSessionPersistenceProps {
  onSessionComplete?: (sessionData: SessionData) => void;
}

export function useSessionPersistence({
  onSessionComplete,
}: UseSessionPersistenceProps = {}) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<SessionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start a new session
  const startSession = async (
    type: "work" | "short_break" | "long_break",
    duration: number
  ) => {
    if (!isAuthenticated || !user) {
      // Allow anonymous sessions, but they won't be persisted
      const anonymousSession: SessionData = {
        id: `anonymous-${Date.now()}`,
        type,
        duration,
        startedAt: new Date(),
        isCompleted: false,
      };
      setCurrentSession(anonymousSession);
      return anonymousSession;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          duration,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start session");
      }

      const sessionData = await response.json();
      setCurrentSession(sessionData);
      return sessionData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start session";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Create a local session as fallback
      const fallbackSession: SessionData = {
        id: `fallback-${Date.now()}`,
        type,
        duration,
        startedAt: new Date(),
        isCompleted: false,
      };
      setCurrentSession(fallbackSession);
      return fallbackSession;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete a session
  const completeSession = async (
    sessionId: string,
    wasInterrupted: boolean = false,
    interruptionCount: number = 0,
    notes?: string
  ) => {
    // If it's an anonymous or fallback session, just update locally
    if (
      sessionId.startsWith("anonymous-") ||
      sessionId.startsWith("fallback-")
    ) {
      if (currentSession && currentSession.id === sessionId) {
        const completedSession: SessionData = {
          ...currentSession,
          completedAt: new Date(),
          isCompleted: true,
          wasInterrupted,
          interruptionCount,
          notes,
        };

        setCurrentSession(completedSession);

        if (onSessionComplete) {
          onSessionComplete(completedSession);
        }

        return completedSession;
      }
      return null;
    }

    // Otherwise, persist to the server
    if (!isAuthenticated || !user) {
      setError("User not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wasInterrupted,
          interruptionCount,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to complete session");
      }

      const sessionData = await response.json();
      setCurrentSession(sessionData);

      if (onSessionComplete) {
        onSessionComplete(sessionData);
      }

      return sessionData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete session";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get recent sessions
  const getRecentSessions = async (limit: number = 5) => {
    if (!isAuthenticated || !user) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions?limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get recent sessions");
      }

      return await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get recent sessions";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get daily completed pomodoros
  const getDailyCompletedPomodoros = async () => {
    if (!isAuthenticated || !user) {
      return 0;
    }

    setIsLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `/api/sessions?type=work&isCompleted=true&startDate=${today}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || "Failed to get daily completed pomodoros"
        );
      }

      const sessions = await response.json();
      return sessions.length;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to get daily completed pomodoros";
      setError(errorMessage);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentSession,
    isLoading,
    error,
    startSession,
    completeSession,
    getRecentSessions,
    getDailyCompletedPomodoros,
  };
}
