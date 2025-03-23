import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DraggableTaskList } from "@/components/tasks/draggable-task-list";
import { Task, TaskStatus } from "@/hooks/use-tasks";

// Mock the react-dnd hooks
jest.mock("react-dnd", () => ({
  useDrag: () => [{ isDragging: false }, jest.fn(), jest.fn()],
  useDrop: () => [{ handlerId: "test-handler" }, jest.fn()],
  DndProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("react-dnd-html5-backend", () => ({
  HTML5Backend: jest.fn(),
}));

// Mock the draggable task item component
jest.mock("@/components/tasks/draggable-task-item", () => ({
  DraggableTaskItem: ({
    task,
    toggleTaskStatus,
    deleteTask,
    openTaskDetails,
  }: any) => (
    <div data-testid={`task-item-${task.id}`}>
      <span>{task.title}</span>
      <button onClick={() => toggleTaskStatus(task.id, task.status)}>
        Toggle Status
      </button>
      <button onClick={() => deleteTask(task.id)}>Delete</button>
      <button onClick={() => openTaskDetails(task)}>Details</button>
    </div>
  ),
}));

describe("DraggableTaskList Component", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      title: "Task 1",
      priority: "medium",
      status: "pending",
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Task 2",
      priority: "high",
      status: "in_progress",
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockProps = {
    tasks: mockTasks,
    toggleTaskStatus: jest.fn(),
    deleteTask: jest.fn(),
    openTaskDetails: jest.fn(),
    onReorder: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the task list with tasks", () => {
    render(<DraggableTaskList {...mockProps} />);

    expect(screen.getByTestId("task-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("task-item-2")).toBeInTheDocument();
  });

  it("renders a message when no tasks are available", () => {
    render(<DraggableTaskList {...mockProps} tasks={[]} />);

    expect(screen.getByText("No tasks found")).toBeInTheDocument();
  });

  it("calls toggleTaskStatus when the toggle button is clicked", () => {
    render(<DraggableTaskList {...mockProps} />);

    fireEvent.click(screen.getAllByText("Toggle Status")[0]);

    expect(mockProps.toggleTaskStatus).toHaveBeenCalledWith("1", "pending");
  });

  it("calls deleteTask when the delete button is clicked", () => {
    render(<DraggableTaskList {...mockProps} />);

    fireEvent.click(screen.getAllByText("Delete")[0]);

    expect(mockProps.deleteTask).toHaveBeenCalledWith("1");
  });

  it("calls openTaskDetails when the details button is clicked", () => {
    render(<DraggableTaskList {...mockProps} />);

    fireEvent.click(screen.getAllByText("Details")[0]);

    expect(mockProps.openTaskDetails).toHaveBeenCalledWith(mockTasks[0]);
  });
});
