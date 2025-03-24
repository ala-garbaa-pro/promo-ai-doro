import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskList } from "@/components/tasks/task-list";
import { Task } from "@/hooks/use-tasks";

// Mock the TaskItem component to avoid testing its implementation details
vi.mock("@/components/tasks/task-item", () => ({
  TaskItem: ({ task, toggleTaskStatus, deleteTask, openTaskDetails }) => (
    <div data-testid={`task-item-${task.id}`}>
      <span>{task.title}</span>
      <button
        onClick={() =>
          toggleTaskStatus(
            task.id,
            task.status === "completed" ? "pending" : "completed"
          )
        }
        data-testid={`toggle-${task.id}`}
      >
        Toggle
      </button>
      <button
        onClick={() => deleteTask(task.id)}
        data-testid={`delete-${task.id}`}
      >
        Delete
      </button>
      <button
        onClick={() => openTaskDetails(task)}
        data-testid={`details-${task.id}`}
      >
        Details
      </button>
    </div>
  ),
}));

// Mock the TaskCategoryBadges component
vi.mock("@/components/tasks/task-category-badges", () => ({
  TaskCategoryBadges: () => (
    <div data-testid="task-category-badges">Categories</div>
  ),
}));

describe("TaskList Component (Fixed)", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      title: "Task 1",
      status: "pending",
      priority: "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 1,
    },
    {
      id: "2",
      title: "Task 2",
      status: "completed",
      priority: "high",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 2,
    },
    {
      id: "3",
      title: "Task 3",
      status: "in_progress",
      priority: "low",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 3,
    },
  ];

  const toggleTaskStatus = vi.fn();
  const deleteTask = vi.fn();
  const openTaskDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a message when there are no tasks", () => {
    render(
      <TaskList
        tasks={[]}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    expect(screen.getByText("No tasks found")).toBeInTheDocument();
  });

  it("renders a list of tasks", () => {
    render(
      <TaskList
        tasks={mockTasks}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Check if all tasks are rendered
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  it("calls toggleTaskStatus when toggle button is clicked", () => {
    render(
      <TaskList
        tasks={mockTasks}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Click the toggle button for the first task
    fireEvent.click(screen.getByTestId("toggle-1"));

    // Check if toggleTaskStatus was called with the correct arguments
    expect(toggleTaskStatus).toHaveBeenCalledTimes(1);
    expect(toggleTaskStatus).toHaveBeenCalledWith("1", "completed");
  });

  it("calls deleteTask when delete button is clicked", () => {
    render(
      <TaskList
        tasks={mockTasks}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Click the delete button for the second task
    fireEvent.click(screen.getByTestId("delete-2"));

    // Check if deleteTask was called with the correct arguments
    expect(deleteTask).toHaveBeenCalledTimes(1);
    expect(deleteTask).toHaveBeenCalledWith("2");
  });

  it("calls openTaskDetails when details button is clicked", () => {
    render(
      <TaskList
        tasks={mockTasks}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Click the details button for the third task
    fireEvent.click(screen.getByTestId("details-3"));

    // Check if openTaskDetails was called with the correct arguments
    expect(openTaskDetails).toHaveBeenCalledTimes(1);
    expect(openTaskDetails).toHaveBeenCalledWith(mockTasks[2]);
  });
});
