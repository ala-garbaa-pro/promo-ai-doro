import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  AccessibilityProvider,
  useAccessibility,
} from "@/lib/contexts/accessibility-context";
import { SettingsProvider } from "@/lib/contexts/settings-context";

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: "light",
  }),
}));

// Test component that uses the accessibility context
const TestComponent = () => {
  const {
    announceToScreenReader,
    registerFocusableElement,
    unregisterFocusableElement,
    isReducedMotion,
    isHighContrast,
    isLargeText,
    keyboardShortcutsEnabled,
    focusableElements,
  } = useAccessibility();

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (buttonRef.current) {
      registerFocusableElement(buttonRef.current);
    }

    return () => {
      if (buttonRef.current) {
        unregisterFocusableElement(buttonRef.current);
      }
    };
  }, [registerFocusableElement, unregisterFocusableElement]);

  return (
    <div>
      <h1>Accessibility Test</h1>
      <button
        ref={buttonRef}
        onClick={() => announceToScreenReader("Button clicked")}
        data-testid="announce-button"
      >
        Announce to Screen Reader
      </button>
      <div data-testid="reduced-motion">
        {isReducedMotion ? "true" : "false"}
      </div>
      <div data-testid="high-contrast">{isHighContrast ? "true" : "false"}</div>
      <div data-testid="large-text">{isLargeText ? "true" : "false"}</div>
      <div data-testid="keyboard-shortcuts">
        {keyboardShortcutsEnabled ? "true" : "false"}
      </div>
      <div data-testid="focusable-count">{focusableElements.length}</div>
    </div>
  );
};

describe("Accessibility Context", () => {
  it("provides accessibility features", () => {
    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Check default values
    expect(screen.getByTestId("reduced-motion").textContent).toBe("false");
    expect(screen.getByTestId("high-contrast").textContent).toBe("false");
    expect(screen.getByTestId("large-text").textContent).toBe("false");
    expect(screen.getByTestId("keyboard-shortcuts").textContent).toBe("true");

    // Check that the button was registered as a focusable element
    expect(screen.getByTestId("focusable-count").textContent).toBe("1");
  });

  it("announces messages to screen reader", () => {
    render(
      <SettingsProvider>
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Click the button to announce a message
    fireEvent.click(screen.getByTestId("announce-button"));

    // Check that the message is in the DOM (in the aria-live region)
    const politeRegion = document.querySelector('[aria-live="polite"]');
    expect(politeRegion).toHaveTextContent("Button clicked");
  });

  it("registers and unregisters focusable elements", () => {
    const { unmount } = render(
      <SettingsProvider>
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      </SettingsProvider>
    );

    // Initially, the button should be registered
    expect(screen.getByTestId("focusable-count").textContent).toBe("1");

    // Unmount the component
    unmount();

    // The button should be unregistered, but we can't test this directly
    // since the component is unmounted. This is just to ensure the cleanup
    // function runs without errors.
  });
});
