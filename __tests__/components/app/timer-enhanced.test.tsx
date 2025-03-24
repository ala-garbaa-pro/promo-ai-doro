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
import { useToast } from "@/components/ui/use-toast";

// Mock the UI components
jest.mock(
  "@/components/ui/button",
  () => require("../../../__tests__/__mocks__/ui-components-mock").Button
);
jest.mock("@/components/ui/card", () => ({
  Card: require("../../../__tests__/__mocks__/ui-components-mock").Card,
  CardContent: require("../../../__tests__/__mocks__/ui-components-mock")
    .CardContent,
}));
jest.mock(
  "@/components/ui/progress",
  () => require("../../../__tests__/__mocks__/ui-components-mock").Progress
);
jest.mock("@/components/ui/tabs", () => ({
  Tabs: require("../../../__tests__/__mocks__/ui-components-mock").Tabs,
  TabsList: require("../../../__tests__/__mocks__/ui-components-mock").TabsList,
  TabsTrigger: require("../../../__tests__/__mocks__/ui-components-mock")
    .TabsTrigger,
  TabsContent: require("../../../__tests__/__mocks__/ui-components-mock")
    .TabsContent,
}));
jest.mock("@/components/ui/animated-transition", () => ({
  AnimatedTransition: require("../../../__tests__/__mocks__/ui-components-mock")
    .AnimatedTransition,
}));

// Mock the useSettings hook
jest.mock("@/lib/contexts/settings-context", () => ({
  useSettings: jest.fn(),
}));

// Mock the useToast hook
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

// Mock useSessionRecording hook
jest.mock("@/hooks/use-session-recording", () => ({
  useSessionRecording: () => ({
    startRecordingSession: jest
      .fn()
      .mockResolvedValue({ id: "test-session-id" }),
    completeSessionRecording: jest.fn().mockResolvedValue({}),
    cancelSessionRecording: jest.fn().mockResolvedValue({}),
    currentSessionId: "test-session-id",
  }),
}));

// Mock Audio API
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  volume: 0,
}));

// Mock fetch for session recording
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: "test-session-id" }),
  })
);

describe("Timer Component", () => {
  beforeEach(() => {
    // Reset mocks
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

    // Mock document.title
    Object.defineProperty(document, "title", {
      writable: true,
      value: "Pomo AI-doro",
    });
  });

  it("renders timer with correct initial state", () => {
    render(<Timer />);

    // Check if timer displays the correct time (25:00)
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Check if start button is present
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("starts and stops the timer correctly", async () => {
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

    // Check if time has decreased
    expect(screen.getByText("24:59")).toBeInTheDocument();

    // Pause the timer
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));

    // Check if timer is paused (button should now say "Resume")
    expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();

    // Advance timer by 1 second (should not change time since paused)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Time should still be the same
    expect(screen.getByText("24:59")).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("changes mode correctly", () => {
    render(<Timer />);

    // Find and click the short break tab
    const shortBreakTab = screen.getByText("Short Break");
    fireEvent.click(shortBreakTab);

    // Check if timer displays the correct time for short break (5:00)
    expect(screen.getByText("5:00")).toBeInTheDocument();
  });

  it("completes a timer session correctly", async () => {
    jest.useFakeTimers();

    render(<Timer />);

    // Start the timer
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // Fast-forward to almost the end of the timer (25 minutes - 1 second)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000 - 1000);
    });

    // Check if time is at 0:01
    expect(screen.getByText("0:01")).toBeInTheDocument();

    // Complete the timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for completion logic to run
    await waitFor(() => {
      // Check if fetch was called to complete the session
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/sessions/"),
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    jest.useRealTimers();
  });

  it("handles auto-start settings correctly", () => {
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

    // Wait for completion logic to run
    waitFor(() => {
      // Find and click the short break tab
      const shortBreakTab = screen.getByText("Short Break");
      fireEvent.click(shortBreakTab);

      // Timer should auto-start for break
      expect(
        screen.getByRole("button", { name: /pause/i })
      ).toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
