"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-provider";

// Task types
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

// Task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedPomodoros?: number;
  actualPomodoros?: number;
  dueDate?: Date | string;
  categoryId?: string;
  category?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringType?: "daily" | "weekly" | "monthly" | "yearly";
  recurringInterval?: number;
  recurringEndDate?: Date | string;
  parentTaskId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// New task input
export interface NewTask {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  estimatedPomodoros?: number;
  dueDate?: Date | string;
  categoryId?: string;
  category?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringType?: "daily" | "weekly" | "monthly" | "yearly";
  recurringInterval?: number;
  recurringEndDate?: Date | string;
  parentTaskId?: string;
}

// Task update input
export interface TaskUpdate extends Partial<NewTask> {
  actualPomodoros?: number;
}

// Filter options
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  dueDate?: Date | string;
}

export function useTasks() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.set("status", filters.status);
      if (filters.priority) queryParams.set("priority", filters.priority);
      if (filters.category) queryParams.set("category", filters.category);
      if (filters.dueDate) {
        const date = new Date(filters.dueDate);
        queryParams.set("dueDate", date.toISOString());
      }

      const queryString = queryParams.toString();
      const url = `/api/tasks${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch tasks";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, filters, toast]);

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create task
  const createTask = async (newTask: NewTask) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create tasks",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create task");
      }

      const createdTask = await response.json();
      setTasks((prev) => [...prev, createdTask]);

      toast({
        title: "Task Created",
        description: "Your task has been created successfully",
      });

      return createdTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create task";
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

  // Update task
  const updateTask = async (taskId: string, updates: TaskUpdate) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update tasks",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update task");
      }

      const updatedTask = await response.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );

      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully",
      });

      return updatedTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update task";
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

  // Delete task
  const deleteTask = async (taskId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete tasks",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete task");
      }

      setTasks((prev) => prev.filter((task) => task.id !== taskId));

      toast({
        title: "Task Deleted",
        description: "Your task has been deleted successfully",
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete task";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    return updateTask(taskId, { status });
  };

  // Update task priority
  const updateTaskPriority = async (taskId: string, priority: TaskPriority) => {
    return updateTask(taskId, { priority });
  };

  // Set filters
  const setTaskFilters = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  return {
    tasks,
    isLoading,
    error,
    filters,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    setTaskFilters,
  };
}
