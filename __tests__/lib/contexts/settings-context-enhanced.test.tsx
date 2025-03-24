import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SettingsProvider,
  useSettings,
  defaultSettings,
  AppSettings,
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
      <div data-testid="long-break-duration">
        {settings.timer.longBreakDuration}
      </div>
      <div data-testid="auto-start-breaks">
        {settings.timer.autoStartBreaks.toString()}
      </div>
      <div data-testid="auto-start-pomodoros">
        {settings.timer.autoStartPomodoros.toString()}
      </div>
      <div data-testid="sound-enabled">
        {settings.notification.soundEnabled.toString()}
      </div>
      <div data-testid="volume">{settings.notification.volume}</div>
      <div data-testid="accent-color">{settings.theme.accentColor}</div>
      <div data-testid="high-contrast-mode">
        {settings.accessibility.highContrastMode.toString()}
      </div>

      <button
        onClick={() => {
          updateTimerSettings({
            pomodoroDuration: 30,
          });
          saveSettings();
        }}
      >
        Update Pomodoro Duration
      </button>

      <button
        onClick={() => {
          updateNotificationSettings({
            soundEnabled: !settings.notification.soundEnabled,
          });
          saveSettings();
        }}
      >
        Toggle Sound
      </button>

      <button
        onClick={() => {
          updateThemeSettings({
            accentColor: "indigo",
          });
          saveSettings();
        }}
      >
        Change Accent Color
      </button>

      <button
        onClick={() => {
          updateAccessibilitySettings({
            highContrastMode: !settings.accessibility.highContrastMode,
          });
          saveSettings();
        }}
      >
        Toggle High Contrast Mode
      </button>

      <button
        onClick={() => {
          resetSettings();
          saveSettings();
        }}
      >
        Reset Settings
      </button>
    </div>
  );
};

describe("Settings Context - Enhanced Tests", () => {
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
    expect(screen.getByTestId("long-break-duration").textContent).toBe(
      defaultSettings.timer.longBreakDuration.toString()
    );
    expect(screen.getByTestId("auto-start-breaks").textContent).toBe(
      defaultSettings.timer.autoStartBreaks.toString()
    );
    expect(screen.getByTestId("auto-start-pomodoros").textContent).toBe(
      defaultSettings.timer.autoStartPomodoros.toString()
    );
    expect(screen.getByTestId("sound-enabled").textContent).toBe(
      defaultSettings.notification.soundEnabled.toString()
    );
    expect(screen.getByTestId("volume").textContent).toBe(
      defaultSettings.notification.volume.toString()
    );
    expect(screen.getByTestId("accent-color").textContent).toBe(
      defaultSettings.theme.accentColor
    );
    expect(screen.getByTestId("high-contrast-mode").textContent).toBe(
      defaultSettings.accessibility.highContrastMode.toString()
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
          tickSound: true,
        },
        notification: {
          soundEnabled: true,
          volume: 80,
        },
        theme: {
          accentColor: "indigo",
        },
        accessibility: {
          highContrastMode: false,
        },
      })
    );

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("35");
    expect(screen.getByTestId("short-break-duration").textContent).toBe("7");
    expect(screen.getByTestId("long-break-duration").textContent).toBe("20");
    expect(screen.getByTestId("auto-start-breaks").textContent).toBe("true");
    expect(screen.getByTestId("auto-start-pomodoros").textContent).toBe("true");
    expect(screen.getByTestId("accent-color").textContent).toBe("indigo");
  });

  it("updates settings correctly", async () => {
    const user = userEvent.setup();

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

    // Update pomodoro duration
    await act(async () => {
      await user.click(screen.getByText("Update Pomodoro Duration"));
    });

    // Check if value was updated
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("30");

    // Check if localStorage.setItem was called
    expect(localStorage.setItem).toHaveBeenCalled();

    // Check if the last call to localStorage.setItem included the updated value
    const lastCallArgs =
      localStorage.setItem.mock.calls[
        localStorage.setItem.mock.calls.length - 1
      ];
    expect(lastCallArgs[0]).toBe("pomodoro-settings");
    expect(lastCallArgs[1]).toContain('"pomodoroDuration":30');
  });

  it("toggles notification settings correctly", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </ThemeProvider>
    );

    // Initial value
    const initialSoundEnabled = defaultSettings.notification.soundEnabled;
    expect(screen.getByTestId("sound-enabled").textContent).toBe(
      initialSoundEnabled.toString()
    );

    // Toggle sound
    await act(async () => {
      await user.click(screen.getByText("Toggle Sound"));
    });

    // Check if value was toggled
    expect(screen.getByTestId("sound-enabled").textContent).toBe(
      (!initialSoundEnabled).toString()
    );

    // Check if localStorage.setItem was called
    expect(localStorage.setItem).toHaveBeenCalled();

    // Check if the last call to localStorage.setItem included the updated value
    const lastCallArgs =
      localStorage.setItem.mock.calls[
        localStorage.setItem.mock.calls.length - 1
      ];
    expect(lastCallArgs[0]).toBe("pomodoro-settings");
    expect(lastCallArgs[1]).toContain(`"soundEnabled":${!initialSoundEnabled}`);
  });

  it("changes theme settings correctly", async () => {
    const user = userEvent.setup();

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

    // Change accent color
    await act(async () => {
      await user.click(screen.getByText("Change Accent Color"));
    });

    // Check if value was updated
    expect(screen.getByTestId("accent-color").textContent).toBe("indigo");

    // Check if localStorage.setItem was called
    expect(localStorage.setItem).toHaveBeenCalled();

    // Check if the last call to localStorage.setItem included the updated value
    const lastCallArgs =
      localStorage.setItem.mock.calls[
        localStorage.setItem.mock.calls.length - 1
      ];
    expect(lastCallArgs[0]).toBe("pomodoro-settings");
    expect(lastCallArgs[1]).toContain('"accentColor":"indigo"');
  });

  it("toggles accessibility settings correctly", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </ThemeProvider>
    );

    // Initial value
    const initialHighContrastMode =
      defaultSettings.accessibility.highContrastMode;
    expect(screen.getByTestId("high-contrast-mode").textContent).toBe(
      initialHighContrastMode.toString()
    );

    // Toggle high contrast mode
    await act(async () => {
      await user.click(screen.getByText("Toggle High Contrast Mode"));
    });

    // Check if value was toggled
    expect(screen.getByTestId("high-contrast-mode").textContent).toBe(
      (!initialHighContrastMode).toString()
    );

    // Check if localStorage.setItem was called
    expect(localStorage.setItem).toHaveBeenCalled();

    // Check if the last call to localStorage.setItem included the updated value
    const lastCallArgs =
      localStorage.setItem.mock.calls[
        localStorage.setItem.mock.calls.length - 1
      ];
    expect(lastCallArgs[0]).toBe("pomodoro-settings");
    expect(lastCallArgs[1]).toContain(
      `"highContrastMode":${!initialHighContrastMode}`
    );
  });

  it("resets settings to defaults", async () => {
    const user = userEvent.setup();

    // Set up localStorage with custom settings
    localStorage.setItem(
      "pomodoro-settings",
      JSON.stringify({
        timer: {
          pomodoroDuration: 35,
          shortBreakDuration: 7,
          longBreakDuration: 20,
          autoStartBreaks: true,
          autoStartPomodoros: true,
        },
        notification: {
          soundEnabled: false,
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

    // Check if custom settings are loaded
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("35");
    expect(screen.getByTestId("sound-enabled").textContent).toBe("false");

    // Reset settings
    await act(async () => {
      await user.click(screen.getByText("Reset Settings"));
    });

    // Check if settings were reset to defaults
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe(
      defaultSettings.timer.pomodoroDuration.toString()
    );
    expect(screen.getByTestId("sound-enabled").textContent).toBe(
      defaultSettings.notification.soundEnabled.toString()
    );

    // Check if localStorage.setItem was called
    expect(localStorage.setItem).toHaveBeenCalled();

    // Check if the last call to localStorage.setItem included the default settings
    const lastCallArgs =
      localStorage.setItem.mock.calls[
        localStorage.setItem.mock.calls.length - 1
      ];
    expect(lastCallArgs[0]).toBe("pomodoro-settings");
    expect(lastCallArgs[1]).toContain(
      `"pomodoroDuration":${defaultSettings.timer.pomodoroDuration}`
    );
  });

  it("handles partial settings in localStorage", () => {
    // Set up localStorage with partial settings
    const partialSettings = {
      timer: {
        pomodoroDuration: 40,
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
          preferBinauralBeats: false,
          showDescriptions: true,
          defaultCategory: "nature",
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
    };

    localStorage.setItem("pomodoro-settings", JSON.stringify(partialSettings));

    render(
      <ThemeProvider>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </ThemeProvider>
    );

    // Check if the specified setting was loaded
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("40");

    // Check if other settings use defaults
    expect(screen.getByTestId("short-break-duration").textContent).toBe(
      defaultSettings.timer.shortBreakDuration.toString()
    );
    expect(screen.getByTestId("sound-enabled").textContent).toBe(
      defaultSettings.notification.soundEnabled.toString()
    );
  });

  it("handles invalid JSON in localStorage", () => {
    // Set up localStorage with invalid JSON
    localStorage.setItem("pomodoro-settings", "invalid-json");

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Check if default settings are used
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe(
      defaultSettings.timer.pomodoroDuration.toString()
    );
  });
});
