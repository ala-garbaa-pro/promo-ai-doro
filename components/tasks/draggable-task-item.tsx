"use client";

import { useRef } from "react";
import { Task, TaskStatus, TaskPriority } from "@/hooks/use-tasks";
import { useDrag, useDrop } from "react-dnd";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Clock,
  GripVertical,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Define the item type for drag and drop
const ITEM_TYPE = "TASK";

interface DraggableTaskItemProps {
  task: Task;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onDragEnd: () => Promise<void>;
  toggleTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  openTaskDetails: (task: Task) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isDragDisabled?: boolean;
}

export function DraggableTaskItem({
  task,
  index,
  moveTask,
  onDragEnd,
  toggleTaskStatus,
  deleteTask,
  openTaskDetails,
  isSelected = false,
  onToggleSelect,
  isDragDisabled = false,
}: DraggableTaskItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Set up drag source
  const [{ isDragging }, drag, preview] = useDrag({
    canDrag: !isDragDisabled,
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        onDragEnd();
      }
    },
  });

  // Set up drop target
  const [{ handlerId }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the item's height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveTask(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // Initialize drag and drop refs
  drag(drop(ref));

  // Helper functions for UI
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "cancelled":
        return <Circle className="h-5 w-5 text-gray-400 line-through" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div
      ref={preview}
      className={cn(
        "p-4 hover:bg-accent/50 transition-colors",
        isDragging && "opacity-50 bg-accent/50",
        isSelected && "bg-accent/70"
      )}
      data-handler-id={handlerId}
    >
      <div className="flex items-start gap-3">
        {/* Selection checkbox or drag handle */}
        {onToggleSelect ? (
          <div className="mt-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-5 w-5 p-0",
                isSelected
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={onToggleSelect}
            >
              <div
                className={cn(
                  "h-4 w-4 rounded-sm border",
                  isSelected
                    ? "bg-primary border-primary"
                    : "border-muted-foreground"
                )}
              >
                {isSelected && (
                  <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
            </Button>
          </div>
        ) : (
          <div
            ref={ref}
            className={cn(
              "mt-1 touch-none flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors",
              isDragDisabled ? "cursor-default" : "cursor-move"
            )}
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}

        {/* Status toggle */}
        <button
          onClick={() => toggleTaskStatus(task.id, task.status)}
          className="mt-1 flex-shrink-0"
        >
          {getStatusIcon(task.status)}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0" onClick={() => openTaskDetails(task)}>
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-sm font-medium leading-none",
                task.status === "completed" &&
                  "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            {task.priority && (
              <Badge
                variant="outline"
                className={cn("text-xs", getPriorityColor(task.priority))}
              >
                {task.priority}
              </Badge>
            )}
          </div>
          {task.description && (
            <p
              className={cn(
                "text-xs text-muted-foreground mt-1 line-clamp-1",
                task.status === "completed" && "line-through"
              )}
            >
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {task.dueDate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(task.dueDate), "MMM d, yyyy")}
              </span>
            )}
            {task.estimatedPomodoros && (
              <span className="text-xs text-muted-foreground">
                {task.estimatedPomodoros} pomodoros
              </span>
            )}
            {task.category && (
              <Badge variant="secondary" className="text-xs">
                {task.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openTaskDetails(task)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
