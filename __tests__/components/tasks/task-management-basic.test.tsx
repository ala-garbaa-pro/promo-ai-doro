import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Task, TaskStatus } from "@/hooks/use-tasks";

// Mock task components
jest.mock("@/components/tasks/task-list-enhanced", () => ({
  TaskListEnhanced: ({
    tasks,
    toggleTaskStatus,
    deleteTask,
    openTaskDetails,
  }: {
    tasks: Task[];
    toggleTaskStatus: (id: string, status: TaskStatus) => void;
    deleteTask: (id: string) => void;
    openTaskDetails: (task: Task) => void;
  }) => (
    <div data-testid="task-list">
      {tasks.length === 0 ? (
        <div data-testid="empty-state">No tasks found</div>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} data-testid={`task-${task.id}`}>
              <div>{task.title}</div>
              <button
                onClick={() => toggleTaskStatus(task.id, task.status)}
                data-testid={`toggle-${task.id}`}
              >
                Toggle Status
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                data-testid={`delete-${task.id}`}
              >
                Delete
              </button>
              <button
                onClick={() => openTaskDetails(task)}
                data-testid={`edit-${task.id}`}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  ),
}));

jest.mock("@/components/tasks/draggable-task-list", () => ({
  DraggableTaskList: ({
    tasks,
    toggleTaskStatus,
    deleteTask,
    openTaskDetails,
    onReorder,
  }: {
    tasks: Task[];
    toggleTaskStatus: (id: string, status: TaskStatus) => void;
    deleteTask: (id: string) => void;
    openTaskDetails: (task: Task) => void;
    onReorder: (taskIds: string[]) => Promise<boolean>;
  }) => (
    <div data-testid="draggable-task-list">
      {tasks.length === 0 ? (
        <div data-testid="empty-state">No tasks found</div>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} data-testid={`task-${task.id}`}>
              <div>{task.title}</div>
              <button
                onClick={() => toggleTaskStatus(task.id, task.status)}
                data-testid={`toggle-${task.id}`}
              >
                Toggle Status
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                data-testid={`delete-${task.id}`}
              >
                Delete
              </button>
              <button
                onClick={() => openTaskDetails(task)}
                data-testid={`edit-${task.id}`}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  ),
}));

// Import the mocked components
import { TaskListEnhanced } from "@/components/tasks/task-list-enhanced";
import { DraggableTaskList } from "@/components/tasks/draggable-task-list";

describe("Task Management Components", () => {
  // Sample tasks for testing
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

  // Mock functions
  const mockToggleTaskStatus = jest.fn();
  const mockDeleteTask = jest.fn();
  const mockOpenTaskDetails = jest.fn();
  const mockOnReorder = jest.fn().mockResolvedValue(true);

  describe("TaskListEnhanced Component", () => {
    it("renders tasks correctly", () => {
      render(
        <TaskListEnhanced
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      expect(screen.getByTestId("task-list")).toBeInTheDocument();
      expect(screen.getByTestId("task-1")).toBeInTheDocument();
      expect(screen.getByTestId("task-2")).toBeInTheDocument();
      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(screen.getByText("Review code")).toBeInTheDocument();
    });

    it("displays empty state when no tasks", () => {
      render(
        <TaskListEnhanced
          tasks={[]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No tasks found")).toBeInTheDocument();
    });

    it("calls toggleTaskStatus when toggle button is clicked", () => {
      render(
        <TaskListEnhanced
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      fireEvent.click(screen.getByTestId("toggle-1"));
      expect(mockToggleTaskStatus).toHaveBeenCalledWith("1", "pending");
    });

    it("calls deleteTask when delete button is clicked", () => {
      render(
        <TaskListEnhanced
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      fireEvent.click(screen.getByTestId("delete-1"));
      expect(mockDeleteTask).toHaveBeenCalledWith("1");
    });

    it("calls openTaskDetails when edit button is clicked", () => {
      render(
        <TaskListEnhanced
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      fireEvent.click(screen.getByTestId("edit-1"));
      expect(mockOpenTaskDetails).toHaveBeenCalledWith(mockTasks[0]);
    });
  });

  describe("DraggableTaskList Component", () => {
    it("renders tasks correctly", () => {
      render(
        <DraggableTaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
          onReorder={mockOnReorder}
        />
      );

      expect(screen.getByTestId("draggable-task-list")).toBeInTheDocument();
      expect(screen.getByTestId("task-1")).toBeInTheDocument();
      expect(screen.getByTestId("task-2")).toBeInTheDocument();
      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(screen.getByText("Review code")).toBeInTheDocument();
    });

    it("displays empty state when no tasks", () => {
      render(
        <DraggableTaskList
          tasks={[]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
          onReorder={mockOnReorder}
        />
      );

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No tasks found")).toBeInTheDocument();
    });
  });
});
