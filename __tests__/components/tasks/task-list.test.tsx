import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Define a simple TaskList component for testing
const TaskList = ({ tasks, onToggle, onDelete }: any) => (
  <ul>
    {tasks.map((task: any) => (
      <li key={task.id} data-testid={`task-${task.id}`}>
        <span>{task.title}</span>
        <button onClick={() => onToggle(task.id)}>Toggle</button>
        <button onClick={() => onDelete(task.id)}>Delete</button>
      </li>
    ))}
  </ul>
);

describe("TaskList Component", () => {
  const mockTasks = [
    { id: "1", title: "Task 1" },
    { id: "2", title: "Task 2" },
  ];

  const mockToggle = jest.fn();
  const mockDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders tasks correctly", () => {
    render(
      <TaskList tasks={mockTasks} onToggle={mockToggle} onDelete={mockDelete} />
    );

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getAllByText("Toggle")).toHaveLength(2);
    expect(screen.getAllByText("Delete")).toHaveLength(2);
  });

  it("calls onToggle when toggle button is clicked", async () => {
    render(
      <TaskList tasks={mockTasks} onToggle={mockToggle} onDelete={mockDelete} />
    );

    const user = userEvent.setup();
    const toggleButtons = screen.getAllByText("Toggle");

    await user.click(toggleButtons[0]);

    expect(mockToggle).toHaveBeenCalledTimes(1);
    expect(mockToggle).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button is clicked", async () => {
    render(
      <TaskList tasks={mockTasks} onToggle={mockToggle} onDelete={mockDelete} />
    );

    const user = userEvent.setup();
    const deleteButtons = screen.getAllByText("Delete");

    await user.click(deleteButtons[1]);

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith("2");
  });

  it("renders empty state when no tasks are provided", () => {
    render(<TaskList tasks={[]} onToggle={mockToggle} onDelete={mockDelete} />);

    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
  });
});
