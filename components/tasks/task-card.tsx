"use client";

import { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "@/hooks/use-tasks";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
  Timer,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskCategoryBadges } from "./task-category-badge";
import { AnimatedTransition } from "@/components/ui/animated-transition";

interface TaskCardProps {
  task: Task;
  toggleTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  openTaskDetails: (task: Task) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function TaskCard({
  task,
  toggleTaskStatus,
  deleteTask,
  openTaskDetails,
  isSelected,
  onToggleSelect,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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
        return "text-muted-foreground";
    }
  };

  // Get status icon
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <Circle className="h-5 w-5 text-muted-foreground" />;
      case "in_progress":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 h-full flex flex-col",
        isHovered && "shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <button
            onClick={() => toggleTaskStatus(task.id, task.status)}
            className="mt-1 flex-shrink-0"
            aria-label={`Mark task as ${
              task.status === "completed" ? "incomplete" : "complete"
            }`}
          >
            {getStatusIcon(task.status)}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base leading-tight mb-1 line-clamp-2">
              {task.title}
            </h3>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Task options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => openTaskDetails(task)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toggleTaskStatus(task.id, task.status)}
            >
              {task.status === "completed" ? (
                <>
                  <Circle className="h-4 w-4 mr-2" />
                  Mark as Pending
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Completed
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteTask(task.id)}
              className="text-red-500 focus:text-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="px-4 py-2 flex-1">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {task.description}
          </p>
        )}

        {task.categoryId && (
          <div className="mb-3">
            <TaskCategoryBadges categoryIds={[task.categoryId]} />
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 border-t flex flex-wrap gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Flag className={cn("h-4 w-4", getPriorityColor(task.priority))} />
          <span className="text-xs text-muted-foreground capitalize">
            {task.priority} priority
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.estimatedPomodoros && (
            <div className="flex items-center gap-1">
              <Timer className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {task.estimatedPomodoros} pomodoros
              </span>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
