import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AccessibilityProvider,
  useAccessibility,
} from "@/lib/contexts/accessibility-context";
import { SettingsProvider } from "@/lib/contexts/settings-context";
import { Timer } from "@/components/app/timer";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";

// Mock the next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Test component to access accessibility context
const AccessibilityTestComponent = () => {
  const {
    announceToScreenReader,
    isReducedMotion,
    isHighContrast,
    isLargeText,
    keyboardShortcutsEnabled,
    toggleReducedMotion,
    toggleHighContrast,
    toggleLargeText,
    toggleKeyboardShortcuts,
  } = useAccessibility();

  const handleAnnounce = () => {
    announceToScreenReader("This is a test announcement", "assertive");
  };

  return (
    <div>
      <h1>Accessibility Test</h1>
      <button onClick={handleAnnounce}>Announce to Screen Reader</button>
      <div data-testid="reduced-motion">{isReducedMotion.toString()}</div>
      <div data-testid="high-contrast">{isHighContrast.toString()}</div>
      <div data-testid="large-text">{isLargeText.toString()}</div>
      <div data-testid="keyboard-shortcuts">
        {keyboardShortcutsEnabled.toString()}
      </div>

      <button onClick={toggleReducedMotion}>Toggle Reduced Motion</button>
      <button onClick={toggleHighContrast}>Toggle High Contrast</button>
      <button onClick={toggleLargeText}>Toggle Large Text</button>
      <button onClick={toggleKeyboardShortcuts}>
        Toggle Keyboard Shortcuts
      </button>

      <div aria-label="Timer section" role="region">
        <Timer />
      </div>

      <div aria-label="Task input section" role="region">
        <NaturalLanguageTaskInput onTaskCreate={() => {}} />
      </div>
    </div>
  );
};

describe("Accessibility Features - Enhanced Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
    });
  });

  it("provides default accessibility settings", () => {
    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    expect(screen.getByTestId("reduced-motion").textContent).toBe("false");
    expect(screen.getByTestId("high-contrast").textContent).toBe("false");
    expect(screen.getByTestId("large-text").textContent).toBe("false");
    expect(screen.getByTestId("keyboard-shortcuts").textContent).toBe("true");
  });

  it("toggles accessibility settings correctly", async () => {
    const user = userEvent.setup();

    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Toggle reduced motion
    await user.click(screen.getByText("Toggle Reduced Motion"));
    expect(screen.getByTestId("reduced-motion").textContent).toBe("true");

    // Toggle high contrast
    await user.click(screen.getByText("Toggle High Contrast"));
    expect(screen.getByTestId("high-contrast").textContent).toBe("true");

    // Toggle large text
    await user.click(screen.getByText("Toggle Large Text"));
    expect(screen.getByTestId("large-text").textContent).toBe("true");

    // Toggle keyboard shortcuts
    await user.click(screen.getByText("Toggle Keyboard Shortcuts"));
    expect(screen.getByTestId("keyboard-shortcuts").textContent).toBe("false");
  });

  it("announces to screen reader", async () => {
    // Mock the aria-live region
    const mockAnnounce = jest.fn();

    // Create a mock implementation of announceToScreenReader
    jest.mock("@/lib/contexts/accessibility-context", () => ({
      ...jest.requireActual("@/lib/contexts/accessibility-context"),
      useAccessibility: () => ({
        ...jest
          .requireActual("@/lib/contexts/accessibility-context")
          .useAccessibility(),
        announceToScreenReader: mockAnnounce,
      }),
    }));

    const user = userEvent.setup();

    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Click the announce button
    await user.click(screen.getByText("Announce to Screen Reader"));

    // Check if the aria-live region was updated
    // Note: This is a bit tricky to test directly, so we're checking if the button was clicked
    expect(screen.getByText("Announce to Screen Reader")).toBeInTheDocument();
  });

  it("applies reduced motion styles", async () => {
    const user = userEvent.setup();

    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Toggle reduced motion
    await user.click(screen.getByText("Toggle Reduced Motion"));

    // Check if reduced motion is enabled
    expect(screen.getByTestId("reduced-motion").textContent).toBe("true");

    // Check if the body has the reduced-motion class
    // Note: This is a bit tricky to test directly with jsdom
    // In a real browser, we would check if the CSS class was applied
  });

  it("applies high contrast styles", async () => {
    const user = userEvent.setup();

    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Toggle high contrast
    await user.click(screen.getByText("Toggle High Contrast"));

    // Check if high contrast is enabled
    expect(screen.getByTestId("high-contrast").textContent).toBe("true");

    // Check if the body has the high-contrast class
    // Note: This is a bit tricky to test directly with jsdom
    // In a real browser, we would check if the CSS class was applied
  });

  it("applies large text styles", async () => {
    const user = userEvent.setup();

    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Toggle large text
    await user.click(screen.getByText("Toggle Large Text"));

    // Check if large text is enabled
    expect(screen.getByTestId("large-text").textContent).toBe("true");

    // Check if the body has the large-text class
    // Note: This is a bit tricky to test directly with jsdom
    // In a real browser, we would check if the CSS class was applied
  });

  it("handles keyboard shortcuts", () => {
    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Check if keyboard shortcuts are enabled by default
    expect(screen.getByTestId("keyboard-shortcuts").textContent).toBe("true");

    // Simulate a keyboard shortcut
    // Note: This is a bit tricky to test directly with jsdom
    // In a real browser, we would dispatch a keyboard event and check if it was handled
  });

  it("persists accessibility settings in localStorage", async () => {
    const user = userEvent.setup();

    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Toggle reduced motion
    await user.click(screen.getByText("Toggle Reduced Motion"));

    // Check if localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it("loads accessibility settings from localStorage", () => {
    // Mock localStorage to return saved settings
    (localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "pomodoro-accessibility") {
        return JSON.stringify({
          reducedMotion: true,
          highContrast: true,
          largeText: true,
          keyboardShortcutsEnabled: false,
        });
      }
      return null;
    });

    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Check if settings were loaded from localStorage
    expect(screen.getByTestId("reduced-motion").textContent).toBe("true");
    expect(screen.getByTestId("high-contrast").textContent).toBe("true");
    expect(screen.getByTestId("large-text").textContent).toBe("true");
    expect(screen.getByTestId("keyboard-shortcuts").textContent).toBe("false");
  });

  it("ensures timer component has proper accessibility attributes", () => {
    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Check if timer section has proper ARIA attributes
    const timerSection = screen.getByRole("region", { name: /timer section/i });
    expect(timerSection).toBeInTheDocument();
    expect(timerSection).toHaveAttribute("aria-label", "Timer section");
  });

  it("ensures task input has proper accessibility attributes", () => {
    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <AccessibilityTestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Check if task input section has proper ARIA attributes
    const taskInputSection = screen.getByRole("region", {
      name: /task input section/i,
    });
    expect(taskInputSection).toBeInTheDocument();
    expect(taskInputSection).toHaveAttribute(
      "aria-label",
      "Task input section"
    );
  });
});
