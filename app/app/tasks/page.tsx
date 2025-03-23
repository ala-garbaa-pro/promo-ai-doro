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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTasks, Task, TaskPriority, TaskStatus } from "@/hooks/use-tasks";

export default function TasksPage() {
  // Use the tasks hook
  const { tasks, isLoading, error, createTask, updateTaskStatus, deleteTask } =
    useTasks();

  // New task input
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
            All ({tasks.length})
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
          <TaskList
            tasks={completedTasks}
            toggleTaskStatus={toggleTaskStatus}
            deleteTask={deleteTask}
            getPriorityColor={getPriorityColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Task List Component
interface TaskListProps {
  tasks: Task[];
  toggleTaskStatus: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  getPriorityColor: (priority: TaskPriority) => string;
  getStatusIcon: (status: TaskStatus) => React.ReactNode;
}

function TaskList({
  tasks,
  toggleTaskStatus,
  deleteTask,
  getPriorityColor,
  getStatusIcon,
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
        <ul className="divide-y">
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
                    <DropdownMenuItem className="cursor-pointer">
                      <Clock className="h-4 w-4 mr-2" />
                      Start Timer
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Flag className="h-4 w-4 mr-2" />
                      Set Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Calendar className="h-4 w-4 mr-2" />
                      Set Due Date
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
        </ul>
      </CardContent>
    </Card>
  );
}
