import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  FocusModeProvider,
  useFocusMode,
  defaultFocusModeSettings,
} from "../../__mocks__/focus-mode-context";

// Create a test component that uses the focus mode context
const TestComponent = () => {
  const { focusMode, settings, toggleFocusMode, updateSettings } =
    useFocusMode();

  return (
    <div>
      <h1>Focus Mode Test</h1>
      <div data-testid="focus-mode-status">{focusMode.toString()}</div>
      <div data-testid="simplified-ui">{settings.simplifiedUI.toString()}</div>
      <div data-testid="hide-notifications">
        {settings.hideNotifications.toString()}
      </div>
      <div data-testid="dim-interface">{settings.dimInterface.toString()}</div>
      <div data-testid="ambient-sounds">
        {settings.playAmbientSounds.toString()}
      </div>

      <button onClick={toggleFocusMode}>Toggle Focus Mode</button>
      <button onClick={() => updateSettings({ simplifiedUI: false })}>
        Disable Simplified UI
      </button>
      <button onClick={() => updateSettings({ hideNotifications: false })}>
        Show Notifications
      </button>
      <button onClick={() => updateSettings({ dimInterface: false })}>
        Disable Dim Interface
      </button>
      <button onClick={() => updateSettings({ playAmbientSounds: false })}>
        Disable Ambient Sounds
      </button>
    </div>
  );
};

describe("Focus Mode Context", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("provides default focus mode settings", () => {
    render(
      <FocusModeProvider>
        <TestComponent />
      </FocusModeProvider>
    );

    // Check if default settings are provided
    expect(screen.getByTestId("focus-mode-status").textContent).toBe("false");
    expect(screen.getByTestId("simplified-ui").textContent).toBe(
      defaultFocusModeSettings.simplifiedUI.toString()
    );
    expect(screen.getByTestId("hide-notifications").textContent).toBe(
      defaultFocusModeSettings.hideNotifications.toString()
    );
    expect(screen.getByTestId("dim-interface").textContent).toBe(
      defaultFocusModeSettings.dimInterface.toString()
    );
    expect(screen.getByTestId("ambient-sounds").textContent).toBe(
      defaultFocusModeSettings.playAmbientSounds.toString()
    );
  });

  it("toggles focus mode correctly", () => {
    render(
      <FocusModeProvider>
        <TestComponent />
      </FocusModeProvider>
    );

    // Initial state
    expect(screen.getByTestId("focus-mode-status").textContent).toBe("false");

    // Toggle focus mode
    fireEvent.click(screen.getByText("Toggle Focus Mode"));

    // Check if focus mode was toggled
    expect(screen.getByTestId("focus-mode-status").textContent).toBe("true");

    // Toggle focus mode again
    fireEvent.click(screen.getByText("Toggle Focus Mode"));

    // Check if focus mode was toggled back
    expect(screen.getByTestId("focus-mode-status").textContent).toBe("false");
  });

  it("updates settings correctly", () => {
    render(
      <FocusModeProvider>
        <TestComponent />
      </FocusModeProvider>
    );

    // Initial values
    expect(screen.getByTestId("simplified-ui").textContent).toBe("true");
    expect(screen.getByTestId("hide-notifications").textContent).toBe("true");
    expect(screen.getByTestId("dim-interface").textContent).toBe("true");
    expect(screen.getByTestId("ambient-sounds").textContent).toBe("true");

    // Update simplified UI setting
    fireEvent.click(screen.getByText("Disable Simplified UI"));

    // Check if setting was updated
    expect(screen.getByTestId("simplified-ui").textContent).toBe("false");

    // Update hide notifications setting
    fireEvent.click(screen.getByText("Show Notifications"));

    // Check if setting was updated
    expect(screen.getByTestId("hide-notifications").textContent).toBe("false");

    // Update dim interface setting
    fireEvent.click(screen.getByText("Disable Dim Interface"));

    // Check if setting was updated
    expect(screen.getByTestId("dim-interface").textContent).toBe("false");

    // Update ambient sounds setting
    fireEvent.click(screen.getByText("Disable Ambient Sounds"));

    // Check if setting was updated
    expect(screen.getByTestId("ambient-sounds").textContent).toBe("false");
  });

  it("saves settings to localStorage", () => {
    // Spy on localStorage.setItem
    jest.spyOn(Storage.prototype, "setItem");

    render(
      <FocusModeProvider>
        <TestComponent />
      </FocusModeProvider>
    );

    // Update a setting
    fireEvent.click(screen.getByText("Disable Simplified UI"));

    // Verify localStorage.setItem was called with the correct arguments
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "focusModeSettings",
      expect.stringContaining('"simplifiedUI":false')
    );
  });

  it("loads settings from localStorage on initialization", () => {
    // Set up localStorage with saved settings
    localStorage.setItem(
      "focusModeSettings",
      JSON.stringify({
        simplifiedUI: false,
        hideNotifications: false,
        dimInterface: false,
        playAmbientSounds: false,
      })
    );

    render(
      <FocusModeProvider>
        <TestComponent />
      </FocusModeProvider>
    );

    // Verify settings were loaded from localStorage
    expect(screen.getByTestId("simplified-ui").textContent).toBe("false");
    expect(screen.getByTestId("hide-notifications").textContent).toBe("false");
    expect(screen.getByTestId("dim-interface").textContent).toBe("false");
    expect(screen.getByTestId("ambient-sounds").textContent).toBe("false");
  });

  it("handles keyboard shortcuts for focus mode", () => {
    render(
      <FocusModeProvider>
        <TestComponent />
      </FocusModeProvider>
    );

    // Initial state
    expect(screen.getByTestId("focus-mode-status").textContent).toBe("false");

    // Simulate keyboard shortcut (Alt+F)
    fireEvent.keyDown(document, { key: "f", altKey: true });

    // Check if focus mode was toggled
    expect(screen.getByTestId("focus-mode-status").textContent).toBe("true");
  });
});
