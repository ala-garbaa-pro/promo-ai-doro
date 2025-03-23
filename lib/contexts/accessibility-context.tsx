"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./settings-context";

interface AccessibilityContextType {
  announceToScreenReader: (
    message: string,
    politeness?: "polite" | "assertive"
  ) => void;
  focusableElements: HTMLElement[];
  registerFocusableElement: (element: HTMLElement) => void;
  unregisterFocusableElement: (element: HTMLElement) => void;
  isReducedMotion: boolean;
  isHighContrast: boolean;
  isLargeText: boolean;
  keyboardShortcutsEnabled: boolean;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSettings();
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [announcements, setAnnouncements] = useState<
    { message: string; politeness: "polite" | "assertive" }[]
  >([]);

  // Get accessibility settings
  const isReducedMotion = settings.accessibility.reducedMotion;
  const isHighContrast = settings.accessibility.highContrastMode;
  const isLargeText = settings.accessibility.largeText;
  const keyboardShortcutsEnabled =
    settings.accessibility.keyboardShortcutsEnabled;
  const screenReaderAnnouncements =
    settings.accessibility.screenReaderAnnouncements;

  // Register a focusable element
  const registerFocusableElement = (element: HTMLElement) => {
    setFocusableElements((prev) => [...prev, element]);
  };

  // Unregister a focusable element
  const unregisterFocusableElement = (element: HTMLElement) => {
    setFocusableElements((prev) => prev.filter((el) => el !== element));
  };

  // Announce to screen reader
  const announceToScreenReader = (
    message: string,
    politeness: "polite" | "assertive" = "polite"
  ) => {
    if (!screenReaderAnnouncements) return;

    setAnnouncements((prev) => [...prev, { message, politeness }]);

    // Remove announcement after it's been read (5 seconds)
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.message !== message));
    }, 5000);
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!keyboardShortcutsEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab key is handled by the browser

      // Escape key to close modals or cancel actions
      if (e.key === "Escape") {
        // Implementation depends on the app state
      }

      // Arrow keys for navigation
      if (e.key.startsWith("Arrow") && e.altKey) {
        e.preventDefault();

        // Find the currently focused element
        const focusedElement = document.activeElement as HTMLElement;
        const currentIndex = focusableElements.indexOf(focusedElement);

        if (currentIndex === -1) return;

        let nextIndex = currentIndex;

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          nextIndex = (currentIndex + 1) % focusableElements.length;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          nextIndex =
            (currentIndex - 1 + focusableElements.length) %
            focusableElements.length;
        }

        focusableElements[nextIndex]?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyboardShortcutsEnabled, focusableElements]);

  return (
    <AccessibilityContext.Provider
      value={{
        announceToScreenReader,
        focusableElements,
        registerFocusableElement,
        unregisterFocusableElement,
        isReducedMotion,
        isHighContrast,
        isLargeText,
        keyboardShortcutsEnabled,
      }}
    >
      {children}

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only" role="status">
        {announcements
          .filter((a) => a.politeness === "polite")
          .map((a) => (
            <div key={a.message}>{a.message}</div>
          ))}
      </div>

      <div aria-live="assertive" className="sr-only" role="alert">
        {announcements
          .filter((a) => a.politeness === "assertive")
          .map((a) => (
            <div key={a.message}>{a.message}</div>
          ))}
      </div>
    </AccessibilityContext.Provider>
  );
}
