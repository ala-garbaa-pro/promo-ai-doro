import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Timer } from "@/__tests__/__mocks__/timer";
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
    priority: "high",
    status: "pending",
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Integrated component for testing
const IntegratedApp = () => {
  const toggleTaskStatus = vi.fn();
  const deleteTask = vi.fn();
  const openTaskDetails = vi.fn();

  return (
    <div>
      <h1>Pomo AI-doro</h1>
      <div data-testid="timer">
        <Timer />
      </div>
      <div data-testid="task-list">
        <TaskList
          tasks={mockTasks}
          toggleTaskStatus={toggleTaskStatus}
          deleteTask={deleteTask}
          openTaskDetails={openTaskDetails}
        />
      </div>
    </div>
  );
};

describe("Timer and Task Integration", () => {
  it("renders the integrated app", () => {
    render(<IntegratedApp />);

    expect(screen.getByText("Pomo AI-doro")).toBeInTheDocument();
    expect(screen.getByTestId("timer")).toBeInTheDocument();
    expect(screen.getByTestId("task-list")).toBeInTheDocument();
    expect(screen.getByText("Complete project")).toBeInTheDocument();
  });

  it("timer and tasks work independently", () => {
    render(<IntegratedApp />);

    // Check initial timer state
    expect(screen.getByTestId("timer-display").textContent).toBe("25:00");

    // Change timer mode
    fireEvent.click(screen.getByText("Short Break"));
    expect(screen.getByTestId("timer-display").textContent).toBe("05:00");

    // Task should still be visible
    expect(screen.getByText("Complete project")).toBeInTheDocument();

    // Start timer
    fireEvent.click(screen.getByTestId("start-button"));

    // Timer should be running (Pause button visible)
    expect(screen.getByTestId("pause-button")).toBeInTheDocument();

    // Task should still be visible
    expect(screen.getByText("Complete project")).toBeInTheDocument();
  });
});
