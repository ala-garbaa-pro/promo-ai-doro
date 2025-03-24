"use client";

import { useState } from "react";
import { Task, TaskStatus, TaskPriority } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  CheckSquare,
  X,
  SortAsc,
  SortDesc,
  Loader2,
  Flag,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { AnimatedGrid } from "@/components/ui/animated-grid";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";

interface TaskGridProps {
  tasks: Task[];
  toggleTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  openTaskDetails: (task: Task) => void;
  isLoading?: boolean;
  title?: string;
  showHeader?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showBatchActions?: boolean;
  emptyStateMessage?: string;
  onBatchComplete?: (taskIds: string[]) => Promise<void>;
  onBatchDelete?: (taskIds: string[]) => Promise<void>;
}

type SortField = "title" | "priority" | "dueDate" | "createdAt" | "order";
type SortDirection = "asc" | "desc";

export function TaskGrid({
  tasks,
  toggleTaskStatus,
  deleteTask,
  openTaskDetails,
  isLoading = false,
  title = "Tasks",
  showHeader = true,
  showSearch = true,
  showFilters = true,
  showBatchActions = true,
  emptyStateMessage = "No tasks found",
  onBatchComplete,
  onBatchDelete,
}: TaskGridProps) {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>(
    []
  );
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [sortField, setSortField] = useState<SortField>("order");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // State for batch operations
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBatchActionsOpen, setIsBatchActionsOpen] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Filter and sort tasks
  const filteredTasks = filterAndSortTasks(tasks);

  function filterAndSortTasks(taskList: Task[]): Task[] {
    // First filter
    let filtered = taskList;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(term) ||
          (task.description && task.description.toLowerCase().includes(term))
      );
    }

    // Apply priority filter
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter((task) =>
        selectedPriorities.includes(task.priority)
      );
    }

    // Apply status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((task) =>
        selectedStatuses.includes(task.status)
      );
    }

    // Then sort
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "priority": {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison =
            (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
          break;
        }
        case "dueDate":
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else
            comparison =
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "order":
        default:
          comparison = a.order - b.order;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }

  // Toggle task selection for batch operations
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Select or deselect all tasks
  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((task) => task.id));
    }
  };

  // Handle batch complete
  const handleBatchComplete = async () => {
    if (!onBatchComplete || selectedTaskIds.length === 0) return;

    setIsProcessingBatch(true);
    try {
      await onBatchComplete(selectedTaskIds);
      setSelectedTaskIds([]);
    } catch (error) {
      console.error("Error completing tasks in batch:", error);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Handle batch delete
  const handleBatchDelete = async () => {
    if (!onBatchDelete || selectedTaskIds.length === 0) return;

    setIsProcessingBatch(true);
    try {
      await onBatchDelete(selectedTaskIds);
      setSelectedTaskIds([]);
    } catch (error) {
      console.error("Error deleting tasks in batch:", error);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setSortField("order");
    setSortDirection("asc");
  };

  // Toggle sort direction or change sort field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Render empty state
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{emptyStateMessage}</p>
        </CardContent>
      </Card>
    );
  }

  // Determine if we should show filtered empty state
  const showFilteredEmptyState = filteredTasks.length === 0 && tasks.length > 0;

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-xl">{title}</CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              {showSearch && (
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9 w-full sm:w-[200px]"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}

              {/* Filters dropdown */}
              {showFilters && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={selectedPriorities.includes("high")}
                      onCheckedChange={(checked) => {
                        setSelectedPriorities((prev) =>
                          checked
                            ? [...prev, "high"]
                            : prev.filter((p) => p !== "high")
                        );
                      }}
                    >
                      <Flag className="h-4 w-4 mr-2 text-red-500" />
                      High
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedPriorities.includes("medium")}
                      onCheckedChange={(checked) => {
                        setSelectedPriorities((prev) =>
                          checked
                            ? [...prev, "medium"]
                            : prev.filter((p) => p !== "medium")
                        );
                      }}
                    >
                      <Flag className="h-4 w-4 mr-2 text-amber-500" />
                      Medium
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedPriorities.includes("low")}
                      onCheckedChange={(checked) => {
                        setSelectedPriorities((prev) =>
                          checked
                            ? [...prev, "low"]
                            : prev.filter((p) => p !== "low")
                        );
                      }}
                    >
                      <Flag className="h-4 w-4 mr-2 text-green-500" />
                      Low
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={selectedStatuses.includes("pending")}
                      onCheckedChange={(checked) => {
                        setSelectedStatuses((prev) =>
                          checked
                            ? [...prev, "pending"]
                            : prev.filter((s) => s !== "pending")
                        );
                      }}
                    >
                      Pending
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedStatuses.includes("in_progress")}
                      onCheckedChange={(checked) => {
                        setSelectedStatuses((prev) =>
                          checked
                            ? [...prev, "in_progress"]
                            : prev.filter((s) => s !== "in_progress")
                        );
                      }}
                    >
                      In Progress
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedStatuses.includes("completed")}
                      onCheckedChange={(checked) => {
                        setSelectedStatuses((prev) =>
                          checked
                            ? [...prev, "completed"]
                            : prev.filter((s) => s !== "completed")
                        );
                      }}
                    >
                      Completed
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleSort("order")}>
                      {sortField === "order" &&
                        (sortDirection === "asc" ? (
                          <SortAsc className="h-4 w-4 mr-2" />
                        ) : (
                          <SortDesc className="h-4 w-4 mr-2" />
                        ))}
                      Manual Order
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("title")}>
                      {sortField === "title" &&
                        (sortDirection === "asc" ? (
                          <SortAsc className="h-4 w-4 mr-2" />
                        ) : (
                          <SortDesc className="h-4 w-4 mr-2" />
                        ))}
                      Title
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("priority")}>
                      {sortField === "priority" &&
                        (sortDirection === "asc" ? (
                          <SortAsc className="h-4 w-4 mr-2" />
                        ) : (
                          <SortDesc className="h-4 w-4 mr-2" />
                        ))}
                      Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("dueDate")}>
                      {sortField === "dueDate" &&
                        (sortDirection === "asc" ? (
                          <SortAsc className="h-4 w-4 mr-2" />
                        ) : (
                          <SortDesc className="h-4 w-4 mr-2" />
                        ))}
                      Due Date
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("createdAt")}>
                      {sortField === "createdAt" &&
                        (sortDirection === "asc" ? (
                          <SortAsc className="h-4 w-4 mr-2" />
                        ) : (
                          <SortDesc className="h-4 w-4 mr-2" />
                        ))}
                      Creation Date
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Batch actions dropdown */}
              {showBatchActions && (
                <DropdownMenu
                  open={isBatchActionsOpen}
                  onOpenChange={setIsBatchActionsOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={
                        selectedTaskIds.length > 0 ? "default" : "outline"
                      }
                      size="icon"
                      className="h-9 w-9 relative"
                      disabled={isProcessingBatch}
                    >
                      {isProcessingBatch ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <MoreHorizontal className="h-4 w-4" />
                          {selectedTaskIds.length > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                              {selectedTaskIds.length}
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Batch Actions</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={
                        selectedTaskIds.length === filteredTasks.length &&
                        filteredTasks.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    >
                      Select All Tasks
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleBatchComplete}
                      disabled={
                        selectedTaskIds.length === 0 || !onBatchComplete
                      }
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Mark Selected as Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleBatchDelete}
                      disabled={selectedTaskIds.length === 0 || !onBatchDelete}
                      className="text-red-500 focus:text-red-500"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Delete Selected Tasks
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Active filters display */}
          {(selectedPriorities.length > 0 ||
            selectedStatuses.length > 0 ||
            sortField !== "order") && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedPriorities.map((priority) => (
                <Badge
                  key={`priority-${priority}`}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  Priority: {priority}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() =>
                      setSelectedPriorities((prev) =>
                        prev.filter((p) => p !== priority)
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

              {selectedStatuses.map((status) => (
                <Badge
                  key={`status-${status}`}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  Status: {status.replace("_", " ")}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() =>
                      setSelectedStatuses((prev) =>
                        prev.filter((s) => s !== status)
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

              {sortField !== "order" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Sort: {sortField} ({sortDirection})
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => {
                      setSortField("order");
                      setSortDirection("asc");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : showFilteredEmptyState ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No tasks match your filters</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-2"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <AnimatedGrid
            columns={{ default: 1, sm: 2, md: 3, lg: 3 }}
            gap="gap-4"
            animation="slide-up"
            staggerDelay={0.05}
          >
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                toggleTaskStatus={toggleTaskStatus}
                deleteTask={deleteTask}
                openTaskDetails={openTaskDetails}
                isSelected={selectedTaskIds.includes(task.id)}
                onToggleSelect={
                  showBatchActions
                    ? () => toggleTaskSelection(task.id)
                    : undefined
                }
              />
            ))}
          </AnimatedGrid>
        )}
      </CardContent>
    </Card>
  );
}
