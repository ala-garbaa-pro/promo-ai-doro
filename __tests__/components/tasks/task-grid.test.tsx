import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskGrid } from "@/components/tasks/task-grid";
import { Task, TaskStatus } from "@/hooks/use-tasks";

// Mock tasks
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Task 1",
    description: "Description for task 1",
    status: "pending",
    priority: "high",
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    tags: ["important", "work"],
  },
  {
    id: "2",
    title: "Task 2",
    description: "Description for task 2",
    status: "in_progress",
    priority: "medium",
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    estimatedPomodoros: 3,
    completedPomodoros: 1,
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  },
  {
    id: "3",
    title: "Task 3",
    description: "Description for task 3",
    status: "completed",
    priority: "low",
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user1",
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    categoryId: "category1",
  },
];

// Mock functions
const mockToggleTaskStatus = vi.fn();
const mockDeleteTask = vi.fn();
const mockOpenTaskDetails = vi.fn();
const mockOnBatchComplete = vi.fn().mockResolvedValue(undefined);
const mockOnBatchDelete = vi.fn().mockResolvedValue(undefined);

describe("TaskGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the task grid with tasks", () => {
    render(
      <TaskGrid
        tasks={mockTasks}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
      />
    );

    // Check if all tasks are rendered
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  it("renders empty state when no tasks are provided", () => {
    render(
      <TaskGrid
        tasks={[]}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
        emptyStateMessage="Custom empty message"
      />
    );

    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
  });

  it("renders with custom title when provided", () => {
    render(
      <TaskGrid
        tasks={mockTasks}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
        title="Custom Title"
        showHeader={true}
      />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("renders loading state when isLoading is true", () => {
    render(
      <TaskGrid
        tasks={mockTasks}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
        isLoading={true}
      />
    );

    // The loading spinner should be visible
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Tasks should not be visible
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
  });

  it("filters tasks based on search term", async () => {
    render(
      <TaskGrid
        tasks={mockTasks}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
        showSearch={true}
      />
    );

    // All tasks should be visible initially
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();

    // Type in the search box
    const searchInput = screen.getByPlaceholderText("Search tasks...");
    fireEvent.change(searchInput, { target: { value: "Task 1" } });

    // Only Task 1 should be visible
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Task 3")).not.toBeInTheDocument();
    });
  });

  it("filters tasks based on priority", async () => {
    render(
      <TaskGrid
        tasks={mockTasks}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
        showFilters={true}
      />
    );

    // Open the filter dropdown
    const filterButton = screen.getByRole("button", { name: /filter/i });
    fireEvent.click(filterButton);

    // Select high priority filter
    const highPriorityOption = screen.getByText("High");
    fireEvent.click(highPriorityOption);

    // Only high priority task should be visible
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Task 3")).not.toBeInTheDocument();
    });
  });

  it("calls toggleTaskStatus when task status is toggled", () => {
    render(
      <TaskGrid
        tasks={mockTasks}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
      />
    );

    // Find the status toggle button for Task 1
    const statusButtons = screen.getAllByRole("button");
    const statusButton = statusButtons.find((button) =>
      button.getAttribute("aria-label")?.includes("Mark task as")
    );

    if (statusButton) {
      fireEvent.click(statusButton);
      expect(mockToggleTaskStatus).toHaveBeenCalledTimes(1);
    } else {
      throw new Error("Status button not found");
    }
  });

  it("calls batch complete function when batch action is triggered", async () => {
    render(
      <TaskGrid
        tasks={mockTasks}
        toggleTaskStatus={mockToggleTaskStatus}
        deleteTask={mockDeleteTask}
        openTaskDetails={mockOpenTaskDetails}
        showBatchActions={true}
        onBatchComplete={mockOnBatchComplete}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    // Open the batch actions dropdown
    const batchActionsButton = screen.getByRole("button", {
      name: /batch actions/i,
    });
    fireEvent.click(batchActionsButton);

    // Select all tasks
    const selectAllOption = screen.getByText("Select All Tasks");
    fireEvent.click(selectAllOption);

    // Click the complete batch action
    const completeAction = screen.getByText("Mark Selected as Complete");
    fireEvent.click(completeAction);

    // Batch complete should be called with all task IDs
    await waitFor(() => {
      expect(mockOnBatchComplete).toHaveBeenCalledTimes(1);
      expect(mockOnBatchComplete).toHaveBeenCalledWith(
        mockTasks.map((task) => task.id)
      );
    });
  });
});
