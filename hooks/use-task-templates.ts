"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface TaskTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  estimatedPomodoros?: number;
  categoryId?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringType?: string;
  recurringInterval?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateItem {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  estimatedPomodoros?: number;
  categoryId?: string;
  tags?: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function useTaskTemplates() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all templates
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/task-templates");

      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new template
  const createTemplate = useCallback(
    async (template: Partial<TaskTemplate>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/task-templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(template),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create template");
        }

        const newTemplate = await response.json();
        setTemplates((prev) => [newTemplate, ...prev]);

        toast({
          title: "Template created",
          description: "Your task template has been created successfully.",
        });

        return newTemplate;
      } catch (err) {
        console.error("Error creating template:", err);
        setError("Failed to create template");

        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to create template",
          variant: "destructive",
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Update a template
  const updateTemplate = useCallback(
    async (id: string, template: Partial<TaskTemplate>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/task-templates/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(template),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update template");
        }

        const updatedTemplate = await response.json();
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? updatedTemplate : t))
        );

        toast({
          title: "Template updated",
          description: "Your task template has been updated successfully.",
        });

        return updatedTemplate;
      } catch (err) {
        console.error("Error updating template:", err);
        setError("Failed to update template");

        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to update template",
          variant: "destructive",
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Delete a template
  const deleteTemplate = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/task-templates/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete template");
        }

        setTemplates((prev) => prev.filter((t) => t.id !== id));

        toast({
          title: "Template deleted",
          description: "Your task template has been deleted successfully.",
        });

        return true;
      } catch (err) {
        console.error("Error deleting template:", err);
        setError("Failed to delete template");

        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to delete template",
          variant: "destructive",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Apply a template to create tasks
  const applyTemplate = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/task-templates/${id}/apply`, {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to apply template");
        }

        const result = await response.json();

        toast({
          title: "Template applied",
          description:
            result.message || "Tasks have been created from the template.",
        });

        return true;
      } catch (err) {
        console.error("Error applying template:", err);
        setError("Failed to apply template");

        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to apply template",
          variant: "destructive",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
  };
}
