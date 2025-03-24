"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { TaskStatus } from "./use-tasks";

interface UseBatchTasksProps {
  onSuccess?: () => void;
}

export function useBatchTasks({ onSuccess }: UseBatchTasksProps = {}) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Complete multiple tasks in a batch
  const completeBatchTasks = useCallback(
    async (taskIds: string[]) => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to complete tasks",
          variant: "destructive",
        });
        return false;
      }

      if (!taskIds.length) {
        toast({
          title: "No Tasks Selected",
          description: "Please select at least one task to complete",
          variant: "destructive",
        });
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Update each task to completed status
        const updatePromises = taskIds.map((taskId) =>
          fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "completed" as TaskStatus }),
          })
        );

        const results = await Promise.allSettled(updatePromises);

        // Check for failures
        const failures = results.filter(
          (result) => result.status === "rejected"
        ).length;

        if (failures > 0) {
          const successCount = taskIds.length - failures;

          toast({
            title: "Partial Success",
            description: `Completed ${successCount} tasks. Failed to complete ${failures} tasks.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Tasks Completed",
            description: `Successfully completed ${taskIds.length} tasks`,
          });
        }

        if (onSuccess) {
          onSuccess();
        }

        return failures === 0;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to complete tasks";
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
    },
    [isAuthenticated, toast, onSuccess]
  );

  // Delete multiple tasks in a batch
  const deleteBatchTasks = useCallback(
    async (taskIds: string[]) => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to delete tasks",
          variant: "destructive",
        });
        return false;
      }

      if (!taskIds.length) {
        toast({
          title: "No Tasks Selected",
          description: "Please select at least one task to delete",
          variant: "destructive",
        });
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Delete each task
        const deletePromises = taskIds.map((taskId) =>
          fetch(`/api/tasks/${taskId}`, {
            method: "DELETE",
          })
        );

        const results = await Promise.allSettled(deletePromises);

        // Check for failures
        const failures = results.filter(
          (result) => result.status === "rejected"
        ).length;

        if (failures > 0) {
          const successCount = taskIds.length - failures;

          toast({
            title: "Partial Success",
            description: `Deleted ${successCount} tasks. Failed to delete ${failures} tasks.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Tasks Deleted",
            description: `Successfully deleted ${taskIds.length} tasks`,
          });
        }

        if (onSuccess) {
          onSuccess();
        }

        return failures === 0;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete tasks";
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
    },
    [isAuthenticated, toast, onSuccess]
  );

  return {
    isLoading,
    error,
    completeBatchTasks,
    deleteBatchTasks,
  };
}
