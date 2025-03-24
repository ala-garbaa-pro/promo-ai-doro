import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskList } from "@/components/tasks/task-list";
import { DraggableTaskList } from "@/components/tasks/draggable-task-list";
import { TaskItem } from "@/components/tasks/task-item";
import { Task } from "@/types/task";

// Mock tasks for testing
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete project",
    description: "Finish the project by end of day",
    priority: "high",
    status: "pending",
    estimatedPomodoros: 4,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Review code",
    description: "Review pull request",
    priority: "medium",
    status: "in_progress",
    estimatedPomodoros: 2,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Write tests",
    description: "Add unit tests",
    priority: "low",
    status: "completed",
    estimatedPomodoros: 3,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock functions
const mockToggleTaskStatus = vi.fn();
const mockDeleteTask = vi.fn();
const mockOpenTaskDetails = vi.fn();
const mockOnReorder = vi.fn().mockResolvedValue(true);

describe("Task Management Components (Vitest)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("TaskItem Component", () => {
    it("renders task item correctly", () => {
      render(
        <TaskItem
          task={mockTasks[0]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(
        screen.getByText("Finish the project by end of day")
      ).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument(); // Estimated pomodoros
    });

    it("calls toggleTaskStatus when checkbox is clicked", () => {
      render(
        <TaskItem
          task={mockTasks[0]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockToggleTaskStatus).toHaveBeenCalledWith(mockTasks[0].id);
    });

    it("calls deleteTask when delete button is clicked", () => {
      render(
        <TaskItem
          task={mockTasks[0]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      const deleteButton = screen.getByLabelText("Delete Task");
      fireEvent.click(deleteButton);

      expect(mockDeleteTask).toHaveBeenCalledWith(mockTasks[0].id);
    });

    it("calls openTaskDetails when edit button is clicked", () => {
      render(
        <TaskItem
          task={mockTasks[0]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      const editButton = screen.getByLabelText("Edit Task");
      fireEvent.click(editButton);

      expect(mockOpenTaskDetails).toHaveBeenCalledWith(mockTasks[0].id);
    });
  });

  describe("TaskList Component", () => {
    it("renders tasks correctly", () => {
      render(
        <TaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(screen.getByText("Review code")).toBeInTheDocument();
      expect(screen.getByText("Write tests")).toBeInTheDocument();
    });

    it("renders empty state when no tasks", () => {
      render(
        <TaskList
          tasks={[]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      expect(screen.getByText("No tasks yet")).toBeInTheDocument();
    });
  });

  describe("DraggableTaskList Component", () => {
    it("renders tasks in correct order", () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <DraggableTaskList
            tasks={mockTasks}
            toggleTaskStatus={mockToggleTaskStatus}
            deleteTask={mockDeleteTask}
            openTaskDetails={mockOpenTaskDetails}
            onReorder={mockOnReorder}
          />
        </DndProvider>
      );

      // Check if tasks are rendered in the correct order
      const taskElements = screen.getAllByRole("listitem");
      expect(taskElements.length).toBe(3);

      // Check order by finding text within each list item
      expect(taskElements[0]).toHaveTextContent("Complete project");
      expect(taskElements[1]).toHaveTextContent("Review code");
      expect(taskElements[2]).toHaveTextContent("Write tests");
    });
  });
});
