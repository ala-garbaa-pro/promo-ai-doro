import { vi } from "vitest";

// Task types
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedPomodoros?: number;
  actualPomodoros?: number;
  dueDate?: string;
  categoryId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const useTasks = () => {
  return {
    tasks: [],
    isLoading: false,
    error: null,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleTaskStatus: vi.fn(),
    reorderTasks: vi.fn(),
    filterTasks: vi.fn(),
  };
};
