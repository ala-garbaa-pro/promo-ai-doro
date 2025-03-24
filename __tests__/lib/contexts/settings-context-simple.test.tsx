import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  SettingsProvider,
  useSettings,
  defaultSettings,
} from "@/lib/contexts/settings-context";
import { ThemeProvider } from "next-themes";

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

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Test component to access settings context
const TestComponent = () => {
  const {
    settings,
    updateTimerSettings,
    updateNotificationSettings,
    updateThemeSettings,
    updateAccessibilitySettings,
    resetSettings,
    saveSettings,
  } = useSettings();

  return (
    <div>
      <div data-testid="pomodoro-duration">
        {settings.timer.pomodoroDuration}
      </div>
      <div data-testid="short-break-duration">
        {settings.timer.shortBreakDuration}
      </div>
      <div data-testid="sound-enabled">
        {settings.notification.soundEnabled.toString()}
      </div>
      <div data-testid="accent-color">{settings.theme.accentColor}</div>

      <button
        onClick={() => {
          updateTimerSettings({
            pomodoroDuration: 30,
          });
          saveSettings();
        }}
        data-testid="update-timer-btn"
      >
        Update Timer
      </button>

      <button
        onClick={() => {
          updateNotificationSettings({
            soundEnabled: false,
          });
          saveSettings();
        }}
        data-testid="update-notification-btn"
      >
        Update Notification
      </button>

      <button
        onClick={() => {
          updateThemeSettings({
            accentColor: "blue",
          });
          saveSettings();
        }}
        data-testid="update-theme-btn"
      >
        Update Theme
      </button>

      <button
        onClick={() => {
          resetSettings();
          saveSettings();
        }}
        data-testid="reset-btn"
      >
        Reset Settings
      </button>
    </div>
  );
};

describe("Settings Context - Simple Tests", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it("provides default settings when no stored settings exist", () => {
    render(
      <ThemeProvider>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </ThemeProvider>
    );

    expect(screen.getByTestId("pomodoro-duration").textContent).toBe(
      defaultSettings.timer.pomodoroDuration.toString()
    );
    expect(screen.getByTestId("short-break-duration").textContent).toBe(
      defaultSettings.timer.shortBreakDuration.toString()
    );
    expect(screen.getByTestId("sound-enabled").textContent).toBe(
      defaultSettings.notification.soundEnabled.toString()
    );
    expect(screen.getByTestId("accent-color").textContent).toBe(
      defaultSettings.theme.accentColor
    );
  });

  it("updates timer settings correctly", () => {
    render(
      <ThemeProvider>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </ThemeProvider>
    );

    // Initial value
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe(
      defaultSettings.timer.pomodoroDuration.toString()
    );

    // Update timer settings
    fireEvent.click(screen.getByTestId("update-timer-btn"));

    // Check if value was updated
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("30");
  });

  it("updates notification settings correctly", () => {
    render(
      <ThemeProvider>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </ThemeProvider>
    );

    // Initial value
    expect(screen.getByTestId("sound-enabled").textContent).toBe(
      defaultSettings.notification.soundEnabled.toString()
    );

    // Update notification settings
    fireEvent.click(screen.getByTestId("update-notification-btn"));

    // Check if value was updated
    expect(screen.getByTestId("sound-enabled").textContent).toBe("false");
  });

  it("updates theme settings correctly", () => {
    render(
      <ThemeProvider>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </ThemeProvider>
    );

    // Initial value
    expect(screen.getByTestId("accent-color").textContent).toBe(
      defaultSettings.theme.accentColor
    );

    // Update theme settings
    fireEvent.click(screen.getByTestId("update-theme-btn"));

    // Check if value was updated
    expect(screen.getByTestId("accent-color").textContent).toBe("blue");
  });

  it("resets settings to defaults", () => {
    render(
      <ThemeProvider>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </ThemeProvider>
    );

    // Update timer settings
    fireEvent.click(screen.getByTestId("update-timer-btn"));
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("30");

    // Reset settings
    fireEvent.click(screen.getByTestId("reset-btn"));

    // Check if settings were reset to defaults
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe(
      defaultSettings.timer.pomodoroDuration.toString()
    );
  });

  it("loads settings from localStorage on initialization", () => {
    // Set up localStorage with saved settings
    localStorage.setItem(
      "pomodoro-settings",
      JSON.stringify({
        timer: {
          pomodoroDuration: 35,
          shortBreakDuration: 7,
          longBreakDuration: 20,
          autoStartBreaks: true,
          autoStartPomodoros: true,
          longBreakInterval: 4,
          countDirection: "down",
          timerLabels: {
            pomodoro: "Focus",
            shortBreak: "Short Break",
            longBreak: "Long Break",
          },
          autoIncrementFocus: false,
          incrementAmount: 5,
          dailyGoal: 8,
          earlyBirdMode: false,
          nightOwlMode: false,
          adaptiveScheduling: true,
          cognitiveLoadOptimization: true,
          contextSwitchingMinimization: true,
        },
        notification: {
          soundEnabled: false,
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
            preferBinauralBeats: false,
            showDescriptions: true,
            defaultCategory: "nature",
          },
        },
        theme: {
          fontSize: "medium",
          accentColor: "purple",
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
      })
    );

    render(
      <ThemeProvider>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </ThemeProvider>
    );

    // Check if settings were loaded from localStorage
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("35");
    expect(screen.getByTestId("short-break-duration").textContent).toBe("7");
    expect(screen.getByTestId("sound-enabled").textContent).toBe("false");
    expect(screen.getByTestId("accent-color").textContent).toBe("purple");
  });
});
