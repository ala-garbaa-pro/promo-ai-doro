import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskList } from "@/components/tasks/task-list";
import { Task, TaskStatus } from "@/__tests__/__mocks__/use-tasks";

// Mock the TaskItem component
vi.mock("@/components/tasks/task-item", () => ({
  TaskItem: ({ task, toggleTaskStatus, deleteTask, openTaskDetails }: any) => (
    <div data-testid={`task-item-${task.id}`}>
      <input
        type="checkbox"
        checked={task.status === "completed"}
        onChange={() =>
          toggleTaskStatus(
            task.id,
            task.status === "completed" ? "pending" : "completed"
          )
        }
        data-testid={`task-checkbox-${task.id}`}
      />
      <span>{task.title}</span>
      <button
        onClick={() => openTaskDetails(task)}
        data-testid={`task-edit-${task.id}`}
      >
        Edit
      </button>
      <button
        onClick={() => deleteTask(task.id)}
        data-testid={`task-delete-${task.id}`}
      >
        Delete
      </button>
    </div>
  ),
}));

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
];

describe("TaskList Component", () => {
  it("renders tasks correctly", () => {
    const toggleTaskStatus = vi.fn();
    const deleteTask = vi.fn();
    const openTaskDetails = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Check if both tasks are rendered
    expect(screen.getByTestId("task-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("task-item-2")).toBeInTheDocument();
  });

  it("displays empty state when no tasks", () => {
    const toggleTaskStatus = vi.fn();
    const deleteTask = vi.fn();
    const openTaskDetails = vi.fn();

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

  it("calls toggleTaskStatus when checkbox is clicked", () => {
    const toggleTaskStatus = vi.fn();
    const deleteTask = vi.fn();
    const openTaskDetails = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Click the checkbox for the first task
    fireEvent.click(screen.getByTestId("task-checkbox-1"));

    // Check if toggleTaskStatus was called with the correct arguments
    expect(toggleTaskStatus).toHaveBeenCalledWith("1", "completed");
  });

  it("calls deleteTask when delete button is clicked", () => {
    const toggleTaskStatus = vi.fn();
    const deleteTask = vi.fn();
    const openTaskDetails = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Click the delete button for the first task
    fireEvent.click(screen.getByTestId("task-delete-1"));

    // Check if deleteTask was called with the correct argument
    expect(deleteTask).toHaveBeenCalledWith("1");
  });

  it("calls openTaskDetails when edit button is clicked", () => {
    const toggleTaskStatus = vi.fn();
    const deleteTask = vi.fn();
    const openTaskDetails = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Click the edit button for the first task
    fireEvent.click(screen.getByTestId("task-edit-1"));

    // Check if openTaskDetails was called with the correct argument
    expect(openTaskDetails).toHaveBeenCalledWith(mockTasks[0]);
  });
});
