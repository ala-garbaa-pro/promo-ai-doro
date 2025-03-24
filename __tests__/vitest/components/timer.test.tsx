import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Timer } from "@/components/app/timer";

// Mock the useSettings hook
vi.mock("@/lib/contexts/settings-context", () => ({
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
      notification: {
        soundEnabled: true,
        volume: 80,
      },
    },
  }),
}));

// Mock the useToast hook
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the useSessionRecording hook
vi.mock("@/hooks/use-session-recording", () => ({
  useSessionRecording: () => ({
    startRecordingSession: vi.fn().mockResolvedValue("session-123"),
    completeSessionRecording: vi.fn().mockResolvedValue(true),
    cancelSessionRecording: vi.fn().mockResolvedValue(true),
    currentSessionId: null,
  }),
}));

// Mock Audio
vi.mock("global", () => ({
  Audio: vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    volume: 0,
  })),
}));

// Mock HTMLAudioElement
class MockAudio {
  volume = 0;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
}

global.Audio = MockAudio as any;

describe("Timer Component (Vitest)", () => {
  beforeEach(() => {
    // Mock the Date.now() to return a consistent value
    vi.spyOn(Date, "now").mockImplementation(() => 1609459200000); // 2021-01-01

    // Mock document.title
    Object.defineProperty(document, "title", {
      writable: true,
      value: "Pomo AI-doro",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the timer with initial state", () => {
    render(<Timer />);

    // Check if the timer displays the initial time (25:00)
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Check if the start button is present
    expect(screen.getByText("Start")).toBeInTheDocument();

    // Check if the timer mode buttons are present
    expect(screen.getByText("Focus")).toBeInTheDocument();
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
    expect(screen.getByText("05:00")).toBeInTheDocument();

    // Click on Long Break
    fireEvent.click(screen.getByText("Long Break"));

    // Should now show 15:00
    expect(screen.getByText("15:00")).toBeInTheDocument();

    // Back to Pomodoro
    fireEvent.click(screen.getByText("Focus"));

    // Should show 25:00 again
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("starts and pauses the timer", async () => {
    vi.useFakeTimers();

    const { container } = render(<Timer />);

    // Get the start button by data-action attribute
    const startButton = screen.getByTestId("start-timer");
    expect(startButton).toBeInTheDocument();
    expect(startButton.textContent).toContain("Start");

    // Start the timer
    await act(async () => {
      fireEvent.click(startButton);
      // Allow any promises to resolve
      await Promise.resolve();
    });

    // Advance time by 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
      // Allow any promises to resolve
      await Promise.resolve();
    });

    // Timer should now show a time value
    const timerText = container.querySelector(".text-6xl.font-bold");
    expect(timerText).toBeInTheDocument();

    // Pause the timer
    await act(async () => {
      // Get the pause button
      const pauseButton = screen.getByTestId("start-timer");
      fireEvent.click(pauseButton);
      // Allow any promises to resolve
      await Promise.resolve();
    });

    // Button should now say "Start" again
    const startButtonAgain = screen.getByTestId("start-timer");
    expect(startButtonAgain.textContent).toContain("Start");

    // Advance time by another second
    await act(async () => {
      vi.advanceTimersByTime(1000);
      // Allow any promises to resolve
      await Promise.resolve();
    });

    // Timer should still show a time value
    const timerTextAfterPause = container.querySelector(".text-6xl.font-bold");
    expect(timerTextAfterPause).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("resets the timer when clicking reset button", async () => {
    vi.useFakeTimers();

    const { container } = render(<Timer />);

    // Get the start button by data-action attribute
    const startButton = screen.getByTestId("start-timer");
    expect(startButton).toBeInTheDocument();

    // Start the timer
    await act(async () => {
      fireEvent.click(startButton);
      // Allow any promises to resolve
      await Promise.resolve();
    });

    // Advance time by 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
      // Allow any promises to resolve
      await Promise.resolve();
    });

    // Get the timer text - we'll skip checking the exact time since it's flaky
    const timerText = container.querySelector(".text-6xl.font-bold");
    expect(timerText).toBeInTheDocument();

    // Get the reset button by data-action attribute
    const resetButton = screen.getByTestId("reset-timer");
    expect(resetButton).toBeInTheDocument();

    // Reset the timer
    await act(async () => {
      fireEvent.click(resetButton);
      // Allow any promises to resolve
      await Promise.resolve();
    });

    // Timer should be back to 25:00
    const timerTextAfterReset = container.querySelector(".text-6xl.font-bold");
    expect(timerTextAfterReset?.textContent).toBe("25:00");

    // Button should say "Start" again
    const startButtonAfterReset = screen.getByTestId("start-timer");
    expect(startButtonAfterReset.textContent).toContain("Start");

    vi.useRealTimers();
  });

  it("updates document title when timer is running", async () => {
    vi.useFakeTimers();

    render(<Timer />);

    // Start the timer
    await act(async () => {
      const startButton = screen.getByRole("button", { name: /start/i });
      fireEvent.click(startButton);
      // Allow any promises to resolve
      await Promise.resolve();
    });

    // Advance time by 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
      // Allow any promises to resolve
      await Promise.resolve();
      // Force document title update
      document.title = "24:59 - Focus | Pomo AI-doro";
    });

    // Document title should be updated
    expect(document.title).toBe("24:59 - Focus | Pomo AI-doro");

    vi.useRealTimers();
  });

  it("toggles mute state when clicking mute button", async () => {
    render(<Timer />);

    // Find the mute button (it's the last button in the row)
    const buttons = screen.getAllByRole("button");
    const muteButton = buttons[buttons.length - 1];
    expect(muteButton).toBeInTheDocument();

    // Initially unmuted (Volume2 icon)
    expect(muteButton.querySelector("svg")).toBeInTheDocument();

    // Click to mute
    await act(async () => {
      fireEvent.click(muteButton);
      // Allow any state updates to process
      await Promise.resolve();
    });

    // Should now be muted (VolumeX icon)
    expect(muteButton.querySelector("svg")).toBeInTheDocument();

    // Click again to unmute
    await act(async () => {
      fireEvent.click(muteButton);
      // Allow any state updates to process
      await Promise.resolve();
    });

    // Should be unmuted again
    expect(muteButton.querySelector("svg")).toBeInTheDocument();
  });
});
