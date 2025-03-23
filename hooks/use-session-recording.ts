"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface SessionData {
  type: "work" | "short-break" | "long-break";
  duration: number;
  startedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  wasInterrupted: boolean;
  interruptionCount: number;
  notes?: string;
}

export function useSessionRecording() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start recording a session
  const startRecordingSession = async (
    type: "work" | "short-break" | "long-break",
    duration: number
  ): Promise<string | null> => {
    try {
      setIsRecording(true);
      setError(null);

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          duration,
          startedAt: new Date(),
          isCompleted: false,
          wasInterrupted: false,
          interruptionCount: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start session recording");
      }

      const data = await response.json();
      setCurrentSessionId(data.id);
      return data.id;
    } catch (err) {
      console.error("Error starting session recording:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start session recording"
      );

      // Show toast notification
      toast({
        title: "Session Recording Error",
        description:
          "Failed to start session recording. Your progress will not be saved.",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsRecording(false);
    }
  };

  // Complete a session recording
  const completeSessionRecording = async (
    sessionId: string,
    wasInterrupted: boolean = false,
    interruptionCount: number = 0,
    notes?: string
  ): Promise<boolean> => {
    if (!sessionId) {
      return false;
    }

    try {
      setIsRecording(true);
      setError(null);

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completedAt: new Date(),
          isCompleted: true,
          wasInterrupted,
          interruptionCount,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to complete session recording"
        );
      }

      setCurrentSessionId(null);
      return true;
    } catch (err) {
      console.error("Error completing session recording:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete session recording"
      );

      // Show toast notification
      toast({
        title: "Session Recording Error",
        description: "Failed to save your completed session.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsRecording(false);
    }
  };

  // Cancel a session recording
  const cancelSessionRecording = async (
    sessionId: string
  ): Promise<boolean> => {
    if (!sessionId) {
      return false;
    }

    try {
      setIsRecording(true);
      setError(null);

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to cancel session recording"
        );
      }

      setCurrentSessionId(null);
      return true;
    } catch (err) {
      console.error("Error canceling session recording:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel session recording"
      );
      return false;
    } finally {
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    currentSessionId,
    error,
    startRecordingSession,
    completeSessionRecording,
    cancelSessionRecording,
  };
}
