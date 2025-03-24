import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskItem } from "@/components/tasks/task-item";
import { Task } from "@/hooks/use-tasks";

// Mock the TaskCategoryBadges component
vi.mock("@/components/tasks/task-category-badge", () => ({
  TaskCategoryBadges: ({ categoryIds }: { categoryIds: string[] }) => (
    <div data-testid="task-category-badges">
      {categoryIds.map((id) => (
        <span key={id}>{id}</span>
      ))}
    </div>
  ),
}));

// Mock fetch for API calls
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ id: "work" }, { id: "personal" }]),
  })
);

describe("TaskItem Component", () => {
  const mockTask: Task = {
    id: "task-1",
    title: "Test Task",
    description: "This is a test task description",
    status: "pending",
    priority: "medium",
    estimatedPomodoros: 2,
    dueDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: 1,
  };

  const toggleTaskStatus = vi.fn();
  const deleteTask = vi.fn();
  const openTaskDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders task title and description", async () => {
    render(
      <TaskItem
        task={mockTask}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test task description")
    ).toBeInTheDocument();
  });

  it("renders task priority", async () => {
    render(
      <TaskItem
        task={mockTask}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    expect(screen.getByText("medium")).toBeInTheDocument();
  });

  it("renders estimated pomodoros", async () => {
    render(
      <TaskItem
        task={mockTask}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    expect(screen.getByText("2 pomodoros")).toBeInTheDocument();
  });

  it("calls toggleTaskStatus when status icon is clicked", async () => {
    render(
      <TaskItem
        task={mockTask}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Find the status button and click it
    const statusButton = screen.getByRole("button", { name: "" });
    fireEvent.click(statusButton);

    expect(toggleTaskStatus).toHaveBeenCalledTimes(1);
    expect(toggleTaskStatus).toHaveBeenCalledWith("task-1", "pending");
  });

  it("opens dropdown menu and calls deleteTask when delete option is clicked", async () => {
    render(
      <TaskItem
        task={mockTask}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Open the dropdown menu
    const menuButton = screen.getByRole("button", { name: "Task options" });
    fireEvent.click(menuButton);

    // Click the delete option
    const deleteOption = screen.getByText("Delete");
    fireEvent.click(deleteOption);

    expect(deleteTask).toHaveBeenCalledTimes(1);
    expect(deleteTask).toHaveBeenCalledWith("task-1");
  });

  it("opens dropdown menu and calls openTaskDetails when edit option is clicked", async () => {
    render(
      <TaskItem
        task={mockTask}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Open the dropdown menu
    const menuButton = screen.getByRole("button", { name: "Task options" });
    fireEvent.click(menuButton);

    // Click the edit option
    const editOption = screen.getByText("Edit Task");
    fireEvent.click(editOption);

    expect(openTaskDetails).toHaveBeenCalledTimes(1);
    expect(openTaskDetails).toHaveBeenCalledWith(mockTask);
  });
});
