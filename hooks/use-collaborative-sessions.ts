"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/components/ui/use-toast";

interface CollaborativeSession {
  id: string;
  creatorId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  maxParticipants: number;
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  startTime: string | null;
  endTime: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  participantCount?: number;
  isParticipating?: boolean;
}

interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  joinedAt: string;
  leftAt: string | null;
  status: string;
  focusScore: number | null;
  completedIntervals: number;
  tasksCompleted: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface SessionMessage {
  id: string;
  sessionId: string;
  userId: string;
  message: string;
  type: string;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface UseCollaborativeSessionsOptions {
  status?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

export function useCollaborativeSessions(
  options: UseCollaborativeSessionsOptions = {}
) {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<CollaborativeSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSessions = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const {
        status = "active,scheduled",
        isPublic = true,
        limit = 20,
        offset = 0,
      } = options;

      const queryParams = new URLSearchParams({
        status,
        isPublic: isPublic.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `/api/collaborative-sessions?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch collaborative sessions");
      }

      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching collaborative sessions:", err);
      setError("Failed to load collaborative sessions");

      toast({
        title: "Error",
        description: "Failed to load collaborative sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, options, toast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = async (sessionData: Partial<CollaborativeSession>) => {
    if (!isAuthenticated) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/collaborative-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create collaborative session"
        );
      }

      const newSession = await response.json();

      // Refresh the sessions list
      fetchSessions();

      toast({
        title: "Success",
        description: "Collaborative session created successfully",
      });

      return newSession;
    } catch (err: any) {
      console.error("Error creating collaborative session:", err);
      setError(err.message || "Failed to create collaborative session");

      toast({
        title: "Error",
        description: err.message || "Failed to create collaborative session",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sessions,
    isLoading,
    error,
    fetchSessions,
    createSession,
  };
}

export function useCollaborativeSession(sessionId: string) {
  const { isAuthenticated } = useAuth();
  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSession = useCallback(async () => {
    if (!isAuthenticated || !sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/collaborative-sessions/${sessionId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch collaborative session");
      }

      const data = await response.json();
      setSession(data);
      setParticipants(data.participants || []);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching collaborative session:", err);
      setError("Failed to load collaborative session");

      toast({
        title: "Error",
        description: "Failed to load collaborative session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, sessionId, toast]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const joinSession = async () => {
    if (!isAuthenticated || !sessionId) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/collaborative-sessions/${sessionId}/join`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join session");
      }

      // Refresh the session data
      fetchSession();

      toast({
        title: "Success",
        description: "Joined collaborative session successfully",
      });

      return true;
    } catch (err: any) {
      console.error("Error joining collaborative session:", err);
      setError(err.message || "Failed to join collaborative session");

      toast({
        title: "Error",
        description: err.message || "Failed to join collaborative session",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveSession = async () => {
    if (!isAuthenticated || !sessionId) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/collaborative-sessions/${sessionId}/leave`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to leave session");
      }

      toast({
        title: "Success",
        description: "Left collaborative session successfully",
      });

      return true;
    } catch (err: any) {
      console.error("Error leaving collaborative session:", err);
      setError(err.message || "Failed to leave collaborative session");

      toast({
        title: "Error",
        description: err.message || "Failed to leave collaborative session",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!isAuthenticated || !sessionId) return false;

    try {
      const response = await fetch(
        `/api/collaborative-sessions/${sessionId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // Update the local participant status
      fetchSession();

      return true;
    } catch (err: any) {
      console.error("Error updating status:", err);

      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });

      return false;
    }
  };

  const sendMessage = async (message: string, type: string = "chat") => {
    if (!isAuthenticated || !sessionId) return null;

    try {
      const response = await fetch(
        `/api/collaborative-sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, type }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const newMessage = await response.json();

      // Update the local messages
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      return newMessage;
    } catch (err: any) {
      console.error("Error sending message:", err);

      toast({
        title: "Error",
        description: err.message || "Failed to send message",
        variant: "destructive",
      });

      return null;
    }
  };

  const fetchMessages = async (limit: number = 50, before?: string) => {
    if (!isAuthenticated || !sessionId) return;

    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
      });

      if (before) {
        queryParams.append("before", before);
      }

      const response = await fetch(
        `/api/collaborative-sessions/${sessionId}/messages?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const newMessages = await response.json();

      if (before) {
        // Prepend older messages
        setMessages((prevMessages) => [...newMessages, ...prevMessages]);
      } else {
        // Replace with latest messages
        setMessages(newMessages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);

      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  return {
    session,
    participants,
    messages,
    isLoading,
    error,
    fetchSession,
    joinSession,
    leaveSession,
    updateStatus,
    sendMessage,
    fetchMessages,
  };
}
