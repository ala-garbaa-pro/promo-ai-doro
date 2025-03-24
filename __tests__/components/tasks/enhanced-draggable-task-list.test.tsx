import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EnhancedDraggableTaskList } from "@/components/tasks/enhanced-draggable-task-list";
import { Task, TaskStatus } from "@/hooks/use-tasks";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Mock the react-dnd-html5-backend
vi.mock("react-dnd-html5-backend", () => ({
  HTML5Backend: "HTML5Backend",
}));

// Mock the react-device-detect
vi.mock("react-device-detect", () => ({
  isMobile: false,
}));

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
const mockOnReorder = vi.fn().mockResolvedValue(true);
const mockOnBatchComplete = vi.fn().mockResolvedValue(undefined);
const mockOnBatchDelete = vi.fn().mockResolvedValue(undefined);

// Wrapper component for DndProvider
const DndWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndProvider backend={HTML5Backend as any}>{children}</DndProvider>
);

describe("EnhancedDraggableTaskList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the task list with tasks", () => {
    render(
      <DndWrapper>
        <EnhancedDraggableTaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
          onReorder={mockOnReorder}
        />
      </DndWrapper>
    );

    // Check if all tasks are rendered
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  it("renders empty state when no tasks are provided", () => {
    render(
      <DndWrapper>
        <EnhancedDraggableTaskList
          tasks={[]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
          onReorder={mockOnReorder}
          emptyStateMessage="Custom empty message"
        />
      </DndWrapper>
    );

    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
  });

  it("renders with custom title when provided", () => {
    render(
      <DndWrapper>
        <EnhancedDraggableTaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
          onReorder={mockOnReorder}
          title="Custom Title"
          showHeader={true}
        />
      </DndWrapper>
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("renders loading state when isLoading is true", () => {
    render(
      <DndWrapper>
        <EnhancedDraggableTaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
          onReorder={mockOnReorder}
          isLoading={true}
        />
      </DndWrapper>
    );

    // The loading spinner should be visible
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Tasks should not be visible
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
  });

  it("filters tasks based on search term", async () => {
    render(
      <DndWrapper>
        <EnhancedDraggableTaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
          onReorder={mockOnReorder}
          showSearch={true}
        />
      </DndWrapper>
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

  it("calls toggleTaskStatus when task status is toggled", async () => {
    render(
      <DndWrapper>
        <EnhancedDraggableTaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
          onReorder={mockOnReorder}
        />
      </DndWrapper>
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

  it("calls openTaskDetails when a task is clicked", () => {
    render(
      <DndWrapper>
        <EnhancedDraggableTaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
          onReorder={mockOnReorder}
        />
      </DndWrapper>
    );

    // Find and click on Task 1 title
    fireEvent.click(screen.getByText("Task 1"));
    expect(mockOpenTaskDetails).toHaveBeenCalledTimes(1);
    expect(mockOpenTaskDetails).toHaveBeenCalledWith(mockTasks[0]);
  });
});
