"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, X, ArrowRight } from "lucide-react";
import { Task } from "@/hooks/use-tasks";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface TaskDependenciesProps {
  taskId: string;
  dependencies: string[];
  onAddDependency: (dependencyId: string) => Promise<void>;
  onRemoveDependency: (dependencyId: string) => Promise<void>;
}

export function TaskDependencies({
  taskId,
  dependencies,
  onAddDependency,
  onRemoveDependency,
}: TaskDependenciesProps) {
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Fetch available tasks
  useEffect(() => {
    if (!isDialogOpen) return;

    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();

        // Filter out the current task and existing dependencies
        const filteredTasks = data.filter(
          (task: Task) => task.id !== taskId && !dependencies.includes(task.id)
        );

        setAvailableTasks(filteredTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [isDialogOpen, taskId, dependencies]);

  // Filter tasks by search query
  const filteredTasks = availableTasks.filter((task) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      (task.category && task.category.toLowerCase().includes(query))
    );
  });

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Add selected dependencies
  const handleAddDependencies = async () => {
    if (selectedTaskIds.length === 0) return;

    try {
      // Add each dependency one by one
      for (const dependencyId of selectedTaskIds) {
        await onAddDependency(dependencyId);
      }

      setSelectedTaskIds([]);
      setIsDialogOpen(false);

      toast({
        title: "Dependencies added",
        description: `${selectedTaskIds.length} dependencies have been added.`,
      });
    } catch (err) {
      console.error("Error adding dependencies:", err);
      toast({
        title: "Error",
        description: "Failed to add dependencies. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Remove dependency
  const handleRemoveDependency = async (dependencyId: string) => {
    try {
      await onRemoveDependency(dependencyId);

      toast({
        title: "Dependency removed",
        description: "Dependency has been removed.",
      });
    } catch (err) {
      console.error("Error removing dependency:", err);
      toast({
        title: "Error",
        description: "Failed to remove dependency. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Dependencies</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {dependencies.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No dependencies added yet
        </div>
      ) : (
        <ul className="space-y-2">
          {dependencies.map((dependencyId) => (
            <li
              key={dependencyId}
              className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
            >
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  {/* We would need to fetch the task title here */}
                  Task {dependencyId.substring(0, 8)}...
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleRemoveDependency(dependencyId)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Add Dependencies Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Dependencies</DialogTitle>
            <DialogDescription>
              Select tasks that must be completed before this task can be
              started.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {error}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {searchQuery
                  ? "No tasks found matching your search"
                  : "No available tasks to add as dependencies"}
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={selectedTaskIds.includes(task.id)}
                        onCheckedChange={() => toggleTaskSelection(task.id)}
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {task.description}
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDependencies}
              disabled={selectedTaskIds.length === 0}
            >
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
