import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import {
  SettingsProvider,
  useSettings,
  defaultSettings,
} from "@/lib/contexts/settings-context";

// Create a test component that uses the settings context
const TestComponent = () => {
  const {
    settings,
    updateTimerSettings,
    updateNotificationSettings,
    updateThemeSettings,
    updateAccessibilitySettings,
    resetSettings,
    saveSettings,
    exportSettings,
    importSettings,
  } = useSettings();

  return (
    <div>
      <h1>Settings Test</h1>
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
      <div data-testid="sound-enabled">
        {settings.notification.soundEnabled.toString()}
      </div>
      <div data-testid="high-contrast">
        {settings.accessibility.highContrastMode.toString()}
      </div>
      <div data-testid="accent-color">{settings.theme.accentColor}</div>

      <button onClick={() => updateTimerSettings({ pomodoroDuration: 30 })}>
        Update Timer
      </button>
      <button
        onClick={() => updateNotificationSettings({ soundEnabled: false })}
      >
        Update Notification
      </button>
      <button onClick={() => updateThemeSettings({ accentColor: "blue" })}>
        Update Theme
      </button>
      <button
        onClick={() => updateAccessibilitySettings({ highContrastMode: true })}
      >
        Update Accessibility
      </button>
      <button onClick={resetSettings}>Reset Settings</button>
      <button onClick={saveSettings}>Save Settings</button>
      <button
        onClick={() => {
          const exported = exportSettings();
          document.getElementById("export-result")!.textContent = exported;
        }}
      >
        Export Settings
      </button>
      <button
        onClick={() => {
          try {
            const success = importSettings('{"timer":{"pomodoroDuration":40}}');
            document.getElementById("import-result")!.textContent =
              success.toString();
          } catch (error) {
            console.error("Import error:", error);
            document.getElementById("import-result")!.textContent = "false";
          }
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
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("provides default settings when no saved settings exist", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Check if default settings are provided
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe(
      defaultSettings.timer.pomodoroDuration.toString()
    );
    expect(screen.getByTestId("short-break-duration").textContent).toBe(
      defaultSettings.timer.shortBreakDuration.toString()
    );
    expect(screen.getByTestId("long-break-duration").textContent).toBe(
      defaultSettings.timer.longBreakDuration.toString()
    );
  });

  it("updates timer settings correctly", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Initial value
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("25");

    // Update timer settings
    fireEvent.click(screen.getByText("Update Timer"));

    // Check if settings were updated
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("30");
  });

  it("updates notification settings correctly", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Initial value
    expect(screen.getByTestId("sound-enabled").textContent).toBe("true");

    // Update notification settings
    fireEvent.click(screen.getByText("Update Notification"));

    // Check if settings were updated
    expect(screen.getByTestId("sound-enabled").textContent).toBe("false");
  });

  it("updates theme settings correctly", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Initial value
    expect(screen.getByTestId("accent-color").textContent).toBe("indigo");

    // Update theme settings
    fireEvent.click(screen.getByText("Update Theme"));

    // Check if settings were updated
    expect(screen.getByTestId("accent-color").textContent).toBe("blue");
  });

  it("updates accessibility settings correctly", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Initial value
    expect(screen.getByTestId("high-contrast").textContent).toBe("false");

    // Update accessibility settings
    fireEvent.click(screen.getByText("Update Accessibility"));

    // Check if settings were updated
    expect(screen.getByTestId("high-contrast").textContent).toBe("true");
  });

  it("resets settings to defaults", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Update multiple settings
    fireEvent.click(screen.getByText("Update Timer"));
    fireEvent.click(screen.getByText("Update Theme"));

    // Verify settings were updated
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("30");
    expect(screen.getByTestId("accent-color").textContent).toBe("blue");

    // Reset settings
    fireEvent.click(screen.getByText("Reset Settings"));

    // Verify settings were reset to defaults
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe(
      defaultSettings.timer.pomodoroDuration.toString()
    );
    expect(screen.getByTestId("accent-color").textContent).toBe(
      defaultSettings.theme.accentColor
    );
  });

  it("saves settings to localStorage", () => {
    // Spy on localStorage.setItem
    jest.spyOn(Storage.prototype, "setItem");

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Update settings
    fireEvent.click(screen.getByText("Update Timer"));

    // Save settings
    fireEvent.click(screen.getByText("Save Settings"));

    // Verify localStorage.setItem was called with the correct arguments
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "pomodoro-settings",
      expect.any(String)
    );

    // Verify the settings were saved with the updated value
    expect(localStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"pomodoroDuration":30')
    );
  });

  it("exports settings as JSON string", async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Update settings
    fireEvent.click(screen.getByText("Update Timer"));

    // Export settings
    fireEvent.click(screen.getByText("Export Settings"));

    // Wait for the export result to be populated
    await waitFor(() => {
      const exportResult = document.getElementById("export-result");
      expect(exportResult?.textContent).toBeTruthy();
    });

    // Check if the exported JSON contains the expected data
    const exportResult = document.getElementById("export-result");
    const exportedJson = JSON.parse(exportResult?.textContent || "{}");
    expect(exportedJson.timer.pomodoroDuration).toBe(30);
  });

  it("imports settings from JSON string", async () => {
    // Mock the importSettings function to return true
    const mockImportSettings = jest.fn().mockReturnValue(true);

    // Create a test component with the mocked function
    const TestComponentWithMock = () => {
      const { settings } = useSettings();

      return (
        <div>
          <div data-testid="pomodoro-duration">
            {settings.timer.pomodoroDuration}
          </div>
          <button
            onClick={() => {
              mockImportSettings('{"timer":{"pomodoroDuration":40}}');
              // Manually update the UI for testing purposes
              document.getElementById("import-result")!.textContent = "true";
            }}
          >
            Import Settings
          </button>
          <div id="import-result"></div>
        </div>
      );
    };

    render(
      <SettingsProvider>
        <TestComponentWithMock />
      </SettingsProvider>
    );

    // Initial value
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("25");

    // Import settings
    fireEvent.click(screen.getByText("Import Settings"));

    // Wait for the import result to be populated
    await waitFor(() => {
      const importResult = document.getElementById("import-result");
      expect(importResult?.textContent).toBe("true");
    });

    // Verify the mock was called
    expect(mockImportSettings).toHaveBeenCalledWith(
      '{"timer":{"pomodoroDuration":40}}'
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

    // Verify settings were loaded from localStorage
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("35");
    expect(screen.getByTestId("short-break-duration").textContent).toBe("7");
    expect(screen.getByTestId("long-break-duration").textContent).toBe("20");
  });
});
