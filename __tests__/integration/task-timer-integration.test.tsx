import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { Timer } from "@/components/app/timer";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";
import { TaskListEnhanced } from "@/components/tasks/task-list-enhanced";
import { useSettings } from "@/lib/contexts/settings-context";
import { useTasks, Task } from "@/hooks/use-tasks";

// Mock the hooks
jest.mock("@/lib/contexts/settings-context", () => ({
  useSettings: jest.fn(),
}));

jest.mock("@/hooks/use-tasks", () => ({
  useTasks: jest.fn(),
}));

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Create a wrapper component that integrates timer and tasks
const IntegratedApp = () => {
  const { tasks, createTask, toggleTaskStatus, deleteTask } = useTasks();

  const handleTaskCreate = (parsedTask: any) => {
    createTask({
      title: parsedTask.title,
      priority: parsedTask.priority || "medium",
      status: "pending",
      estimatedPomodoros: parsedTask.estimatedPomodoros || 1,
      dueDate: parsedTask.dueDate,
      category: parsedTask.category,
      tags: parsedTask.tags,
    });
  };

  const handleOpenTaskDetails = (task: Task) => {
    // Mock implementation
    console.log("Opening task details:", task);
  };

  return (
    <div>
      <h1>Pomo AI-doro</h1>
      <div data-testid="timer">
        <Timer />
      </div>
      <div data-testid="task-input">
        <NaturalLanguageTaskInput onTaskCreate={handleTaskCreate} />
      </div>
      <div data-testid="task-list">
        <TaskListEnhanced
          tasks={tasks}
          toggleTaskStatus={toggleTaskStatus}
          deleteTask={deleteTask}
          openTaskDetails={handleOpenTaskDetails}
        />
      </div>
      <div data-testid="stats">
        <p>Completed Pomodoros: {0}</p>
      </div>
    </div>
  );
};

describe("Task and Timer Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock settings
    (useSettings as jest.Mock).mockReturnValue({
      settings: {
        timer: {
          pomodoroDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          autoStartBreaks: false,
          autoStartPomodoros: false,
          longBreakInterval: 4,
          countDirection: "down",
          timerLabels: {
            pomodoro: "Focus",
            shortBreak: "Short Break",
            longBreak: "Long Break",
          },
          tickSound: true,
        },
        notification: {
          soundEnabled: true,
          volume: 80,
        },
      },
    });

    // Mock tasks
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Existing task",
        priority: "medium",
        status: "pending",
        estimatedPomodoros: 2,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const mockCreateTask = jest.fn((newTask) => {
      mockTasks.push({
        ...newTask,
        id: `${mockTasks.length + 1}`,
        order: mockTasks.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return Promise.resolve(mockTasks[mockTasks.length - 1]);
    });

    const mockToggleTaskStatus = jest.fn((taskId, status) => {
      const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        mockTasks[taskIndex].status = status;
      }
      return Promise.resolve(true);
    });

    const mockDeleteTask = jest.fn((taskId) => {
      const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        mockTasks.splice(taskIndex, 1);
      }
      return Promise.resolve(true);
    });

    (useTasks as jest.Mock).mockReturnValue({
      tasks: mockTasks,
      createTask: mockCreateTask,
      toggleTaskStatus: mockToggleTaskStatus,
      deleteTask: mockDeleteTask,
      isLoading: false,
      error: null,
    });

    // Mock Audio
    window.HTMLMediaElement.prototype.play = jest
      .fn()
      .mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
  });

  it("renders the integrated app with timer and task list", () => {
    render(<IntegratedApp />);

    // Check if app title is rendered
    expect(screen.getByText("Pomo AI-doro")).toBeInTheDocument();

    // Check if timer is rendered
    expect(screen.getByTestId("timer")).toBeInTheDocument();

    // Check if task input is rendered
    expect(screen.getByTestId("task-input")).toBeInTheDocument();

    // Check if task list is rendered
    expect(screen.getByTestId("task-list")).toBeInTheDocument();

    // Check if existing task is rendered
    expect(screen.getByText("Existing task")).toBeInTheDocument();
  });

  it("creates a new task and starts a timer session", async () => {
    render(<IntegratedApp />);

    // Find the task input
    const input = screen.getByPlaceholderText(/add a task/i);

    // Type a new task
    fireEvent.change(input, {
      target: { value: "Complete project report #high ~3 by tomorrow" },
    });

    // Submit the task
    fireEvent.keyDown(input, { key: "Enter" });

    // Wait for the task to be created
    await waitFor(() => {
      expect(screen.getByText("Complete project report")).toBeInTheDocument();
    });

    // Start the timer
    const startButton = screen.getByRole("button", { name: /start/i });
    fireEvent.click(startButton);

    // Check if timer is running (button should now say "Pause")
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("completes a task and updates the timer", async () => {
    render(<IntegratedApp />);

    // Find the existing task
    const taskCheckbox = screen.getByRole("checkbox", {
      name: /existing task/i,
    });

    // Complete the task
    fireEvent.click(taskCheckbox);

    // Wait for the task status to update
    await waitFor(() => {
      expect(taskCheckbox).toBeChecked();
    });

    // Start the timer
    const startButton = screen.getByRole("button", { name: /start/i });
    fireEvent.click(startButton);

    // Fast-forward to complete the timer
    jest.useFakeTimers();
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });
    jest.useRealTimers();

    // Check if timer completed and transitioned to break
    await waitFor(() => {
      expect(
        screen.getByText(/short break/i, { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("deletes a task", async () => {
    render(<IntegratedApp />);

    // Find the existing task
    expect(screen.getByText("Existing task")).toBeInTheDocument();

    // Find and click the delete button
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    // Wait for the task to be deleted
    await waitFor(() => {
      expect(screen.queryByText("Existing task")).not.toBeInTheDocument();
    });
  });

  it("handles timer mode changes", () => {
    render(<IntegratedApp />);

    // Initially in pomodoro mode
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Switch to short break
    const shortBreakButton = screen.getByRole("button", {
      name: /short break/i,
    });
    fireEvent.click(shortBreakButton);

    // Should now show 5:00
    expect(screen.getByText("05:00")).toBeInTheDocument();

    // Switch to long break
    const longBreakButton = screen.getByRole("button", { name: /long break/i });
    fireEvent.click(longBreakButton);

    // Should now show 15:00
    expect(screen.getByText("15:00")).toBeInTheDocument();
  });
});
