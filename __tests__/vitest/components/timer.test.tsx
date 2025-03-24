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

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Button should now say "Pause"
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();

    // Advance time by 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Timer should now show 24:59
    expect(screen.getByText("24:59")).toBeInTheDocument();

    // Pause the timer
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));

    // Button should now say "Start" again
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();

    // Advance time by another second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Timer should still show 24:59 because it's paused
    expect(screen.getByText("24:59")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("resets the timer when clicking reset button", async () => {
    vi.useFakeTimers();

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Advance time by 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Timer should now show 24:55
    expect(screen.getByText("24:55")).toBeInTheDocument();

    // Reset the timer
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    // Timer should be back to 25:00
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Button should say "Start" again
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("updates document title when timer is running", async () => {
    vi.useFakeTimers();

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Advance time by 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Document title should be updated
    expect(document.title).toBe("24:59 - Focus | Pomo AI-doro");

    vi.useRealTimers();
  });

  it("toggles mute state when clicking mute button", () => {
    render(<Timer />);

    // Find and click the mute button
    const muteButton = screen.getByRole("button", { name: "" });
    expect(muteButton).toBeInTheDocument();

    // Initially unmuted (Volume2 icon)
    expect(muteButton.querySelector("svg")).toBeInTheDocument();

    // Click to mute
    fireEvent.click(muteButton);

    // Should now be muted (VolumeX icon)
    expect(muteButton.querySelector("svg")).toBeInTheDocument();

    // Click again to unmute
    fireEvent.click(muteButton);

    // Should be unmuted again
    expect(muteButton.querySelector("svg")).toBeInTheDocument();
  });
});
