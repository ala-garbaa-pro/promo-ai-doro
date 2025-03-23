"use client";

import { useState, useEffect } from "react";
import { Task, TaskPriority, TaskStatus } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  MoreVertical,
  Clock,
  Calendar,
  Flag,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskCategoryBadges } from "./task-category-badge";

interface TaskItemProps {
  task: Task;
  toggleTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  openTaskDetails: (task: Task) => void;
}

export function TaskItem({
  task,
  toggleTaskStatus,
  deleteTask,
  openTaskDetails,
}: TaskItemProps) {
  const [taskCategories, setTaskCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch task categories
  useEffect(() => {
    const fetchTaskCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch(`/api/tasks/${task.id}/categories`);
        if (response.ok) {
          const data = await response.json();
          setTaskCategories(data.map((cat: any) => cat.id));
        }
      } catch (error) {
        console.error("Error fetching task categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchTaskCategories();
  }, [task.id]);

  // Get status icon
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <button
          onClick={() => toggleTaskStatus(task.id, task.status)}
          className="mt-1 flex-shrink-0"
        >
          {getStatusIcon(task.status)}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-base leading-tight mb-1">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Task options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => openTaskDetails(task)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Clock className="h-4 w-4 mr-2" />
                  Start Timer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Categories */}
            {taskCategories.length > 0 && (
              <TaskCategoryBadges
                categoryIds={taskCategories}
                size="sm"
                maxDisplay={2}
              />
            )}

            {/* Priority */}
            {task.priority && (
              <div className="flex items-center">
                <Flag
                  className={`h-3.5 w-3.5 mr-1 ${getPriorityColor(
                    task.priority
                  )}`}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {task.priority}
                </span>
              </div>
            )}

            {/* Estimated Pomodoros */}
            {task.estimatedPomodoros && (
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {task.estimatedPomodoros}{" "}
                  {task.estimatedPomodoros === 1 ? "pomodoro" : "pomodoros"}
                </span>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(task.dueDate), "MMM d")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
