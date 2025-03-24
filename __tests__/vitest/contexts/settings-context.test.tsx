import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  SettingsProvider,
  useSettings,
  defaultSettings,
} from "@/lib/contexts/settings-context";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: vi.fn(),
    theme: "light",
  }),
}));

// Test component that uses the settings context
const TestComponent = () => {
  const {
    settings,
    updateTimerSettings,
    updateNotificationSettings,
    updateThemeSettings,
    updateAccessibilitySettings,
    resetSettings,
    saveSettings,
    hasUnsavedChanges,
    exportSettings,
    importSettings,
  } = useSettings();

  return (
    <div>
      <div data-testid="pomodoro-duration">
        {settings.timer.pomodoroDuration}
      </div>
      <div data-testid="sound-enabled">
        {settings.notification.soundEnabled.toString()}
      </div>
      <div data-testid="font-size">{settings.theme.fontSize}</div>
      <div data-testid="high-contrast">
        {settings.accessibility.highContrastMode.toString()}
      </div>
      <div data-testid="has-unsaved-changes">
        {hasUnsavedChanges.toString()}
      </div>

      <button
        data-testid="update-timer"
        onClick={() => updateTimerSettings({ pomodoroDuration: 30 })}
      >
        Update Timer
      </button>

      <button
        data-testid="update-notification"
        onClick={() => updateNotificationSettings({ soundEnabled: false })}
      >
        Update Notification
      </button>

      <button
        data-testid="update-theme"
        onClick={() => updateThemeSettings({ fontSize: "large" })}
      >
        Update Theme
      </button>

      <button
        data-testid="update-accessibility"
        onClick={() => updateAccessibilitySettings({ highContrastMode: true })}
      >
        Update Accessibility
      </button>

      <button data-testid="reset-settings" onClick={resetSettings}>
        Reset Settings
      </button>

      <button data-testid="save-settings" onClick={saveSettings}>
        Save Settings
      </button>

      <button
        data-testid="export-settings"
        onClick={() => {
          const exported = exportSettings();
          document.getElementById("export-result")!.textContent = exported;
        }}
      >
        Export Settings
      </button>

      <button
        data-testid="import-settings"
        onClick={() => {
          const success = importSettings(
            JSON.stringify({
              ...defaultSettings,
              timer: { ...defaultSettings.timer, pomodoroDuration: 40 },
            })
          );
          document.getElementById("import-result")!.textContent =
            success.toString();
        }}
      >
        Import Settings
      </button>

      <div id="export-result"></div>
      <div id="import-result"></div>
    </div>
  );
};

describe("Settings Context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it("provides default settings when no stored settings exist", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("25");
    expect(screen.getByTestId("sound-enabled").textContent).toBe("true");
    expect(screen.getByTestId("font-size").textContent).toBe("medium");
    expect(screen.getByTestId("high-contrast").textContent).toBe("false");
    expect(screen.getByTestId("has-unsaved-changes").textContent).toBe("false");
  });

  it("loads settings from localStorage", () => {
    // Set up localStorage with custom settings
    const customSettings = {
      ...defaultSettings,
      timer: { ...defaultSettings.timer, pomodoroDuration: 35 },
    };
    localStorageMock.setItem(
      "pomodoro-settings",
      JSON.stringify(customSettings)
    );

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("35");
  });

  it("updates timer settings", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Initial value
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("25");

    // Update timer settings
    fireEvent.click(screen.getByTestId("update-timer"));

    // Check if value was updated
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("30");

    // Check if hasUnsavedChanges is true
    expect(screen.getByTestId("has-unsaved-changes").textContent).toBe("true");
  });

  it("updates notification settings", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Initial value
    expect(screen.getByTestId("sound-enabled").textContent).toBe("true");

    // Update notification settings
    fireEvent.click(screen.getByTestId("update-notification"));

    // Check if value was updated
    expect(screen.getByTestId("sound-enabled").textContent).toBe("false");
  });

  it("updates theme settings", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Initial value
    expect(screen.getByTestId("font-size").textContent).toBe("medium");

    // Update theme settings
    fireEvent.click(screen.getByTestId("update-theme"));

    // Check if value was updated
    expect(screen.getByTestId("font-size").textContent).toBe("large");
  });

  it("updates accessibility settings", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Initial value
    expect(screen.getByTestId("high-contrast").textContent).toBe("false");

    // Update accessibility settings
    fireEvent.click(screen.getByTestId("update-accessibility"));

    // Check if value was updated
    expect(screen.getByTestId("high-contrast").textContent).toBe("true");
  });

  it("resets settings to defaults", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Update settings
    fireEvent.click(screen.getByTestId("update-timer"));
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("30");

    // Reset settings
    fireEvent.click(screen.getByTestId("reset-settings"));

    // Check if values were reset
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("25");
  });

  it("saves settings to localStorage", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Update settings
    fireEvent.click(screen.getByTestId("update-timer"));

    // Save settings
    fireEvent.click(screen.getByTestId("save-settings"));

    // Check if localStorage was called with the updated settings
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "pomodoro-settings",
      expect.stringContaining('"pomodoroDuration":30')
    );

    // Check if hasUnsavedChanges is false after saving
    expect(screen.getByTestId("has-unsaved-changes").textContent).toBe("false");
  });

  it("exports settings as JSON", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Export settings
    fireEvent.click(screen.getByTestId("export-settings"));

    // Check if exported JSON contains the correct settings
    const exportResult = document.getElementById("export-result")!.textContent;
    expect(exportResult).toContain('"pomodoroDuration": 25');
  });

  it("imports settings from JSON", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Import settings
    fireEvent.click(screen.getByTestId("import-settings"));

    // Check if import was successful
    expect(document.getElementById("import-result")!.textContent).toBe("true");

    // Check if settings were updated
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("40");
  });
});
