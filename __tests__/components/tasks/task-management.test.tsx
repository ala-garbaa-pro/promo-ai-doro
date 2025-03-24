import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskListEnhanced } from "@/components/tasks/task-list-enhanced";
import { TaskItem } from "@/components/tasks/task-item";
import { Task, TaskStatus } from "@/hooks/use-tasks";
import { DraggableTaskList } from "@/components/tasks/draggable-task-list";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
const mockToggleTaskStatus = jest.fn();
const mockDeleteTask = jest.fn();
const mockOpenTaskDetails = jest.fn();
const mockOnReorder = jest.fn().mockResolvedValue(true);

describe("Task Management Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("TaskListEnhanced Component", () => {
    it("renders tasks correctly", () => {
      render(
        <TaskListEnhanced
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Check if all task titles are rendered
      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(screen.getByText("Review code")).toBeInTheDocument();
      expect(screen.getByText("Write tests")).toBeInTheDocument();
    });

    it("displays empty state when no tasks", () => {
      render(
        <TaskListEnhanced
          tasks={[]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      expect(screen.getByText("No tasks found")).toBeInTheDocument();
    });
  });

  describe("TaskItem Component", () => {
    it("renders task details correctly", () => {
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
    });

    it("calls toggleTaskStatus when status button is clicked", () => {
      render(
        <TaskItem
          task={mockTasks[0]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Find and click the status toggle button
      const statusButton = screen.getByRole("button", {
        name: /toggle task status/i,
      });
      fireEvent.click(statusButton);

      expect(mockToggleTaskStatus).toHaveBeenCalledWith("1", "pending");
    });

    it("calls deleteTask when delete option is clicked", async () => {
      render(
        <TaskItem
          task={mockTasks[0]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Open dropdown menu
      const menuButton = screen.getByRole("button", { name: /task options/i });
      fireEvent.click(menuButton);

      // Click delete option
      const deleteButton = await screen.findByText("Delete");
      fireEvent.click(deleteButton);

      expect(mockDeleteTask).toHaveBeenCalledWith("1");
    });

    it("calls openTaskDetails when edit option is clicked", async () => {
      render(
        <TaskItem
          task={mockTasks[0]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Open dropdown menu
      const menuButton = screen.getByRole("button", { name: /task options/i });
      fireEvent.click(menuButton);

      // Click edit option
      const editButton = await screen.findByText("Edit Task");
      fireEvent.click(editButton);

      expect(mockOpenTaskDetails).toHaveBeenCalledWith(mockTasks[0]);
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

    it("displays empty state when no tasks", () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <DraggableTaskList
            tasks={[]}
            toggleTaskStatus={mockToggleTaskStatus}
            deleteTask={mockDeleteTask}
            openTaskDetails={mockOpenTaskDetails}
            onReorder={mockOnReorder}
          />
        </DndProvider>
      );

      expect(screen.getByText("No tasks found")).toBeInTheDocument();
    });
  });
});
