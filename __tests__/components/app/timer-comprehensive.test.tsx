import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { Timer } from "@/components/app/timer";
import { useSettings } from "@/lib/contexts/settings-context";
import { useFocusMode } from "@/lib/contexts/focus-mode-context";

// Mock the hooks
jest.mock("@/lib/contexts/settings-context", () => ({
  useSettings: jest.fn(),
}));

jest.mock("@/lib/contexts/focus-mode-context", () => ({
  useFocusMode: jest.fn(),
}));

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

describe("Timer Component Comprehensive Tests", () => {
  beforeEach(() => {
    // Reset mocks
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

    // Mock focus mode
    (useFocusMode as jest.Mock).mockReturnValue({
      focusMode: false,
      settings: {
        enabled: false,
      },
      toggleFocusMode: jest.fn(),
    });

    // Mock Audio
    window.HTMLMediaElement.prototype.play = jest
      .fn()
      .mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
  });

  it("renders the timer with correct initial state", () => {
    render(<Timer />);

    // Check if timer displays the correct time (25:00)
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Check if start button is present
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();

    // Check if mode buttons are present
    expect(screen.getByRole("button", { name: /focus/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /short break/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /long break/i })
    ).toBeInTheDocument();
  });

  it("starts and pauses the timer correctly", () => {
    jest.useFakeTimers();

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Check if timer is running (button should now say "Pause")
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Timer should now show 24:59
    expect(screen.getByText("24:59")).toBeInTheDocument();

    // Pause the timer
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));

    // Button should now say "Resume"
    expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();

    // Advance timer by another second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Timer should still show 24:59 (paused)
    expect(screen.getByText("24:59")).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("changes timer mode correctly", () => {
    render(<Timer />);

    // Initially in pomodoro mode
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Switch to short break
    fireEvent.click(screen.getByRole("button", { name: /short break/i }));

    // Should now show 5:00
    expect(screen.getByText("05:00")).toBeInTheDocument();

    // Switch to long break
    fireEvent.click(screen.getByRole("button", { name: /long break/i }));

    // Should now show 15:00
    expect(screen.getByText("15:00")).toBeInTheDocument();

    // Switch back to pomodoro
    fireEvent.click(screen.getByRole("button", { name: /focus/i }));

    // Should now show 25:00 again
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("completes a timer cycle and transitions to the next mode", async () => {
    jest.useFakeTimers();

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Fast-forward to the end of the timer (25 minutes)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // Should have transitioned to short break
    await waitFor(() => {
      expect(screen.getByText("05:00")).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it("handles auto-start settings correctly", async () => {
    // Mock settings with auto-start enabled
    (useSettings as jest.Mock).mockReturnValue({
      settings: {
        timer: {
          pomodoroDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          autoStartBreaks: true,
          autoStartPomodoros: true,
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

    jest.useFakeTimers();

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Fast-forward to the end of the timer
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // Should have transitioned to short break and auto-started
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /pause/i })
      ).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it("toggles mute correctly", () => {
    render(<Timer />);

    // Find and click the mute button
    const muteButton = screen.getByRole("button", { name: /mute/i });
    fireEvent.click(muteButton);

    // Should now be muted (button should have aria-pressed="true")
    expect(muteButton).toHaveAttribute("aria-pressed", "true");

    // Click again to unmute
    fireEvent.click(muteButton);

    // Should now be unmuted
    expect(muteButton).toHaveAttribute("aria-pressed", "false");
  });

  it("records interruptions correctly", () => {
    jest.useFakeTimers();

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Advance timer by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Record an interruption
    const interruptButton = screen.getByRole("button", { name: /interrupt/i });
    fireEvent.click(interruptButton);

    // Should show 1 interruption
    expect(screen.getByText(/interruptions: 1/i)).toBeInTheDocument();

    // Record another interruption
    fireEvent.click(interruptButton);

    // Should show 2 interruptions
    expect(screen.getByText(/interruptions: 2/i)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("resets the timer correctly", () => {
    jest.useFakeTimers();

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Advance timer by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Timer should show 24:55
    expect(screen.getByText("24:55")).toBeInTheDocument();

    // Reset the timer
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    // Timer should be back to 25:00
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Button should say "Start" again
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();

    jest.useRealTimers();
  });
});
