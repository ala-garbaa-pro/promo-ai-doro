/**
 * @jest-environment jsdom
 */

import React, { useContext } from "react";
import { render, screen, act } from "@testing-library/react";

// Create a simple settings context for testing
const defaultSettings = {
  timer: {
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  },
  theme: {
    darkMode: false,
  },
};

const SettingsContext = React.createContext({
  settings: defaultSettings,
  updateTimerSettings: (settings) => {},
  updateThemeSettings: (settings) => {},
});

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = React.useState(defaultSettings);

  const updateTimerSettings = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        ...newSettings,
      },
    }));
  };

  const updateThemeSettings = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...newSettings,
      },
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateTimerSettings,
        updateThemeSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Test component that uses the settings context
const SettingsDisplay = () => {
  const { settings, updateTimerSettings, updateThemeSettings } =
    useContext(SettingsContext);

  return (
    <div>
      <div data-testid="pomodoro-duration">
        {settings.timer.pomodoroDuration}
      </div>
      <div data-testid="dark-mode">
        {settings.theme.darkMode ? "Dark" : "Light"}
      </div>
      <button
        data-testid="update-timer"
        onClick={() => updateTimerSettings({ pomodoroDuration: 30 })}
      >
        Update Timer
      </button>
      <button
        data-testid="toggle-theme"
        onClick={() =>
          updateThemeSettings({ darkMode: !settings.theme.darkMode })
        }
      >
        Toggle Theme
      </button>
    </div>
  );
};

describe("Settings Context", () => {
  it("provides default settings", () => {
    render(
      <SettingsProvider>
        <SettingsDisplay />
      </SettingsProvider>
    );

    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("25");
    expect(screen.getByTestId("dark-mode").textContent).toBe("Light");
  });

  it("updates timer settings", () => {
    render(
      <SettingsProvider>
        <SettingsDisplay />
      </SettingsProvider>
    );

    act(() => {
      screen.getByTestId("update-timer").click();
    });

    expect(screen.getByTestId("pomodoro-duration").textContent).toBe("30");
  });

  it("updates theme settings", () => {
    render(
      <SettingsProvider>
        <SettingsDisplay />
      </SettingsProvider>
    );

    act(() => {
      screen.getByTestId("toggle-theme").click();
    });

    expect(screen.getByTestId("dark-mode").textContent).toBe("Dark");
  });
});
