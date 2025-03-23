import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Timer } from "@/components/app/timer";

// Mock the useSettings hook
jest.mock("@/lib/contexts/settings-context", () => ({
  useSettings: () => ({
    settings: {
      timer: {
        pomodoroDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        longBreakInterval: 4,
        countDirection: "down",
      },
    },
  }),
}));

// Mock the useToast hook
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock Audio API
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  volume: 0,
}));

describe("Timer Component", () => {
  beforeEach(() => {
    // Mock the Date.now() to return a consistent value
    jest.spyOn(Date, "now").mockImplementation(() => 1609459200000); // 2021-01-01
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the timer with initial state", () => {
    render(<Timer />);

    // Check if the timer displays the initial time (25:00)
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Check if the start button is present
    expect(screen.getByText("Start")).toBeInTheDocument();

    // Check if the timer mode buttons are present
    expect(screen.getByText("Pomodoro")).toBeInTheDocument();
    expect(screen.getByText("Short Break")).toBeInTheDocument();
    expect(screen.getByText("Long Break")).toBeInTheDocument();
  });

  it("changes timer mode when clicking on mode buttons", () => {
    render(<Timer />);

    // Initially in Pomodoro mode (25:00)
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Click on Short Break
    fireEvent.click(screen.getByText("Short Break"));

    // Should now show 5:00
    expect(screen.getByText("5:00")).toBeInTheDocument();

    // Click on Long Break
    fireEvent.click(screen.getByText("Long Break"));

    // Should now show 15:00
    expect(screen.getByText("15:00")).toBeInTheDocument();

    // Back to Pomodoro
    fireEvent.click(screen.getByText("Pomodoro"));

    // Should show 25:00 again
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("starts and pauses the timer", () => {
    jest.useFakeTimers();

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByText("Start"));

    // Button should now say "Pause"
    expect(screen.getByText("Pause")).toBeInTheDocument();

    // Advance time by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Timer should now show 24:59
    expect(screen.getByText("24:59")).toBeInTheDocument();

    // Pause the timer
    fireEvent.click(screen.getByText("Pause"));

    // Button should now say "Start" again
    expect(screen.getByText("Start")).toBeInTheDocument();

    // Advance time by another second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Timer should still show 24:59 because it's paused
    expect(screen.getByText("24:59")).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("resets the timer when clicking reset button", () => {
    jest.useFakeTimers();

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByText("Start"));

    // Advance time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Timer should now show 24:55
    expect(screen.getByText("24:55")).toBeInTheDocument();

    // Reset the timer
    fireEvent.click(screen.getByLabelText("Reset Timer"));

    // Timer should be back to 25:00
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Button should say "Start" again
    expect(screen.getByText("Start")).toBeInTheDocument();

    jest.useRealTimers();
  });
});
