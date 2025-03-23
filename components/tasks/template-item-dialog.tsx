"use client";

import { useState, useEffect } from "react";
import { TemplateItem } from "@/hooks/use-task-templates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TemplateItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: TemplateItem | null;
  onSave: (item: Partial<TemplateItem>) => Promise<boolean>;
  isSubmitting: boolean;
}

export function TemplateItemDialog({
  isOpen,
  onOpenChange,
  item,
  onSave,
  isSubmitting,
}: TemplateItemDialogProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<TemplateItem>>({
    title: "",
    description: "",
    priority: "medium",
    estimatedPomodoros: 1,
    tags: [],
  });

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || "",
        priority: item.priority || "medium",
        estimatedPomodoros: item.estimatedPomodoros || 1,
        tags: item.tags || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        estimatedPomodoros: 1,
        tags: [],
      });
    }
    setTagInput("");
  }, [item, isOpen]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  // Add a tag
  const addTag = (tag: string) => {
    if (!tag) return;

    const currentTags = formData.tags || [];
    if (!currentTags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...currentTags, tag],
      }));
    }
    setTagInput("");
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags || [];
    setFormData((prev) => ({
      ...prev,
      tags: currentTags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    await onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {item ? "Edit Template Item" : "Add Template Item"}
            </DialogTitle>
            <DialogDescription>
              {item
                ? "Update the details of this template item"
                : "Add a new item to your template"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Item title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Item description"
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleSelectChange("priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estimatedPomodoros">Estimated Pomodoros</Label>
                <Input
                  id="estimatedPomodoros"
                  name="estimatedPomodoros"
                  type="number"
                  min="1"
                  value={formData.estimatedPomodoros}
                  onChange={handleNumberChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 rounded-full hover:bg-accent/50 p-0.5"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tag}</span>
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag and press Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addTag(tagInput.trim())}
                  disabled={!tagInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {item ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {item ? "Update Item" : "Create Item"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
