"use client";

import { useEffect, useRef } from "react";
import { useAccessibility } from "@/lib/contexts/accessibility-context";

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: (e: KeyboardEvent) => void;
  onShiftTab?: (e: KeyboardEvent) => void;
  disabled?: boolean;
}

export function useKeyboardNavigation(
  ref: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) {
  const {
    keyboardShortcutsEnabled,
    registerFocusableElement,
    unregisterFocusableElement,
  } = useAccessibility();
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Register element for keyboard navigation
  useEffect(() => {
    if (!ref.current || options.disabled || !keyboardShortcutsEnabled) return;

    registerFocusableElement(ref.current);

    return () => {
      if (ref.current) {
        unregisterFocusableElement(ref.current);
      }
    };
  }, [
    ref,
    options.disabled,
    keyboardShortcutsEnabled,
    registerFocusableElement,
    unregisterFocusableElement,
  ]);

  // Handle keyboard events
  useEffect(() => {
    if (!ref.current || options.disabled || !keyboardShortcutsEnabled) return;

    const element = ref.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      const opts = optionsRef.current;

      switch (e.key) {
        case "Escape":
          if (opts.onEscape) {
            e.preventDefault();
            opts.onEscape();
          }
          break;
        case "Enter":
          if (opts.onEnter) {
            e.preventDefault();
            opts.onEnter();
          }
          break;
        case "ArrowUp":
          if (opts.onArrowUp) {
            e.preventDefault();
            opts.onArrowUp();
          }
          break;
        case "ArrowDown":
          if (opts.onArrowDown) {
            e.preventDefault();
            opts.onArrowDown();
          }
          break;
        case "ArrowLeft":
          if (opts.onArrowLeft) {
            e.preventDefault();
            opts.onArrowLeft();
          }
          break;
        case "ArrowRight":
          if (opts.onArrowRight) {
            e.preventDefault();
            opts.onArrowRight();
          }
          break;
        case "Tab":
          if (e.shiftKey && opts.onShiftTab) {
            opts.onShiftTab(e);
          } else if (opts.onTab) {
            opts.onTab(e);
          }
          break;
      }
    };

    element.addEventListener("keydown", handleKeyDown);

    return () => {
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, options.disabled, keyboardShortcutsEnabled]);

  return {
    focusElement: () => {
      if (ref.current) {
        ref.current.focus();
      }
    },
  };
}
