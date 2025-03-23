"use client";

import { useState } from "react";
import { TaskFilters, TaskPriority, TaskStatus } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFiltersProps {
  filters: TaskFilters;
  onApplyFilters: (filters: TaskFilters) => void;
}

export function TaskFiltersComponent({
  filters,
  onApplyFilters,
}: TaskFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<TaskFilters>(filters);

  // Reset filters
  const handleResetFilters = () => {
    setLocalFilters({});
  };

  // Apply filters
  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    setIsOpen(false);
  };

  // Update local filters
  const updateFilter = (key: keyof TaskFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined
  ).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground w-5 h-5 text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Tasks</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your task list
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.status || ""}
              onValueChange={(value) =>
                updateFilter(
                  "status",
                  value ? (value as TaskStatus) : undefined
                )
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={localFilters.priority || ""}
              onValueChange={(value) =>
                updateFilter(
                  "priority",
                  value ? (value as TaskPriority) : undefined
                )
              }
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Any priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={localFilters.category || ""}
              onChange={(e) =>
                updateFilter(
                  "category",
                  e.target.value ? e.target.value : undefined
                )
              }
              placeholder="Filter by category"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !localFilters.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.dueDate
                    ? format(new Date(localFilters.dueDate as string), "PPP")
                    : "Any date"}
                  {localFilters.dueDate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFilter("dueDate", undefined);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    localFilters.dueDate
                      ? new Date(localFilters.dueDate as string)
                      : undefined
                  }
                  onSelect={(date) =>
                    updateFilter("dueDate", date?.toISOString())
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <SheetFooter>
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
            <Button className="flex-1" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
