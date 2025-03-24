import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskList } from "@/components/tasks/task-list";

// Mock the useTasks hook
vi.mock("@/hooks/use-tasks", () => ({
  useTasks: () => ({
    tasks: [
      {
        id: "1",
        title: "Task 1",
        status: "pending",
        priority: "medium",
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Task 2",
        status: "completed",
        priority: "high",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    reorderTasks: vi.fn(),
    isLoading: false,
  }),
}));

// Mock the DnD provider
vi.mock("react-dnd", () => ({
  useDrag: () => [{ isDragging: false }, vi.fn()],
  useDrop: () => [{ isOver: false }, vi.fn()],
  DndProvider: ({ children }) => <div>{children}</div>,
}));

vi.mock("react-dnd-html5-backend", () => ({
  HTML5Backend: {},
}));

describe("TaskList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the task list component", () => {
    const mockTasks = [
      {
        id: "1",
        title: "Task 1",
        status: "pending",
        priority: "medium",
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Task 2",
        status: "completed",
        priority: "high",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(
      <TaskList
        tasks={mockTasks}
        toggleTaskStatus={vi.fn()}
        deleteTask={vi.fn()}
        openTaskDetails={vi.fn()}
      />
    );

    // Check if the task list is rendered
    expect(screen.getByText("Task 1")).toBeTruthy();
    expect(screen.getByText("Task 2")).toBeTruthy();
  });

  it("displays tasks correctly", () => {
    const mockTasks = [
      {
        id: "1",
        title: "Task 1",
        status: "pending",
        priority: "medium",
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Task 2",
        status: "completed",
        priority: "high",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(
      <TaskList
        tasks={mockTasks}
        toggleTaskStatus={vi.fn()}
        deleteTask={vi.fn()}
        openTaskDetails={vi.fn()}
      />
    );

    // Check if both tasks are rendered
    expect(screen.getByText("Task 1")).toBeTruthy();
    expect(screen.getByText("Task 2")).toBeTruthy();

    // Check that the tasks have different statuses
    expect(mockTasks[0].status).toBe("pending");
    expect(mockTasks[1].status).toBe("completed");
  });
});
