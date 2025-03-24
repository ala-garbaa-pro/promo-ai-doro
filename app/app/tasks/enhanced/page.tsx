"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Task,
  TaskStatus,
  TaskPriority,
  useTask,
  useTaskFilters,
} from "@/hooks/use-tasks";
import { useBatchTasks } from "@/hooks/use-batch-tasks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  ListFilter,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  AlertCircle,
  Loader2,
  LayoutGrid,
  List,
  SortAsc,
  ArrowUpDown,
} from "lucide-react";
import { EnhancedDraggableTaskList } from "@/components/tasks/enhanced-draggable-task-list";
import { TaskGrid } from "@/components/tasks/task-grid";
import {
  DynamicTaskDetails,
  DynamicTaskFilters,
} from "@/components/tasks/dynamic-task-components";
import { AnimatedTransition } from "@/components/ui/animated-transition";
import { TaskCategories } from "@/components/tasks/task-categories";
import { TaskTemplateSelector } from "@/components/tasks/task-template-selector";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";
import { ParsedTaskData } from "@/lib/utils/natural-language-parser";
import { useToast } from "@/components/ui/use-toast";

export default function EnhancedTasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Get the current tab from URL or default to "all"
  const defaultTab = searchParams.get("tab") || "all";

  // Task state
  const {
    tasks,
    isLoading,
    error,
    filters,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    setTaskFilters,
    reorderTasks,
  } = useTask();

  // Batch operations
  const {
    isLoading: isBatchLoading,
    completeBatchTasks,
    deleteBatchTasks,
  } = useBatchTasks({
    onSuccess: fetchTasks,
  });

  // UI state
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", activeTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  // Filter tasks by status
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const cancelledTasks = tasks.filter((task) => task.status === "cancelled");

  // Add new task using natural language input
  const handleAddTask = async (parsedTask: ParsedTaskData) => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      // Create the task with the parsed details
      await createTask({
        title: parsedTask.title,
        priority: parsedTask.priority || "medium",
        status: "pending",
        estimatedPomodoros: parsedTask.estimatedPomodoros || 1,
        dueDate: parsedTask.dueDate,
        category: parsedTask.category,
        tags: parsedTask.tags,
        isRecurring: parsedTask.isRecurring,
        recurringType: parsedTask.recurringPattern,
        recurringInterval: 1, // Default to 1 for now
      });

      toast({
        title: "Task Created",
        description: "Your task has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Open task details
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  // Close task details
  const closeTaskDetails = () => {
    setIsTaskDetailsOpen(false);
    setSelectedTask(null);
  };

  // Save task
  const handleSaveTask = async (updatedTask: Task) => {
    await updateTask(updatedTask.id, updatedTask);
    closeTaskDetails();
  };

  // Toggle task status
  const toggleTaskStatus = (taskId: string, currentStatus: TaskStatus) => {
    let newStatus: TaskStatus;

    switch (currentStatus) {
      case "pending":
        newStatus = "in_progress";
        break;
      case "in_progress":
        newStatus = "completed";
        break;
      case "completed":
        newStatus = "pending";
        break;
      case "cancelled":
        newStatus = "pending";
        break;
      default:
        newStatus = "pending";
    }

    updateTaskStatus(taskId, newStatus);
  };

  // Handle batch complete
  const handleBatchComplete = async (taskIds: string[]) => {
    await completeBatchTasks(taskIds);
    fetchTasks();
  };

  // Handle batch delete
  const handleBatchDelete = async (taskIds: string[]) => {
    await deleteBatchTasks(taskIds);
    fetchTasks();
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="container mx-auto p-6">
      <AnimatedTransition type="fade" duration={0.3}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground mt-1">
            Organize and track your tasks efficiently
          </p>
        </div>
      </AnimatedTransition>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <AnimatedTransition type="slide-right" duration={0.4} delay={0.1}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Categories</CardTitle>
                <CardDescription>Filter tasks by category</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskCategories
                  selectedCategoryId={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                  showAddCategory
                />
              </CardContent>
            </Card>
          </AnimatedTransition>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <AnimatedTransition type="slide-up" duration={0.4} delay={0.2}>
            <div className="mb-8">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <NaturalLanguageTaskInput
                      onTaskCreate={handleAddTask}
                      placeholder="Add a new task... (e.g., 'Call John tomorrow at 3pm #important @work')"
                      className="w-full"
                    />
                  </div>
                  <TaskTemplateSelector
                    onSelectTemplate={(templateText) => {
                      // This will be handled by the NaturalLanguageTaskInput component internally
                      // We'll keep this for compatibility with templates
                      const inputEvent = new CustomEvent("set-task-input", {
                        detail: { text: templateText },
                      });
                      document.dispatchEvent(inputEvent);
                    }}
                  />
                </div>
              </div>
            </div>
          </AnimatedTransition>

          <AnimatedTransition type="slide-up" duration={0.4} delay={0.3}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex gap-1 items-center">
                  <Clock className="h-3 w-3" />
                  <span>{tasks.length} tasks</span>
                </Badge>
              </div>
            </div>
          </AnimatedTransition>

          <AnimatedTransition type="slide-up" duration={0.4} delay={0.4}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="all" className="flex gap-2 items-center">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>All</span>
                  <Badge variant="secondary" className="ml-1">
                    {tasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="flex gap-2 items-center"
                >
                  <Circle className="h-4 w-4" />
                  <span>Pending</span>
                  <Badge variant="secondary" className="ml-1">
                    {pendingTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="in-progress"
                  className="flex gap-2 items-center"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>In Progress</span>
                  <Badge variant="secondary" className="ml-1">
                    {inProgressTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="flex gap-2 items-center"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Completed</span>
                  <Badge variant="secondary" className="ml-1">
                    {completedTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="cancelled"
                  className="flex gap-2 items-center"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancelled</span>
                  <Badge variant="secondary" className="ml-1">
                    {cancelledTasks.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {viewMode === "list" ? (
                  <EnhancedDraggableTaskList
                    tasks={tasks}
                    toggleTaskStatus={toggleTaskStatus}
                    deleteTask={deleteTask}
                    openTaskDetails={openTaskDetails}
                    onReorder={reorderTasks}
                    isLoading={isLoading || isBatchLoading}
                    title="All Tasks"
                    showHeader={true}
                    showSearch={true}
                    showFilters={true}
                    showBatchActions={true}
                    onBatchComplete={handleBatchComplete}
                    onBatchDelete={handleBatchDelete}
                  />
                ) : (
                  <TaskGrid
                    tasks={tasks}
                    toggleTaskStatus={toggleTaskStatus}
                    deleteTask={deleteTask}
                    openTaskDetails={openTaskDetails}
                    isLoading={isLoading || isBatchLoading}
                    title="All Tasks"
                    showHeader={true}
                    showSearch={true}
                    showFilters={true}
                    showBatchActions={true}
                    onBatchComplete={handleBatchComplete}
                    onBatchDelete={handleBatchDelete}
                  />
                )}
              </TabsContent>

              <TabsContent value="pending">
                {viewMode === "list" ? (
                  <EnhancedDraggableTaskList
                    tasks={pendingTasks}
                    toggleTaskStatus={toggleTaskStatus}
                    deleteTask={deleteTask}
                    openTaskDetails={openTaskDetails}
                    onReorder={reorderTasks}
                    isLoading={isLoading || isBatchLoading}
                    title="Pending Tasks"
                    showHeader={true}
                    showSearch={true}
                    showFilters={true}
                    showBatchActions={true}
                    onBatchComplete={handleBatchComplete}
                    onBatchDelete={handleBatchDelete}
                  />
                ) : (
                  <TaskGrid
                    tasks={pendingTasks}
                    toggleTaskStatus={toggleTaskStatus}
                    deleteTask={deleteTask}
                    openTaskDetails={openTaskDetails}
                    isLoading={isLoading || isBatchLoading}
                    title="Pending Tasks"
                    showHeader={true}
                    showSearch={true}
                    showFilters={true}
                    showBatchActions={true}
                    onBatchComplete={handleBatchComplete}
                    onBatchDelete={handleBatchDelete}
                  />
                )}
              </TabsContent>

              <TabsContent value="in-progress">
                {viewMode === "list" ? (
                  <EnhancedDraggableTaskList
                    tasks={inProgressTasks}
                    toggleTaskStatus={toggleTaskStatus}
                    deleteTask={deleteTask}
                    openTaskDetails={openTaskDetails}
                    onReorder={reorderTasks}
                    isLoading={isLoading || isBatchLoading}
                    title="In Progress Tasks"
                    showHeader={true}
                    showSearch={true}
                    showFilters={true}
                    showBatchActions={true}
                    onBatchComplete={handleBatchComplete}
                    onBatchDelete={handleBatchDelete}
                  />
                ) : (
                  <TaskGrid
                    tasks={inProgressTasks}
                    toggleTaskStatus={toggleTaskStatus}
                    deleteTask={deleteTask}
                    openTaskDetails={openTaskDetails}
                    isLoading={isLoading || isBatchLoading}
                    title="In Progress Tasks"
                    showHeader={true}
                    showSearch={true}
                    showFilters={true}
                    showBatchActions={true}
                    onBatchComplete={handleBatchComplete}
                    onBatchDelete={handleBatchDelete}
                  />
                )}
              </TabsContent>

              <TabsContent value="completed">
                {viewMode === "list" ? (
                  <EnhancedDraggableTaskList
                    tasks={completedTasks}
                    toggleTaskStatus={toggleTaskStatus}
                    deleteTask={deleteTask}
                    openTaskDetails={openTaskDetails}
                    onReorder={reorderTasks}
                    isLoading={isLoading || isBatchLoading}
                    title="Completed Tasks"
                    showHeader={true}
                    showSearch={true}
                    showFilters={true}
                    showBatchActions={true}
                    onBatchComplete={handleBatchComplete}
                    onBatchDelete={handleBatchDelete}
                  />
                ) : (
                  <TaskGrid
                    tasks={completedTasks}
                    toggleTaskStatus={toggleTaskStatus}
                    deleteTask={deleteTask}
                    openTaskDetails={openTaskDetails}
                    isLoading={isLoading || isBatchLoading}
                    title="Completed Tasks"
                    showHeader={true}
                    showSearch={true}
                    showFilters={true}
                    showBatchActions={true}
                    onBatchComplete={handleBatchComplete}
                    onBatchDelete={handleBatchDelete}
                  />
                )}
              </TabsContent>

              <TabsContent value="cancelled">
                {viewMode === "list" ? (
                  <EnhancedDraggableTaskList
                    tasks={cancelledTasks}
                    toggleTaskStatus={toggleTaskStatus}
                    deleteTask={deleteTask}
                    openTaskDetails={openTaskDetails}
                    onReorder={reorderTasks}
                    isLoading={isLoading || isBatchLoading}
                    title="Cancelled Tasks"
                    showHeader={true}
                    showSearch={true}
                    showFilters={true}
                    showBatchActions={true}
                    onBatchComplete={handleBatchComplete}
                    onBatchDelete={handleBatchDelete}
                  />
                ) : (
                  <TaskGrid
                    tasks={cancelledTasks}
                    toggleTaskStatus={toggleTaskStatus}
                    deleteTask={deleteTask}
                    openTaskDetails={openTaskDetails}
                    isLoading={isLoading || isBatchLoading}
                    title="Cancelled Tasks"
                    showHeader={true}
                    showSearch={true}
                    showFilters={true}
                    showBatchActions={true}
                    onBatchComplete={handleBatchComplete}
                    onBatchDelete={handleBatchDelete}
                  />
                )}
              </TabsContent>
            </Tabs>
          </AnimatedTransition>
        </div>
      </div>

      {/* Task Details Dialog */}
      <DynamicTaskDetails
        task={selectedTask}
        isOpen={isTaskDetailsOpen}
        onClose={closeTaskDetails}
        onSave={handleSaveTask}
        onDelete={deleteTask}
      />
    </div>
  );
}
