import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsProvider } from "@/lib/contexts/settings-context";
import { AccessibilityProvider } from "@/lib/contexts/accessibility-context";
import { FocusModeProvider } from "@/lib/contexts/focus-mode-context";
import { Timer } from "@/components/app/timer";
import { TaskList } from "@/components/tasks/task-list";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";
import { Task } from "@/hooks/use-tasks";

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock the next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Audio
const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockPause = jest.fn();

global.Audio = jest.fn().mockImplementation(() => ({
  play: mockPlay,
  pause: mockPause,
  volume: 0,
}));

// Integrated app component for testing
const IntegratedApp = () => {
  const [tasks, setTasks] = React.useState<Task[]>([
    {
      id: "1",
      title: "Existing task",
      description: "This is an existing task",
      priority: "medium",
      status: "pending",
      estimatedPomodoros: 2,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [currentMode, setCurrentMode] = React.useState<
    "pomodoro" | "short-break" | "long-break"
  >("pomodoro");
  const [completedPomodoros, setCompletedPomodoros] = React.useState(0);
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);

  // Mock task handlers
  const handleCreateTask = (
    newTask: Omit<Task, "id" | "createdAt" | "updatedAt" | "order">
  ) => {
    const task: Task = {
      id: `task-${tasks.length + 1}`,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority || "medium",
      status: newTask.status || "pending",
      estimatedPomodoros: newTask.estimatedPomodoros,
      order: tasks.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, task]);
    return task;
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newStatus =
            task.status === "completed" ? "pending" : "completed";
          return {
            ...task,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleOpenTaskDetails = (taskId: string) => {
    setActiveTaskId(taskId);
  };

  const handleTimerComplete = () => {
    if (currentMode === "pomodoro") {
      setCompletedPomodoros((prev) => prev + 1);

      // Update active task if there is one
      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((task) => {
            if (task.id === activeTaskId) {
              return {
                ...task,
                actualPomodoros: (task.actualPomodoros || 0) + 1,
                updatedAt: new Date().toISOString(),
              };
            }
            return task;
          })
        );
      }
    }
  };

  const handleModeChange = (
    mode: "pomodoro" | "short-break" | "long-break"
  ) => {
    setCurrentMode(mode);
  };

  return (
    <SettingsProvider>
      <AccessibilityProvider>
        <FocusModeProvider>
          <div>
            <h1>Pomo AI-doro</h1>

            <div data-testid="stats">
              <div>Completed Pomodoros: {completedPomodoros}</div>
              <div>
                Active Task:{" "}
                {activeTaskId
                  ? tasks.find((t) => t.id === activeTaskId)?.title
                  : "None"}
              </div>
            </div>

            <div data-testid="timer">
              <Timer
                mode={currentMode}
                onModeChange={handleModeChange}
                onComplete={handleTimerComplete}
                activeTaskId={activeTaskId}
              />
            </div>

            <div data-testid="task-input">
              <NaturalLanguageTaskInput onTaskCreate={handleCreateTask} />
            </div>

            <div data-testid="task-list">
              <TaskList
                tasks={tasks}
                toggleTaskStatus={handleToggleTaskStatus}
                deleteTask={handleDeleteTask}
                openTaskDetails={handleOpenTaskDetails}
              />
            </div>
          </div>
        </FocusModeProvider>
      </AccessibilityProvider>
    </SettingsProvider>
  );
};

describe("Timer and Task Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
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
    const user = userEvent.setup();

    render(<IntegratedApp />);

    // Find the task input
    const input = screen.getByPlaceholderText(/add a task/i);

    // Type a new task
    await user.type(input, "Complete project report #high ~3 by tomorrow");
    await user.keyboard("{Enter}");

    // Wait for the task to be created
    await waitFor(() => {
      expect(screen.getByText("Complete project report")).toBeInTheDocument();
    });

    // Start the timer
    const startButton = screen.getByRole("button", { name: /start/i });
    await user.click(startButton);

    // Check if timer is running (button should now say "Pause")
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("completes a task and updates the timer", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();

    render(<IntegratedApp />);

    // Find the existing task
    const taskTitle = screen.getByText("Existing task");

    // Click on the task to set it as active
    await user.click(taskTitle);

    // Check if task is set as active
    expect(screen.getByText(/Active Task: Existing task/)).toBeInTheDocument();

    // Start the timer
    const startButton = screen.getByRole("button", { name: /start/i });
    await user.click(startButton);

    // Fast-forward to complete the timer
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // Check if completed pomodoros increased
    expect(screen.getByText("Completed Pomodoros: 1")).toBeInTheDocument();

    // Complete the task
    const taskCheckbox = screen.getByRole("checkbox", {
      name: /existing task/i,
    });

    await user.click(taskCheckbox);

    // Check if task is marked as completed
    expect(taskCheckbox).toBeChecked();

    jest.useRealTimers();
  });

  it("deletes a task", async () => {
    const user = userEvent.setup();

    render(<IntegratedApp />);

    // Find the existing task
    expect(screen.getByText("Existing task")).toBeInTheDocument();

    // Find and click the delete button
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    // Wait for the task to be deleted
    await waitFor(() => {
      expect(screen.queryByText("Existing task")).not.toBeInTheDocument();
    });
  });

  it("handles timer mode changes", async () => {
    const user = userEvent.setup();

    render(<IntegratedApp />);

    // Initial mode should be "pomodoro"
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Change to short break
    const shortBreakButton = screen.getByRole("button", {
      name: /short break/i,
    });
    await user.click(shortBreakButton);

    // Timer should now show 5:00
    expect(screen.getByText("5:00")).toBeInTheDocument();

    // Change to long break
    const longBreakButton = screen.getByRole("button", { name: /long break/i });
    await user.click(longBreakButton);

    // Timer should now show 15:00
    expect(screen.getByText("15:00")).toBeInTheDocument();

    // Change back to pomodoro
    const pomodoroButton = screen.getByRole("button", { name: /focus/i });
    await user.click(pomodoroButton);

    // Timer should now show 25:00 again
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("resets the timer", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();

    render(<IntegratedApp />);

    // Start the timer
    const startButton = screen.getByRole("button", { name: /start/i });
    await user.click(startButton);

    // Advance timer by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Timer should now show 24:55
    expect(screen.getByText("24:55")).toBeInTheDocument();

    // Reset the timer
    const resetButton = screen.getByRole("button", { name: /reset/i });
    await user.click(resetButton);

    // Timer should now show 25:00 again
    expect(screen.getByText("25:00")).toBeInTheDocument();

    jest.useRealTimers();
  });
});
