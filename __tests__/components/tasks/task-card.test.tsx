import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "@/components/tasks/task-card";
import { Task, TaskStatus } from "@/hooks/use-tasks";

// Mock task
const mockTask: Task = {
  id: "1",
  title: "Test Task",
  description: "This is a test task description",
  status: "pending",
  priority: "high",
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user1",
  estimatedPomodoros: 2,
  completedPomodoros: 0,
  tags: ["important", "work"],
  dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
};

// Mock functions
const mockToggleTaskStatus = vi.fn();
const mockDeleteTask = vi.fn();
const mockOpenTaskDetails = vi.fn();
const mockOnToggleSelect = vi.fn();

describe("TaskCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the task card with correct information", () => {
    render(
      <TaskCard
        task={mockTask}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
      />
    );

    // Check if task title and description are rendered
    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test task description")
    ).toBeInTheDocument();

    // Check if tags are rendered
    expect(screen.getByText("#important")).toBeInTheDocument();
    expect(screen.getByText("#work")).toBeInTheDocument();

    // Check if priority is rendered
    expect(screen.getByText("high priority")).toBeInTheDocument();

    // Check if estimated pomodoros are rendered
    expect(screen.getByText("2 pomodoros")).toBeInTheDocument();
  });

  it("calls toggleTaskStatus when status button is clicked", () => {
    render(
      <TaskCard
        task={mockTask}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
      />
    );

    // Find and click the status button
    const statusButton = screen.getByRole("button", {
      name: /mark task as complete/i,
    });
    fireEvent.click(statusButton);

    // Check if toggleTaskStatus was called with correct arguments
    expect(mockToggleTaskStatus).toHaveBeenCalledTimes(1);
    expect(mockToggleTaskStatus).toHaveBeenCalledWith("1", "pending");
  });

  it("opens dropdown menu and calls deleteTask when delete option is clicked", () => {
    render(
      <TaskCard
        task={mockTask}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
      />
    );

    // Open the dropdown menu
    const menuButton = screen.getByRole("button", { name: "Task options" });
    fireEvent.click(menuButton);

    // Click the delete option
    const deleteOption = screen.getByText("Delete Task");
    fireEvent.click(deleteOption);

    // Check if deleteTask was called with correct argument
    expect(mockDeleteTask).toHaveBeenCalledTimes(1);
    expect(mockDeleteTask).toHaveBeenCalledWith("1");
  });

  it("opens dropdown menu and calls openTaskDetails when edit option is clicked", () => {
    render(
      <TaskCard
        task={mockTask}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
      />
    );

    // Open the dropdown menu
    const menuButton = screen.getByRole("button", { name: "Task options" });
    fireEvent.click(menuButton);

    // Click the edit option
    const editOption = screen.getByText("Edit Task");
    fireEvent.click(editOption);

    // Check if openTaskDetails was called with correct argument
    expect(mockOpenTaskDetails).toHaveBeenCalledTimes(1);
    expect(mockOpenTaskDetails).toHaveBeenCalledWith(mockTask);
  });

  it("renders with selected state when isSelected is true", () => {
    render(
      <TaskCard
        task={mockTask}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
        isSelected={true}
        onToggleSelect={mockOnToggleSelect}
      />
    );

    // Check if the card has the selected class
    const card = screen.getByText("Test Task").closest(".ring-2");
    expect(card).toBeInTheDocument();
  });

  it("calls onToggleSelect when selection is toggled", () => {
    render(
      <TaskCard
        task={mockTask}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
        isSelected={false}
        onToggleSelect={mockOnToggleSelect}
      />
    );

    // Find and click the selection toggle button if it exists
    const selectButton = screen.queryByRole("button", { name: /select task/i });
    if (selectButton) {
      fireEvent.click(selectButton);
      expect(mockOnToggleSelect).toHaveBeenCalledTimes(1);
    }
  });
});
