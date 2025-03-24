import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
        tickSound: false,
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

// Mock the AnimatedTransition component
vi.mock("@/components/ui/animated-transition", () => ({
  AnimatedTransition: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-transition">{children}</div>
  ),
}));

describe("Timer Component", () => {
  beforeEach(() => {
    // Mock the Date.now() to return a consistent value
    vi.spyOn(Date, "now").mockImplementation(() => 1609459200000); // 2021-01-01

    // Mock Audio
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      volume: 0,
    }));

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
});
