"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { TemplateItem } from "./use-task-templates";

export function useTemplateItems(templateId: string) {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all items for a template
  const fetchItems = useCallback(async () => {
    if (!templateId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/task-templates/${templateId}/items`);

      if (!response.ok) {
        throw new Error("Failed to fetch template items");
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching template items:", err);
      setError("Failed to load template items");
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  // Create a new item
  const createItem = useCallback(
    async (item: Partial<TemplateItem>) => {
      if (!templateId) return null;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/task-templates/${templateId}/items`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create item");
        }

        const newItem = await response.json();
        setItems((prev) => [...prev, newItem]);

        toast({
          title: "Item created",
          description: "Your template item has been created successfully.",
        });

        return newItem;
      } catch (err) {
        console.error("Error creating item:", err);
        setError("Failed to create item");

        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to create item",
          variant: "destructive",
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [templateId, toast]
  );

  // Update an item
  const updateItem = useCallback(
    async (itemId: string, item: Partial<TemplateItem>) => {
      if (!templateId) return null;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/task-templates/${templateId}/items/${itemId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update item");
        }

        const updatedItem = await response.json();
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? updatedItem : i))
        );

        toast({
          title: "Item updated",
          description: "Your template item has been updated successfully.",
        });

        return updatedItem;
      } catch (err) {
        console.error("Error updating item:", err);
        setError("Failed to update item");

        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to update item",
          variant: "destructive",
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [templateId, toast]
  );

  // Delete an item
  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!templateId) return false;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/task-templates/${templateId}/items/${itemId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete item");
        }

        setItems((prev) => prev.filter((i) => i.id !== itemId));

        toast({
          title: "Item deleted",
          description: "Your template item has been deleted successfully.",
        });

        return true;
      } catch (err) {
        console.error("Error deleting item:", err);
        setError("Failed to delete item");

        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to delete item",
          variant: "destructive",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [templateId, toast]
  );

  // Reorder items
  const reorderItems = useCallback(
    async (reorderedItems: TemplateItem[]) => {
      if (!templateId) return false;

      setIsLoading(true);
      setError(null);

      try {
        // Optimistically update the UI
        setItems(reorderedItems);

        const response = await fetch(
          `/api/task-templates/${templateId}/items/reorder`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: reorderedItems }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to reorder items");
        }

        return true;
      } catch (err) {
        console.error("Error reordering items:", err);
        setError("Failed to reorder items");

        // Revert the optimistic update
        fetchItems();

        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to reorder items",
          variant: "destructive",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [templateId, fetchItems, toast]
  );

  // Load items on mount and when templateId changes
  useEffect(() => {
    if (templateId) {
      fetchItems();
    }
  }, [templateId, fetchItems]);

  return {
    items,
    isLoading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
}
