import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdaptiveSessionRecommendations } from "@/components/app/adaptive-session-recommendations";
import { useAdaptiveSessions } from "@/hooks/use-adaptive-sessions";
import { useSettings } from "@/lib/contexts/settings-context";

// Mock the hooks
jest.mock("@/hooks/use-adaptive-sessions", () => ({
  useAdaptiveSessions: jest.fn(),
}));

jest.mock("@/lib/contexts/settings-context", () => ({
  useSettings: jest.fn(),
}));

jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("AdaptiveSessionRecommendations", () => {
  const mockFetchRecommendations = jest.fn();
  const mockFetchFocusPatterns = jest.fn();
  const mockUpdateTimerSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for useAdaptiveSessions
    jest.mocked(useAdaptiveSessions).mockReturnValue({
      recommendations: null,
      focusPatterns: null,
      isLoading: false,
      error: null,
      fetchRecommendations: mockFetchRecommendations,
      fetchFocusPatterns: mockFetchFocusPatterns,
      applyRecommendedSettings: jest.fn(),
    });

    // Default mock implementation for useSettings
    jest.mocked(useSettings).mockReturnValue({
      settings: {
        timer: {
          pomodoroDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          autoStartBreaks: false,
          autoStartPomodoros: false,
          longBreakInterval: 4,
          autoIncrementFocus: false,
          incrementAmount: 5,
          dailyGoal: 8,
          timerLabels: {
            pomodoro: "Focus",
            shortBreak: "Short Break",
            longBreak: "Long Break",
          },
          countDirection: "down",
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
          showRemainingTime: true,
          notifyBeforeEnd: false,
          notifyBeforeEndTime: 30,
          ambientSounds: {
            enabled: true,
            volume: 50,
            defaultSound: "rain",
            autoPlay: false,
          },
        },
        theme: {
          fontSize: "medium",
          accentColor: "indigo",
          fontFamily: "system",
          animationSpeed: "normal",
          useCustomColors: false,
          customColors: {
            primary: "#6366f1",
            background: "#ffffff",
            card: "#f8fafc",
          },
          timerStyle: "classic",
          showProgressBar: true,
        },
        accessibility: {
          highContrastMode: false,
          reducedMotion: false,
          largeText: false,
          keyboardShortcutsEnabled: true,
          screenReaderAnnouncements: true,
        },
      },
      updateTimerSettings: mockUpdateTimerSettings,
      updateNotificationSettings: jest.fn(),
      updateThemeSettings: jest.fn(),
      updateAccessibilitySettings: jest.fn(),
      resetSettings: jest.fn(),
      saveSettings: jest.fn(),
      hasUnsavedChanges: false,
      exportSettings: jest.fn(),
      importSettings: jest.fn(),
    });
  });

  it("should fetch recommendations and focus patterns on mount", () => {
    render(<AdaptiveSessionRecommendations />);

    expect(mockFetchRecommendations).toHaveBeenCalledTimes(1);
    expect(mockFetchFocusPatterns).toHaveBeenCalledTimes(1);
  });

  it("should display loading state", () => {
    jest.mocked(useAdaptiveSessions).mockReturnValue({
      recommendations: null,
      focusPatterns: null,
      isLoading: true,
      error: null,
      fetchRecommendations: mockFetchRecommendations,
      fetchFocusPatterns: mockFetchFocusPatterns,
      applyRecommendedSettings: jest.fn(),
    });

    render(<AdaptiveSessionRecommendations />);

    expect(
      screen.getByText("Analyzing your productivity patterns...")
    ).toBeInTheDocument();
  });

  it("should display error state", () => {
    jest.mocked(useAdaptiveSessions).mockReturnValue({
      recommendations: null,
      focusPatterns: null,
      isLoading: false,
      error: "Failed to fetch data",
      fetchRecommendations: mockFetchRecommendations,
      fetchFocusPatterns: mockFetchFocusPatterns,
      applyRecommendedSettings: jest.fn(),
    });

    render(<AdaptiveSessionRecommendations />);

    expect(
      screen.getByText("Error Loading Recommendations")
    ).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("should display no data state", () => {
    jest.mocked(useAdaptiveSessions).mockReturnValue({
      recommendations: null,
      focusPatterns: null,
      isLoading: false,
      error: null,
      fetchRecommendations: mockFetchRecommendations,
      fetchFocusPatterns: mockFetchFocusPatterns,
      applyRecommendedSettings: jest.fn(),
    });

    render(<AdaptiveSessionRecommendations />);

    expect(screen.getByText("Not Enough Data")).toBeInTheDocument();
  });

  it("should display recommendations", () => {
    jest.mocked(useAdaptiveSessions).mockReturnValue({
      recommendations: {
        recommendedWorkDuration: 30,
        recommendedShortBreakDuration: 6,
        recommendedLongBreakDuration: 15,
        confidence: 75,
        basedOn: {
          totalSessions: 20,
          completedSessions: 18,
          averageInterruptions: 0.5,
          timeOfDay: "morning",
        },
      },
      focusPatterns: {
        optimalTimeOfDay: "morning",
        optimalDuration: 30,
        averageInterruptions: 0.5,
        completionRate: 90,
        mostProductiveDay: "Monday",
        focusScore: 85,
      },
      isLoading: false,
      error: null,
      fetchRecommendations: mockFetchRecommendations,
      fetchFocusPatterns: mockFetchFocusPatterns,
      applyRecommendedSettings: jest.fn(),
    });

    render(<AdaptiveSessionRecommendations />);

    expect(screen.getByText("AI Session Recommendations")).toBeInTheDocument();
    expect(screen.getByText("30 min")).toBeInTheDocument(); // Work duration
    expect(screen.getByText("6 min")).toBeInTheDocument(); // Short break duration
    expect(screen.getByText("15 min")).toBeInTheDocument(); // Long break duration
    expect(screen.getByText("Medium (75%)")).toBeInTheDocument(); // Confidence
  });

  it("should apply recommended settings when button is clicked", async () => {
    const mockApplyRecommendedSettings = jest.fn();

    jest.mocked(useAdaptiveSessions).mockReturnValue({
      recommendations: {
        recommendedWorkDuration: 30,
        recommendedShortBreakDuration: 6,
        recommendedLongBreakDuration: 15,
        confidence: 75,
        basedOn: {
          totalSessions: 20,
          completedSessions: 18,
          averageInterruptions: 0.5,
          timeOfDay: "morning",
        },
      },
      focusPatterns: {
        optimalTimeOfDay: "morning",
        optimalDuration: 30,
        averageInterruptions: 0.5,
        completionRate: 90,
        mostProductiveDay: "Monday",
        focusScore: 85,
      },
      isLoading: false,
      error: null,
      fetchRecommendations: mockFetchRecommendations,
      fetchFocusPatterns: mockFetchFocusPatterns,
      applyRecommendedSettings: mockApplyRecommendedSettings,
    });

    render(<AdaptiveSessionRecommendations />);

    const applyButton = screen.getByText("Apply Recommended Settings");
    fireEvent.click(applyButton);

    expect(mockUpdateTimerSettings).toHaveBeenCalledWith({
      pomodoroDuration: 30,
      shortBreakDuration: 6,
      longBreakDuration: 15,
    });
  });

  it("should switch between recommendations and insights tabs", () => {
    jest.mocked(useAdaptiveSessions).mockReturnValue({
      recommendations: {
        recommendedWorkDuration: 30,
        recommendedShortBreakDuration: 6,
        recommendedLongBreakDuration: 15,
        confidence: 75,
        basedOn: {
          totalSessions: 20,
          completedSessions: 18,
          averageInterruptions: 0.5,
          timeOfDay: "morning",
        },
      },
      focusPatterns: {
        optimalTimeOfDay: "morning",
        optimalDuration: 30,
        averageInterruptions: 0.5,
        completionRate: 90,
        mostProductiveDay: "Monday",
        focusScore: 85,
      },
      isLoading: false,
      error: null,
      fetchRecommendations: mockFetchRecommendations,
      fetchFocusPatterns: mockFetchFocusPatterns,
      applyRecommendedSettings: jest.fn(),
    });

    render(<AdaptiveSessionRecommendations />);

    // Initially on recommendations tab
    expect(screen.getByText("Recommendation Confidence")).toBeInTheDocument();

    // Switch to insights tab
    const insightsTab = screen.getByText("Focus Insights");
    fireEvent.click(insightsTab);

    // Should show insights content
    expect(screen.getByText("Focus Score")).toBeInTheDocument();
    expect(screen.getByText("85/100")).toBeInTheDocument();
    expect(screen.getByText("Completion Rate")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
  });
});
