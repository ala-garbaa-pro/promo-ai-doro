"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Task priority types
type TaskPriority = "low" | "medium" | "high";

// Task status types
type TaskStatus = "pending" | "in_progress" | "completed";

// Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedPomodoros?: number;
  dueDate?: Date;
  category?: string;
  tags?: string[];
}

export default function TasksPage() {
  // Sample tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      description: "Write and review the project proposal document",
      priority: "high",
      status: "pending",
      estimatedPomodoros: 4,
      category: "Work",
      tags: ["project", "writing"],
    },
    {
      id: "2",
      title: "Research new features",
      description: "Look into potential new features for the app",
      priority: "medium",
      status: "in_progress",
      estimatedPomodoros: 2,
      category: "Development",
      tags: ["research"],
    },
    {
      id: "3",
      title: "Review documentation",
      description: "Go through the existing documentation and update as needed",
      priority: "low",
      status: "completed",
      estimatedPomodoros: 3,
      category: "Documentation",
      tags: ["review"],
    },
  ]);

  // New task input
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Add new task
  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: "medium",
      status: "pending",
      estimatedPomodoros: 1,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  // Toggle task status
  const toggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const newStatus: TaskStatus =
            task.status === "pending"
              ? "in_progress"
              : task.status === "in_progress"
              ? "completed"
              : "pending";

          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Tasks</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddTask();
              }
            }}
          />
          <Button
            onClick={handleAddTask}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Add
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full bg-gray-800 mb-6">
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
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No tasks found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-700">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="p-4 hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {getStatusIcon(task.status)}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-base font-medium ${
                        task.status === "completed"
                          ? "text-gray-400 line-through"
                          : "text-white"
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
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
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
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Task options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-gray-800 border-gray-700 text-white"
                  >
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
                    <DropdownMenuSeparator className="bg-gray-700" />
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
