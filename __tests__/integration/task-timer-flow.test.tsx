import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";
import { Timer } from "@/components/app/timer";
import { TaskListEnhanced } from "@/components/tasks/task-list-enhanced";
import { Task, TaskStatus } from "@/hooks/use-tasks";
import { useSettings } from "@/lib/contexts/settings-context";
import { useToast } from "@/components/ui/use-toast";

// Mock the hooks
jest.mock("@/lib/contexts/settings-context", () => ({
  useSettings: jest.fn(),
}));

jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: "test-id" }),
  })
);

// Mock Audio API
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  volume: 0,
}));

// Mock SpeechRecognition
Object.defineProperty(window, "SpeechRecognition", {
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

describe("Task and Timer Integration", () => {
  // Sample tasks for testing
  const tasks: Task[] = [
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
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
        },
        notification: {
          soundEnabled: true,
          volume: 80,
        },
      },
    });

    (useToast as jest.Mock).mockReturnValue({
      toast: jest.fn(),
    });
  });

  it("creates a task and starts a timer session", async () => {
    // Mock task creation handler
    const handleTaskCreate = jest.fn();

    // Render the task input component
    render(<NaturalLanguageTaskInput onTaskCreate={handleTaskCreate} />);

    // Type a task with natural language
    const input = screen.getByPlaceholderText(/add a task/i);
    fireEvent.change(input, {
      target: { value: "Complete project report by tomorrow #high ~3" },
    });

    // Submit the task
    fireEvent.keyDown(input, { key: "Enter" });

    // Verify task was created with correct data
    await waitFor(() => {
      expect(handleTaskCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Complete project report",
          priority: "high",
          estimatedPomodoros: 3,
          dueDate: expect.any(Date),
        })
      );
    });

    // Now render the task list with the new task
    const newTask: Task = {
      id: "new-task",
      title: "Complete project report",
      priority: "high",
      status: "pending",
      estimatedPomodoros: 3,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const toggleTaskStatus = jest.fn();
    const deleteTask = jest.fn();
    const openTaskDetails = jest.fn();

    render(
      <TaskListEnhanced
        tasks={[newTask]}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Verify the task is displayed
    expect(screen.getByText("Complete project report")).toBeInTheDocument();

    // Now render the timer component
    const onModeChange = jest.fn();
    render(<Timer mode="pomodoro" onModeChange={onModeChange} />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Verify timer started
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();

    // Verify session was created via API
    expect(fetch).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("work"),
      })
    );
  });

  it("completes a task and updates timer statistics", async () => {
    // Mock functions
    const toggleTaskStatus = jest.fn();
    const deleteTask = jest.fn();
    const openTaskDetails = jest.fn();

    // Render task list
    render(
      <TaskListEnhanced
        tasks={tasks}
        toggleTaskStatus={toggleTaskStatus}
        deleteTask={deleteTask}
        openTaskDetails={openTaskDetails}
      />
    );

    // Find and click the status toggle button to complete the task
    const statusButton = screen.getByRole("button", {
      name: /toggle task status/i,
    });
    fireEvent.click(statusButton);

    // Verify toggleTaskStatus was called
    expect(toggleTaskStatus).toHaveBeenCalledWith("1", "pending");

    // Now render the timer component
    jest.useFakeTimers();
    const onModeChange = jest.fn();

    render(<Timer mode="pomodoro" onModeChange={onModeChange} />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Fast-forward to the end of the timer
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // Wait for completion logic to run
    await waitFor(() => {
      // Check if onModeChange was called to switch to break
      expect(onModeChange).toHaveBeenCalledWith("short-break");

      // Check if session was completed via API
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/sessions/"),
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    jest.useRealTimers();
  });
});
