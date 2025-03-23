import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TasksPage from "@/app/app/tasks/page";

// Mock the useTasks hook
jest.mock("@/hooks/use-tasks", () => ({
  useTasks: () => ({
    tasks: [
      {
        id: "1",
        title: "Test Task 1",
        description: "This is a test task",
        priority: "medium",
        status: "pending",
        estimatedPomodoros: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Test Task 2",
        description: "This is another test task",
        priority: "high",
        status: "in_progress",
        estimatedPomodoros: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        title: "Test Task 3",
        description: "This is a completed test task",
        priority: "low",
        status: "completed",
        estimatedPomodoros: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    isLoading: false,
    error: null,
    filters: {},
    createTask: jest.fn(),
    updateTask: jest.fn(),
    updateTaskStatus: jest.fn(),
    deleteTask: jest.fn(),
    setTaskFilters: jest.fn(),
  }),
}));

// Mock the TaskDetails component
jest.mock("@/components/tasks/task-details", () => ({
  TaskDetails: ({ task, isOpen, onClose, onSave, onDelete }: any) =>
    isOpen ? (
      <div data-testid="task-details-dialog">
        <h2>{task ? "Edit Task" : "New Task"}</h2>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSave({ id: task?.id, title: "Updated Task" })}>
          Save
        </button>
        {task && <button onClick={() => onDelete(task.id)}>Delete</button>}
      </div>
    ) : null,
}));

// Mock the TaskFiltersComponent
jest.mock("@/components/tasks/task-filters", () => ({
  TaskFiltersComponent: ({ filters, onApplyFilters }: any) => (
    <div data-testid="task-filters">
      <button onClick={() => onApplyFilters({ status: "pending" })}>
        Apply Filters
      </button>
    </div>
  ),
}));

describe("Tasks Page Integration", () => {
  it("renders the tasks page with tasks", () => {
    render(<TasksPage />);

    // Check page title
    expect(screen.getByRole("heading", { name: /tasks/i })).toBeInTheDocument();

    // Check if tasks are rendered
    expect(screen.getByText("Test Task 1")).toBeInTheDocument();
    expect(screen.getByText("Test Task 2")).toBeInTheDocument();

    // Check if tabs are rendered
    expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /pending/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /in progress/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /completed/i })).toBeInTheDocument();
  });

  it("opens task details dialog when new task button is clicked", async () => {
    render(<TasksPage />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /new task/i }));

    // Check if task details dialog is opened
    expect(screen.getByTestId("task-details-dialog")).toBeInTheDocument();
    expect(screen.getByText("New Task")).toBeInTheDocument();
  });

  it("filters tasks when search is used", async () => {
    render(<TasksPage />);

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/search tasks/i);

    // Type in search box
    await user.type(searchInput, "Task 1");

    // Only Task 1 should be visible in the filtered list
    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Task 2")).not.toBeInTheDocument();
    });
  });

  it("switches between tabs to show different task statuses", async () => {
    render(<TasksPage />);

    const user = userEvent.setup();

    // Click on Completed tab
    await user.click(screen.getByRole("tab", { name: /completed/i }));

    // Only completed tasks should be visible
    await waitFor(() => {
      expect(screen.getByText("Test Task 3")).toBeInTheDocument();
      expect(screen.queryByText("Test Task 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Test Task 2")).not.toBeInTheDocument();
    });
  });
});
