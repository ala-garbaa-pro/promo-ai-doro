import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  SettingsProvider,
  useSettings,
  defaultSettings,
} from "@/lib/contexts/settings-context";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: "light",
  }),
}));

// Test component that uses the settings context
const TestComponent = () => {
  const { settings, updateTimerSettings, resetSettings, saveSettings } =
    useSettings();

  return (
    <div>
      <h1>Settings Test</h1>
      <div data-testid="pomodoro-duration">
        {settings.timer.pomodoroDuration}
      </div>
      <button
        onClick={() => updateTimerSettings({ pomodoroDuration: 30 })}
        data-testid="update-button"
      >
        Update Pomodoro Duration
      </button>
      <button onClick={resetSettings} data-testid="reset-button">
        Reset Settings
      </button>
      <button onClick={saveSettings} data-testid="save-button">
        Save Settings
      </button>
    </div>
  );
};

describe("Settings Context", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it("provides default settings when no stored settings exist", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(screen.getByTestId("pomodoro-duration").textContent).toBe(
      defaultSettings.timer.pomodoroDuration.toString()
    );
  });

  it("updates settings when updateTimerSettings is called", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Initial value should be the default
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe(
      defaultSettings.timer.pomodoroDuration.toString()
    );

    // Update the pomodoro duration
    fireEvent.click(screen.getByTestId("update-button"));

    // Value should be updated
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("30");
  });

  it("resets settings to defaults when resetSettings is called", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Update the pomodoro duration
    fireEvent.click(screen.getByTestId("update-button"));
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("30");

    // Reset settings
    fireEvent.click(screen.getByTestId("reset-button"));

    // Value should be back to default
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe(
      defaultSettings.timer.pomodoroDuration.toString()
    );
  });

  it("saves settings to localStorage when saveSettings is called", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Update the pomodoro duration
    fireEvent.click(screen.getByTestId("update-button"));

    // Save settings
    fireEvent.click(screen.getByTestId("save-button"));

    // localStorage.setItem should have been called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "pomodoro-settings",
      expect.any(String)
    );

    // The saved settings should include the updated pomodoro duration
    const savedSettings = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
    expect(savedSettings.timer.pomodoroDuration).toBe(30);
  });

  it("loads settings from localStorage on mount", () => {
    // Set up localStorage with custom settings
    const customSettings = {
      ...defaultSettings,
      timer: {
        ...defaultSettings.timer,
        pomodoroDuration: 40,
      },
    };

    mockLocalStorage.getItem.mockReturnValueOnce(
      JSON.stringify(customSettings)
    );

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Value should be loaded from localStorage
    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("40");
  });
});
