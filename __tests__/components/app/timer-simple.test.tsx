import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Timer } from "@/components/app/timer";
import { SettingsProvider } from "@/lib/contexts/settings-context";
import { AccessibilityProvider } from "@/lib/contexts/accessibility-context";
import { ThemeProvider } from "next-themes";

// Mock the hooks
jest.mock("@/lib/contexts/settings-context", () => {
  const originalModule = jest.requireActual("@/lib/contexts/settings-context");
  return {
    ...originalModule,
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
          tickSound: true,
        },
        notification: {
          soundEnabled: true,
          volume: 80,
        },
      },
    }),
    SettingsProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

jest.mock("@/lib/contexts/accessibility-context", () => {
  return {
    useAccessibility: () => ({
      announceToScreenReader: jest.fn(),
      isReducedMotion: false,
    }),
    AccessibilityProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: "light",
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock Audio
const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockPause = jest.fn();

global.Audio = jest.fn().mockImplementation(() => ({
  play: mockPlay,
  pause: mockPause,
  volume: 0,
}));

describe("Timer Component - Simple Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the timer component with correct initial state", () => {
    render(
      <ThemeProvider>
        <SettingsProvider>
          <AccessibilityProvider>
            <Timer />
          </AccessibilityProvider>
        </SettingsProvider>
      </ThemeProvider>
    );

    // Check if timer display shows the initial time (25:00)
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Check if mode buttons are rendered
    expect(screen.getByRole("button", { name: /focus/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /short break/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /long break/i })
    ).toBeInTheDocument();

    // Check if control buttons are rendered
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("starts and pauses the timer correctly", () => {
    render(
      <ThemeProvider>
        <SettingsProvider>
          <AccessibilityProvider>
            <Timer />
          </AccessibilityProvider>
        </SettingsProvider>
      </ThemeProvider>
    );

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

    // Timer should still show 24:59 because it's paused
    expect(screen.getByText("24:59")).toBeInTheDocument();
  });

  it("resets the timer correctly", () => {
    render(
      <ThemeProvider>
        <SettingsProvider>
          <AccessibilityProvider>
            <Timer />
          </AccessibilityProvider>
        </SettingsProvider>
      </ThemeProvider>
    );

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Advance timer by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Timer should now show 24:55
    expect(screen.getByText("24:55")).toBeInTheDocument();

    // Reset the timer
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    // Timer should now show 25:00 again
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Button should say "Start" again
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("changes timer mode correctly", () => {
    render(
      <ThemeProvider>
        <SettingsProvider>
          <AccessibilityProvider>
            <Timer />
          </AccessibilityProvider>
        </SettingsProvider>
      </ThemeProvider>
    );

    // Initial mode should be "pomodoro"
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Change to short break
    fireEvent.click(screen.getByRole("button", { name: /short break/i }));

    // Timer should now show 5:00
    expect(screen.getByText("5:00")).toBeInTheDocument();

    // Change to long break
    fireEvent.click(screen.getByRole("button", { name: /long break/i }));

    // Timer should now show 15:00
    expect(screen.getByText("15:00")).toBeInTheDocument();

    // Change back to pomodoro
    fireEvent.click(screen.getByRole("button", { name: /focus/i }));

    // Timer should now show 25:00 again
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });
});
