"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  Calendar,
  Tag,
  Flag,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useTasks,
  Task,
  TaskPriority,
  TaskStatus,
  TaskFilters,
} from "@/hooks/use-tasks";
import {
  DynamicTaskDetails,
  DynamicTaskFilters,
} from "@/components/tasks/dynamic-task-components";
import { AnimatedTransition } from "@/components/ui/animated-transition";
import { AnimatedList } from "@/components/ui/animated-list";
import { TaskCategories } from "@/components/tasks/task-categories";

export default function TasksPage() {
  // Use the tasks hook
  const {
    tasks,
    isLoading,
    error,
    filters,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    setTaskFilters,
  } = useTasks();

  // New task input
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();

  // Add new task
  const handleAddTask = async () => {
    if (newTaskTitle.trim() === "" || isCreating) return;

    setIsCreating(true);

    try {
      await createTask({
        title: newTaskTitle,
        priority: "medium",
        status: "pending",
        estimatedPomodoros: 1,
      });

      setNewTaskTitle("");
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle task status
  const toggleTaskStatus = async (
    taskId: string,
    currentStatus: TaskStatus
  ) => {
    const newStatus: TaskStatus =
      currentStatus === "pending"
        ? "in_progress"
        : currentStatus === "in_progress"
        ? "completed"
        : "pending";

    await updateTaskStatus(taskId, newStatus);
  };

  // Open task details
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  // Close task details
  const closeTaskDetails = () => {
    setSelectedTask(null);
    setIsTaskDetailsOpen(false);
  };

  // Save task
  const handleSaveTask = async (updatedTask: Partial<Task>) => {
    if (!selectedTask) return;
    await updateTask(selectedTask.id, updatedTask);
  };

  // Apply filters
  const handleApplyFilters = (newFilters: TaskFilters) => {
    setTaskFilters(newFilters);
  };

  // Filter tasks by search query and category
  const filteredTasks = tasks.filter((task) => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.category && task.category.toLowerCase().includes(query)) ||
        (task.tags &&
          task.tags.some((tag) => tag.toLowerCase().includes(query)));

      if (!matchesQuery) return false;
    }

    // Filter by category
    if (selectedCategory) {
      return task.categoryId === selectedCategory;
    }

    return true;
  });

  // Get priority color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <Circle className="h-5 w-5 text-gray-400" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  // Filter tasks by status
  const pendingTasks = filteredTasks.filter(
    (task) => task.status === "pending"
  );
  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "in_progress"
  );
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "completed"
  );
  const cancelledTasks = filteredTasks.filter(
    (task) => task.status === "cancelled"
  );

  // Loading and error states
  if (isLoading && tasks.length === 0) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <AnimatedTransition type="slide-down" duration={0.4}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <Button
            data-action="new-task"
            onClick={() => {
              setSelectedTask(null);
              setIsTaskDetailsOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </AnimatedTransition>

      {error && (
        <AnimatedTransition type="slide-up" duration={0.3}>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </AnimatedTransition>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-8"
                data-action="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DynamicTaskFilters
              filters={filters}
              onApplyFilters={handleApplyFilters}
            />
          </div>
        </div>
        <div className="md:row-span-2">
          <Card>
            <CardContent className="p-4">
              <TaskCategories
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="focus-visible:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddTask();
              }
            }}
          />
          <Button onClick={handleAddTask} disabled={isCreating} className="">
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="all" className="flex-1">
            All ({filteredTasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">
            Pending ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex-1">
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed ({completedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1">
            Cancelled ({cancelledTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TaskList
            tasks={tasks}
            toggleTaskStatus={toggleTaskStatus}
            deleteTask={deleteTask}
            getPriorityColor={getPriorityColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>

        <TabsContent value="pending">
          <TaskList
            tasks={pendingTasks}
            toggleTaskStatus={toggleTaskStatus}
            deleteTask={deleteTask}
            getPriorityColor={getPriorityColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>

        <TabsContent value="in-progress">
          <TaskList
            tasks={inProgressTasks}
            toggleTaskStatus={toggleTaskStatus}
            deleteTask={deleteTask}
            getPriorityColor={getPriorityColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {completedTasks.length === 0 ? (
                <p className="text-muted-foreground">
                  No completed tasks found
                </p>
              ) : (
                <ul className="divide-y">
                  {completedTasks.map((task) => (
                    <li
                      key={task.id}
                      className="p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-full p-1 hover:bg-accent/50"
                            onClick={() =>
                              toggleTaskStatus(task.id, task.status)
                            }
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h3 className="text-base font-medium text-muted-foreground line-through">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1 truncate">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {task.estimatedPomodoros && (
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {task.estimatedPomodoros}
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                            {(task.categoryId || task.category) && (
                              <div className="flex items-center">
                                <Tag className="h-3 w-3 mr-1" />
                                {task.category || "Category"}
                              </div>
                            )}
                            {task.priority && (
                              <div className="flex items-center">
                                <Flag className="h-3 w-3 mr-1" />
                                {task.priority}
                              </div>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => openTaskDetails(task)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteTask(task.id)}
                              className="text-red-500 focus:text-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled">
          <TaskList
            tasks={cancelledTasks}
            toggleTaskStatus={toggleTaskStatus}
            deleteTask={deleteTask}
            getPriorityColor={getPriorityColor}
            getStatusIcon={getStatusIcon}
            openTaskDetails={openTaskDetails}
          />
        </TabsContent>
      </Tabs>

      {/* Task Details Dialog */}
      <DynamicTaskDetails
        task={selectedTask}
        isOpen={isTaskDetailsOpen}
        onClose={closeTaskDetails}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

// Task List Component
interface TaskListProps {
  tasks: Task[];
  toggleTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  getPriorityColor: (priority: TaskPriority) => string;
  getStatusIcon: (status: TaskStatus) => React.ReactNode;
  openTaskDetails: (task: Task) => void;
}

function TaskList({
  tasks,
  toggleTaskStatus,
  deleteTask,
  getPriorityColor,
  getStatusIcon,
  openTaskDetails,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No tasks found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <AnimatedList
          className="divide-y"
          animation="slide-up"
          staggerDelay={0.05}
        >
          {tasks.map((task) => (
            <li
              key={task.id}
              className="p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className="mt-1 flex-shrink-0"
                >
                  {getStatusIcon(task.status)}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-base font-medium ${
                        task.status === "completed"
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.priority && (
                      <span
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {task.estimatedPomodoros && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimatedPomodoros} pomodoros</span>
                      </div>
                    )}

                    {task.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>{task.category}</span>
                      </div>
                    )}
                  </div>
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
                      <Plus className="h-4 w-4 mr-2" />
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
            </li>
          ))}
        </AnimatedList>
      </CardContent>
    </Card>
  );
}
