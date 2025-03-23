"use client";

import { useState, useEffect, useMemo } from "react";
import { Task } from "@/hooks/use-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskCategoryBadge } from "./task-category-badge";

interface TaskDependencyGraphProps {
  taskId: string;
  onOpenTask?: (taskId: string) => void;
}

interface TaskNode extends Task {
  level: number;
  dependsOn: string[];
  dependedOnBy: string[];
}

export function TaskDependencyGraph({
  taskId,
  onOpenTask,
}: TaskDependencyGraphProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskNodes, setTaskNodes] = useState<Record<string, TaskNode>>({});
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<number[]>([0, 1]); // Default expand current task and direct dependencies

  // Fetch task dependencies
  const fetchDependencyGraph = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch the current task
      const taskResponse = await fetch(`/api/tasks/${taskId}`);
      if (!taskResponse.ok) {
        throw new Error("Failed to fetch task");
      }
      const task = await taskResponse.json();
      setCurrentTask(task);

      // Start building the graph with the current task
      const nodes: Record<string, TaskNode> = {
        [taskId]: {
          ...task,
          level: 0,
          dependsOn: [],
          dependedOnBy: [],
        },
      };

      // Fetch dependencies (tasks this task depends on)
      const dependenciesResponse = await fetch(
        `/api/tasks/${taskId}/dependencies`
      );
      if (!dependenciesResponse.ok) {
        throw new Error("Failed to fetch dependencies");
      }
      const dependencies = await dependenciesResponse.json();

      // Add dependencies to the graph
      nodes[taskId].dependsOn = dependencies.map((dep: Task) => dep.id);

      for (const dep of dependencies) {
        nodes[dep.id] = {
          ...dep,
          level: 1,
          dependsOn: [],
          dependedOnBy: [taskId],
        };
      }

      // Fetch dependents (tasks that depend on this task)
      const dependentsResponse = await fetch(`/api/tasks/${taskId}/dependents`);
      if (dependentsResponse.ok) {
        const dependents = await dependentsResponse.json();

        // Add dependents to the graph
        nodes[taskId].dependedOnBy = dependents.map((dep: Task) => dep.id);

        for (const dep of dependents) {
          if (nodes[dep.id]) {
            nodes[dep.id].dependsOn.push(taskId);
          } else {
            nodes[dep.id] = {
              ...dep,
              level: 1,
              dependsOn: [taskId],
              dependedOnBy: [],
            };
          }
        }
      }

      setTaskNodes(nodes);
    } catch (err) {
      console.error("Error fetching dependency graph:", err);
      setError("Failed to load dependency graph");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencyGraph();
  }, [taskId]);

  // Toggle expanded level
  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  // Group tasks by level
  const tasksByLevel = useMemo(() => {
    const result: Record<number, TaskNode[]> = {};

    // Dependencies (tasks this task depends on)
    const dependencies = Object.values(taskNodes).filter(
      (node) => node.id !== taskId && currentTask?.dependsOn?.includes(node.id)
    );
    if (dependencies.length > 0) {
      result[-1] = dependencies;
    }

    // Current task
    if (currentTask) {
      result[0] = [taskNodes[taskId]];
    }

    // Dependents (tasks that depend on this task)
    const dependents = Object.values(taskNodes).filter(
      (node) => node.id !== taskId && node.dependsOn.includes(taskId)
    );
    if (dependents.length > 0) {
      result[1] = dependents;
    }

    return result;
  }, [taskNodes, taskId, currentTask]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Dependency Graph</h3>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Dependency Graph</h3>
          <Button variant="outline" size="sm" onClick={fetchDependencyGraph}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Dependency Graph</h3>
        <Button variant="outline" size="sm" onClick={fetchDependencyGraph}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-6">
            {/* Dependencies (tasks this task depends on) */}
            {tasksByLevel[-1] && tasksByLevel[-1].length > 0 && (
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleLevel(-1)}
                >
                  <Badge variant="outline" className="font-normal">
                    Dependencies ({tasksByLevel[-1].length})
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Tasks that must be completed first
                  </div>
                </div>

                {expandedLevels.includes(-1) && (
                  <div className="pl-4 border-l-2 border-muted space-y-2">
                    {tasksByLevel[-1].map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                        onClick={() => onOpenTask?.(task.id)}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {task.categoryId && (
                              <TaskCategoryBadge
                                categoryId={task.categoryId}
                                size="sm"
                                showTooltip={false}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Current task */}
            {currentTask && (
              <div className="p-3 rounded-md bg-accent/50 border border-accent">
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentTask.status)}
                  <div className="font-medium">{currentTask.title}</div>
                </div>
                {currentTask.description && (
                  <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {currentTask.description}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {currentTask.categoryId && (
                    <TaskCategoryBadge
                      categoryId={currentTask.categoryId}
                      size="sm"
                      showTooltip={false}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Dependents (tasks that depend on this task) */}
            {tasksByLevel[1] && tasksByLevel[1].length > 0 && (
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleLevel(1)}
                >
                  <Badge variant="outline" className="font-normal">
                    Dependents ({tasksByLevel[1].length})
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Tasks that depend on this task
                  </div>
                </div>

                {expandedLevels.includes(1) && (
                  <div className="pl-4 border-l-2 border-muted space-y-2">
                    {tasksByLevel[1].map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => onOpenTask?.(task.id)}
                      >
                        <div className="flex items-center gap-1">
                          <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {task.categoryId && (
                              <TaskCategoryBadge
                                categoryId={task.categoryId}
                                size="sm"
                                showTooltip={false}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* No dependencies or dependents */}
            {(!tasksByLevel[-1] || tasksByLevel[-1].length === 0) &&
              (!tasksByLevel[1] || tasksByLevel[1].length === 0) && (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  This task has no dependencies or dependents.
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
