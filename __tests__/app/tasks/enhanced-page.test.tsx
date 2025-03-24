import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EnhancedTasksPage from "@/app/app/tasks/enhanced/page";

// Mock the hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue("all"),
  }),
}));

vi.mock("@/hooks/use-tasks", () => ({
  useTask: () => ({
    tasks: [
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
      },
    ],
    isLoading: false,
    error: null,
    filters: {},
    fetchTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    setTaskFilters: vi.fn(),
    reorderTasks: vi.fn(),
  }),
  TaskStatus: {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  },
  TaskPriority: {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
  },
  useTaskFilters: vi.fn(),
}));

vi.mock("@/hooks/use-batch-tasks", () => ({
  useBatchTasks: () => ({
    isLoading: false,
    error: null,
    completeBatchTasks: vi.fn(),
    deleteBatchTasks: vi.fn(),
  }),
}));

vi.mock("@/components/tasks/task-categories", () => ({
  TaskCategories: () => (
    <div data-testid="task-categories">Task Categories</div>
  ),
}));

vi.mock("@/components/tasks/natural-language-task-input", () => ({
  NaturalLanguageTaskInput: ({ onTaskCreate }: any) => (
    <input
      data-testid="task-input"
      placeholder="Add a task"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onTaskCreate({
            title: "New Task",
            priority: "medium",
            estimatedPomodoros: 1,
          });
        }
      }}
    />
  ),
}));

vi.mock("@/components/tasks/task-template-selector", () => ({
  TaskTemplateSelector: () => (
    <button data-testid="template-selector">Templates</button>
  ),
}));

vi.mock("@/components/tasks/enhanced-draggable-task-list", () => ({
  EnhancedDraggableTaskList: ({ tasks }: any) => (
    <div data-testid="task-list">
      {tasks.map((task: any) => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/tasks/task-grid", () => ({
  TaskGrid: ({ tasks }: any) => (
    <div data-testid="task-grid">
      {tasks.map((task: any) => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/tasks/dynamic-task-components", () => ({
  DynamicTaskDetails: () => <div data-testid="task-details">Task Details</div>,
  DynamicTaskFilters: () => <div data-testid="task-filters">Task Filters</div>,
}));

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("EnhancedTasksPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the enhanced tasks page with all components", () => {
    render(<EnhancedTasksPage />);

    // Check if main components are rendered
    expect(screen.getByText("Task Management")).toBeInTheDocument();
    expect(screen.getByTestId("task-categories")).toBeInTheDocument();
    expect(screen.getByTestId("task-input")).toBeInTheDocument();
    expect(screen.getByTestId("template-selector")).toBeInTheDocument();

    // Check if task list is rendered (default view mode is list)
    expect(screen.getByTestId("task-list")).toBeInTheDocument();

    // Check if tabs are rendered
    expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /pending/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /in progress/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /completed/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /cancelled/i })).toBeInTheDocument();
  });

  it("switches between list and grid view modes", async () => {
    render(<EnhancedTasksPage />);

    // Default view mode should be list
    expect(screen.getByTestId("task-list")).toBeInTheDocument();
    expect(screen.queryByTestId("task-grid")).not.toBeInTheDocument();

    // Click the grid view button
    const gridButton = screen.getByRole("button", { name: /grid/i });
    fireEvent.click(gridButton);

    // View should switch to grid
    await waitFor(() => {
      expect(screen.queryByTestId("task-list")).not.toBeInTheDocument();
      expect(screen.getByTestId("task-grid")).toBeInTheDocument();
    });

    // Click the list view button
    const listButton = screen.getByRole("button", { name: /list/i });
    fireEvent.click(listButton);

    // View should switch back to list
    await waitFor(() => {
      expect(screen.getByTestId("task-list")).toBeInTheDocument();
      expect(screen.queryByTestId("task-grid")).not.toBeInTheDocument();
    });
  });

  it("switches between tabs", async () => {
    render(<EnhancedTasksPage />);

    // Default tab should be "all"
    expect(screen.getByRole("tab", { name: /all/i })).toHaveAttribute(
      "data-state",
      "active"
    );

    // Click the "pending" tab
    const pendingTab = screen.getByRole("tab", { name: /pending/i });
    fireEvent.click(pendingTab);

    // "pending" tab should be active
    await waitFor(() => {
      expect(pendingTab).toHaveAttribute("data-state", "active");
    });

    // Click the "completed" tab
    const completedTab = screen.getByRole("tab", { name: /completed/i });
    fireEvent.click(completedTab);

    // "completed" tab should be active
    await waitFor(() => {
      expect(completedTab).toHaveAttribute("data-state", "active");
    });
  });

  it("creates a new task when Enter is pressed in the task input", async () => {
    const { createTask } = require("@/hooks/use-tasks").useTask();

    render(<EnhancedTasksPage />);

    // Find the task input
    const taskInput = screen.getByTestId("task-input");

    // Simulate pressing Enter
    fireEvent.keyDown(taskInput, { key: "Enter" });

    // Check if createTask was called with the correct arguments
    await waitFor(() => {
      expect(createTask).toHaveBeenCalledTimes(1);
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          priority: "medium",
          status: "pending",
          estimatedPomodoros: 1,
        })
      );
    });
  });
});
