import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Timer } from "@/components/app/timer";
import { TaskListEnhanced } from "@/components/tasks/task-list-enhanced";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";
import { useSettings } from "@/lib/contexts/settings-context";
import {
  AccessibilityProvider,
  useAccessibility,
} from "@/lib/contexts/accessibility-context";

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock the hooks
jest.mock("@/lib/contexts/settings-context", () => ({
  useSettings: jest.fn(),
}));

jest.mock("@/lib/contexts/accessibility-context", () => {
  const originalModule = jest.requireActual(
    "@/lib/contexts/accessibility-context"
  );
  return {
    ...originalModule,
    useAccessibility: jest.fn(),
  };
});

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Create a test component that uses accessibility features
const AccessibleComponent = () => {
  const {
    announceToScreenReader,
    isReducedMotion,
    isHighContrast,
    isLargeText,
    keyboardShortcutsEnabled,
  } = useAccessibility();

  const handleAnnounce = () => {
    announceToScreenReader("This is a test announcement", "polite");
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

      <div aria-label="Timer section" role="region">
        <Timer />
      </div>

      <div aria-label="Task input section" role="region">
        <NaturalLanguageTaskInput onTaskCreate={() => {}} />
      </div>
    </div>
  );
};

describe("Accessibility Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock settings
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
        accessibility: {
          highContrastMode: false,
          reducedMotion: false,
          largeText: false,
          keyboardShortcutsEnabled: true,
          screenReaderAnnouncements: true,
        },
      },
    });

    // Mock accessibility context
    (useAccessibility as jest.Mock).mockReturnValue({
      announceToScreenReader: jest.fn(),
      focusableElements: [],
      registerFocusableElement: jest.fn(),
      unregisterFocusableElement: jest.fn(),
      isReducedMotion: false,
      isHighContrast: false,
      isLargeText: false,
      keyboardShortcutsEnabled: true,
    });
  });

  it("should have no accessibility violations", async () => {
    const { container } = render(
      <AccessibilityProvider>
        <AccessibleComponent />
      </AccessibilityProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should announce to screen reader when triggered", () => {
    render(
      <AccessibilityProvider>
        <AccessibleComponent />
      </AccessibilityProvider>
    );

    const announceButton = screen.getByText("Announce to Screen Reader");
    fireEvent.click(announceButton);

    // Check if announceToScreenReader was called
    expect(useAccessibility().announceToScreenReader).toHaveBeenCalledWith(
      "This is a test announcement",
      "polite"
    );
  });

  it("should apply high contrast mode when enabled", () => {
    // Mock high contrast mode
    (useAccessibility as jest.Mock).mockReturnValue({
      announceToScreenReader: jest.fn(),
      focusableElements: [],
      registerFocusableElement: jest.fn(),
      unregisterFocusableElement: jest.fn(),
      isReducedMotion: false,
      isHighContrast: true,
      isLargeText: false,
      keyboardShortcutsEnabled: true,
    });

    render(
      <AccessibilityProvider>
        <AccessibleComponent />
      </AccessibilityProvider>
    );

    // Check if high contrast mode is enabled
    expect(screen.getByTestId("high-contrast").textContent).toBe("true");
  });

  it("should apply large text when enabled", () => {
    // Mock large text mode
    (useAccessibility as jest.Mock).mockReturnValue({
      announceToScreenReader: jest.fn(),
      focusableElements: [],
      registerFocusableElement: jest.fn(),
      unregisterFocusableElement: jest.fn(),
      isReducedMotion: false,
      isHighContrast: false,
      isLargeText: true,
      keyboardShortcutsEnabled: true,
    });

    render(
      <AccessibilityProvider>
        <AccessibleComponent />
      </AccessibilityProvider>
    );

    // Check if large text mode is enabled
    expect(screen.getByTestId("large-text").textContent).toBe("true");
  });

  it("should handle keyboard navigation", () => {
    render(
      <AccessibilityProvider>
        <AccessibleComponent />
      </AccessibilityProvider>
    );

    // Tab through the elements
    const startButton = screen.getByRole("button", { name: /start/i });

    // Focus on the start button
    startButton.focus();
    expect(document.activeElement).toBe(startButton);

    // Tab to the next button
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });

    // The next focusable element should now be focused
    expect(document.activeElement).not.toBe(startButton);
  });

  it("should have proper ARIA attributes on timer controls", () => {
    render(
      <AccessibilityProvider>
        <AccessibleComponent />
      </AccessibilityProvider>
    );

    // Check if timer has proper ARIA attributes
    const timerRegion = screen.getByRole("region", { name: /timer section/i });
    expect(timerRegion).toBeInTheDocument();

    // Check if buttons have proper ARIA attributes
    const startButton = screen.getByRole("button", { name: /start/i });
    expect(startButton).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Start")
    );

    // Check if mode buttons have proper ARIA attributes
    const modeButtons = screen.getAllByRole("button", {
      name: /(focus|short break|long break)/i,
    });
    modeButtons.forEach((button) => {
      expect(button).toHaveAttribute("aria-pressed");
    });
  });
});
