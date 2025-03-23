"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Tag,
  Flag,
  Loader2,
} from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskDependencies } from "@/components/tasks/task-dependencies";
import { RecurringTaskSettings } from "@/components/tasks/recurring-task-settings";
import { TaskCategorySelector } from "@/components/tasks/task-category-selector";
import { TaskCategoryBadge } from "@/components/tasks/task-category-badge";
import { TaskDependencyGraph } from "@/components/tasks/task-dependency-graph";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskDetails({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: TaskDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "medium"
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status || "pending");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState<number>(
    task?.estimatedPomodoros || 1
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );
  const [categoryId, setCategoryId] = useState<string | undefined>(
    task?.categoryId
  );
  const [category, setCategory] = useState(task?.category || "");
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [tagInput, setTagInput] = useState("");

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Dependencies state
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [isDependenciesLoading, setIsDependenciesLoading] = useState(false);

  // Recurring task state
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false);
  const [recurringType, setRecurringType] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >((task?.recurringType as any) || "daily");
  const [recurringInterval, setRecurringInterval] = useState(
    task?.recurringInterval || 1
  );
  const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(
    task?.recurringEndDate ? new Date(task.recurringEndDate) : undefined
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch task categories
  useEffect(() => {
    if (!task) return;

    const fetchTaskCategories = async () => {
      try {
        const response = await fetch(`/api/tasks/${task.id}/categories`);
        if (response.ok) {
          const data = await response.json();
          setSelectedCategoryIds(data.map((cat: Category) => cat.id));
        }
      } catch (error) {
        console.error("Error fetching task categories:", error);
      }
    };

    fetchTaskCategories();
  }, [task]);

  // Fetch dependencies
  useEffect(() => {
    if (!task) return;

    const fetchDependencies = async () => {
      setIsDependenciesLoading(true);
      try {
        const response = await fetch(`/api/tasks/${task.id}/dependencies`);
        if (response.ok) {
          const data = await response.json();
          setDependencies(data.map((dep: Task) => dep.id));
        }
      } catch (error) {
        console.error("Error fetching dependencies:", error);
      } finally {
        setIsDependenciesLoading(false);
      }
    };

    fetchDependencies();
  }, [task]);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setStatus(task.status);
      setEstimatedPomodoros(task.estimatedPomodoros || 1);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setCategoryId(task.categoryId);
      setCategory(task.category || "");
      setTags(task.tags || []);
      setIsRecurring(task.isRecurring || false);
      setRecurringType((task.recurringType as any) || "daily");
      setRecurringInterval(task.recurringInterval || 1);
      setRecurringEndDate(
        task.recurringEndDate ? new Date(task.recurringEndDate) : undefined
      );
    }
  });

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Add dependency
  const handleAddDependency = async (dependencyId: string) => {
    if (!task) return;

    const response = await fetch(`/api/tasks/${task.id}/dependencies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dependsOnTaskId: dependencyId }),
    });

    if (response.ok) {
      setDependencies([...dependencies, dependencyId]);
    } else {
      const error = await response.json();
      throw new Error(error.error || "Failed to add dependency");
    }
  };

  // Remove dependency
  const handleRemoveDependency = async (dependencyId: string) => {
    if (!task) return;

    const response = await fetch(
      `/api/tasks/${task.id}/dependencies/${dependencyId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      setDependencies(dependencies.filter((id) => id !== dependencyId));
    } else {
      const error = await response.json();
      throw new Error(error.error || "Failed to remove dependency");
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!task) return;
    if (!title.trim()) return;

    setIsLoading(true);

    try {
      // Save task details
      await onSave({
        id: task.id,
        title,
        description: description || undefined,
        priority,
        status,
        estimatedPomodoros,
        dueDate: dueDate?.toISOString(),
        categoryId, // Keep for backward compatibility
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        isRecurring,
        recurringType: isRecurring ? recurringType : undefined,
        recurringInterval: isRecurring ? recurringInterval : undefined,
        recurringEndDate:
          isRecurring && recurringEndDate
            ? recurringEndDate.toISOString()
            : undefined,
      });

      // Save task categories
      if (selectedCategoryIds.length > 0 || categoryId) {
        try {
          // Use PUT to replace all categories
          await fetch(`/api/tasks/${task.id}/categories`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              categoryIds: selectedCategoryIds,
            }),
          });
        } catch (error) {
          console.error("Error saving task categories:", error);
        }
      }

      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!task) return;

    setIsLoading(true);

    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Edit the details of your task."
              : "Create a new task to track."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}
              >
                <SelectTrigger id="priority">
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as TaskStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pomodoros">Estimated Pomodoros</Label>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() =>
                    setEstimatedPomodoros(Math.max(1, estimatedPomodoros - 1))
                  }
                  disabled={estimatedPomodoros <= 1}
                >
                  -
                </Button>
                <Input
                  id="pomodoros"
                  type="number"
                  min={1}
                  value={estimatedPomodoros}
                  onChange={(e) =>
                    setEstimatedPomodoros(
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  className="h-8 rounded-none text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => setEstimatedPomodoros(estimatedPomodoros + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categories">Categories</Label>
            <div className="mt-1">
              {/* Import the TaskCategorySelector component */}
              {task && (
                <TaskCategorySelector
                  selectedCategoryIds={selectedCategoryIds}
                  onCategoriesChange={setSelectedCategoryIds}
                  maxCategories={5}
                />
              )}
            </div>
          </div>

          <Tabs defaultValue="basic" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-primary hover:text-primary/80"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="mt-4">
              <div className="grid gap-4">
                {task && (
                  <div className="space-y-6">
                      <TaskDependencies
                        taskId={task.id}
                        dependencies={dependencies}
                        onAddDependency={handleAddDependency}
                        onRemoveDependency={handleRemoveDependency}
                      />

                      <TaskDependencyGraph
                        taskId={task.id}
                        onOpenTask={(taskId) => {
                          // Close current dialog and open the selected task
                          onClose();
                          // We need to wait for the current dialog to close
                          setTimeout(() => {
                            // Fetch the task and open it
                            fetch(`/api/tasks/${taskId}`)
                              .then((response) => response.json())
                              .then((task) => {
                                if (task && !task.error) {
                                  onOpenTask?.(task);
                                }
                              })
                              .catch((error) => {
                                console.error("Error fetching task:", error);
                              });
                          }, 300);
                        }}
                      />
                    </div>

                    <RecurringTaskSettings
                      isRecurring={isRecurring}
                      recurringType={recurringType}
                      recurringInterval={recurringInterval}
                      recurringEndDate={recurringEndDate}
                      onSettingsChange={(settings) => {
                        setIsRecurring(settings.isRecurring);
                        if (settings.recurringType)
                          setRecurringType(settings.recurringType);
                        if (settings.recurringInterval)
                          setRecurringInterval(settings.recurringInterval);
                        setRecurringEndDate(settings.recurringEndDate);
                      }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between">
          {task && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !title.trim()}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
