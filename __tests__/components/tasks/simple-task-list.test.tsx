/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";

// Mock task data
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

// Simple TaskList component for testing
const SimpleTaskList = ({ tasks = [] }) => (
  <div data-testid="task-list">
    {tasks.length === 0 ? (
      <p data-testid="empty-message">No tasks found</p>
    ) : (
      <ul>
        {tasks.map((task) => (
          <li key={task.id} data-testid={`task-item-${task.id}`}>
            {task.title} - {task.status}
          </li>
        ))}
      </ul>
    )}
  </div>
);

describe("Simple TaskList", () => {
  it("renders tasks correctly", () => {
    render(<SimpleTaskList tasks={mockTasks} />);

    const taskList = screen.getByTestId("task-list");
    expect(taskList).toBeTruthy();

    const task1 = screen.getByTestId("task-item-1");
    const task2 = screen.getByTestId("task-item-2");

    expect(task1).toBeTruthy();
    expect(task2).toBeTruthy();
    expect(task1.textContent).toContain("Task 1");
    expect(task2.textContent).toContain("Task 2");
  });

  it("shows empty state when no tasks", () => {
    render(<SimpleTaskList tasks={[]} />);

    const emptyMessage = screen.getByTestId("empty-message");
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage.textContent).toBe("No tasks found");
  });
});
