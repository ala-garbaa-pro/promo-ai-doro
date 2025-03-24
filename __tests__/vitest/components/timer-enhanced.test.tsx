import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Timer } from "@/components/app/timer";

// Mock the settings context
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
        timerLabels: {
          pomodoro: "Focus",
          shortBreak: "Short Break",
          longBreak: "Long Break",
        },
      },
      notification: {
        soundEnabled: true,
        desktopNotificationsEnabled: true,
        volume: 80,
        notificationSound: "bell",
        customMessages: {
          pomodoro: "Time to focus!",
          shortBreak: "Take a short break!",
          longBreak: "Take a long break!",
        },
      },
      accessibility: {
        keyboardShortcutsEnabled: true,
        highContrastMode: false,
        reducedMotion: false,
      },
    },
  }),
}));

// Mock the session recording hook
vi.mock("@/hooks/use-session-recording", () => ({
  useSessionRecording: () => ({
    recordSession: vi.fn(),
    recordInterruption: vi.fn(),
  }),
}));

// Mock the toast hook
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the audio element
global.HTMLMediaElement.prototype.play = vi.fn();
global.HTMLMediaElement.prototype.pause = vi.fn();

describe("Timer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the timer component", () => {
    render(<Timer />);

    // Check if the timer display is rendered
    expect(screen.getByRole("timer")).toBeTruthy();

    // Check if the control buttons are rendered
    expect(screen.getByLabelText("Start timer")).toBeTruthy();
    expect(screen.getByLabelText("Reset timer")).toBeTruthy();
    expect(screen.getByLabelText("Mute")).toBeTruthy();
  });

  it("displays the correct initial time", () => {
    render(<Timer />);

    // The initial time should be 25:00 (pomodoro duration)
    const timerDisplay = screen.getByRole("timer");
    expect(timerDisplay.textContent).toBe("25:00");
  });

  it("changes mode when clicking mode buttons", () => {
    render(<Timer />);

    // Click on short break button
    fireEvent.click(screen.getByLabelText("Short break mode"));

    // The time should change to 5:00 (short break duration)
    const timerDisplay = screen.getByRole("timer");
    expect(timerDisplay.textContent).toBe("05:00");

    // Click on long break button
    fireEvent.click(screen.getByLabelText("Long break mode"));

    // The time should change to 15:00 (long break duration)
    expect(timerDisplay.textContent).toBe("15:00");

    // Click on focus button
    fireEvent.click(screen.getByLabelText("Focus mode"));

    // The time should change back to 25:00 (pomodoro duration)
    expect(timerDisplay.textContent).toBe("25:00");
  });
});
