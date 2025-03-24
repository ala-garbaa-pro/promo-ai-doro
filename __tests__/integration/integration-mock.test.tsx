import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Mock components for integration testing
const MockTimer = ({ onComplete }: { onComplete: () => void }) => {
  const [time, setTime] = React.useState(25 * 60);
  const [isRunning, setIsRunning] = React.useState(false);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(25 * 60);
  };

  // Simulate timer completion
  const completeTimer = () => {
    setTime(0);
    setIsRunning(false);
    onComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div data-testid="timer">
      <div data-testid="timer-display">{formatTime(time)}</div>
      <button onClick={startTimer} data-testid="start-button">
        Start
      </button>
      <button onClick={pauseTimer} data-testid="pause-button">
        Pause
      </button>
      <button onClick={resetTimer} data-testid="reset-button">
        Reset
      </button>
      <button onClick={completeTimer} data-testid="complete-button">
        Complete (Test Only)
      </button>
    </div>
  );
};

const MockTaskList = ({
  onTaskComplete,
}: {
  onTaskComplete: (taskId: string) => void;
}) => {
  const [tasks, setTasks] = React.useState([
    { id: "1", title: "Task 1", completed: false },
    { id: "2", title: "Task 2", completed: false },
  ]);

  const toggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    onTaskComplete(taskId);
  };

  return (
    <div data-testid="task-list">
      <ul>
        {tasks.map((task) => (
          <li key={task.id} data-testid={`task-${task.id}`}>
            <span>{task.title}</span>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskStatus(task.id)}
              data-testid={`task-checkbox-${task.id}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

const MockApp = () => {
  const [completedPomodoros, setCompletedPomodoros] = React.useState(0);
  const [completedTasks, setCompletedTasks] = React.useState(0);

  const handleTimerComplete = () => {
    setCompletedPomodoros((prev) => prev + 1);
  };

  const handleTaskComplete = () => {
    setCompletedTasks((prev) => prev + 1);
  };

  return (
    <div>
      <h1>Pomo AI-doro</h1>
      <div data-testid="stats">
        <div>Completed Pomodoros: {completedPomodoros}</div>
        <div>Completed Tasks: {completedTasks}</div>
      </div>
      <MockTimer onComplete={handleTimerComplete} />
      <MockTaskList onTaskComplete={handleTaskComplete} />
    </div>
  );
};

describe("Integration Tests", () => {
  it("renders the app with timer and task list", () => {
    render(<MockApp />);

    expect(screen.getByText("Pomo AI-doro")).toBeInTheDocument();
    expect(screen.getByTestId("timer")).toBeInTheDocument();
    expect(screen.getByTestId("task-list")).toBeInTheDocument();
  });

  it("updates stats when timer completes", () => {
    render(<MockApp />);

    // Initial stats should be zero
    expect(screen.getByText("Completed Pomodoros: 0")).toBeInTheDocument();

    // Complete the timer
    fireEvent.click(screen.getByTestId("complete-button"));

    // Stats should be updated
    expect(screen.getByText("Completed Pomodoros: 1")).toBeInTheDocument();
  });

  it("updates stats when task is completed", () => {
    render(<MockApp />);

    // Initial stats should be zero
    expect(screen.getByText("Completed Tasks: 0")).toBeInTheDocument();

    // Complete a task
    fireEvent.click(screen.getByTestId("task-checkbox-1"));

    // Stats should be updated
    expect(screen.getByText("Completed Tasks: 1")).toBeInTheDocument();
  });

  it("handles timer controls correctly", () => {
    render(<MockApp />);

    // Start the timer
    fireEvent.click(screen.getByTestId("start-button"));

    // Pause the timer
    fireEvent.click(screen.getByTestId("pause-button"));

    // Reset the timer
    fireEvent.click(screen.getByTestId("reset-button"));

    // Timer should display initial time
    expect(screen.getByTestId("timer-display")).toHaveTextContent("25:00");
  });
});
