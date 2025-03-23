"use client";

import { useRef } from "react";
import { TemplateItem } from "@/hooks/use-task-templates";
import { useDrag, useDrop } from "react-dnd";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  Tag,
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

// Define the item type for drag and drop
const ITEM_TYPE = "TEMPLATE_ITEM";

interface DraggableTemplateItemProps {
  item: TemplateItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDragEnd: () => Promise<void>;
  onEdit: (item: TemplateItem) => void;
  onDelete: (itemId: string) => Promise<boolean>;
}

export function DraggableTemplateItem({
  item,
  index,
  moveItem,
  onDragEnd,
  onEdit,
  onDelete,
}: DraggableTemplateItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Set up drag source
  const [{ isDragging }, drag, preview] = useDrag({
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
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // Initialize drag and drop refs
  drag(drop(ref));

  // Helper function for priority color
  const getPriorityColor = (priority?: string) => {
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
        isDragging && "opacity-50 bg-accent/50"
      )}
      data-handler-id={handlerId}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          ref={ref}
          className="mt-1 cursor-move touch-none flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Item content */}
        <div className="flex-1 min-w-0" onClick={() => onEdit(item)}>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium leading-none">{item.title}</h3>
            {item.priority && (
              <Badge
                variant="outline"
                className={cn("text-xs", getPriorityColor(item.priority))}
              >
                {item.priority}
              </Badge>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {item.estimatedPomodoros && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.estimatedPomodoros} pomodoros
              </span>
            )}
            {item.tags && item.tags.length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {item.tags.slice(0, 2).join(", ")}
                {item.tags.length > 2 && "..."}
              </span>
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
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => onDelete(item.id)}
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
