"use client";

import { forwardRef, useRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { useAccessibility } from "@/lib/contexts/accessibility-context";

interface AccessibleButtonProps extends ButtonProps {
  accessibilityLabel?: string;
  onActivate?: () => void;
  announceOnClick?: string;
}

export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      accessibilityLabel,
      onActivate,
      onClick,
      announceOnClick,
      children,
      ...props
    },
    forwardedRef
  ) => {
    const localRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (forwardedRef ||
      localRef) as React.RefObject<HTMLButtonElement>;
    const { announceToScreenReader } = useAccessibility();

    useKeyboardNavigation(buttonRef, {
      onEnter: () => {
        if (onActivate) {
          onActivate();
        }
      },
      onSpace: () => {
        if (onActivate) {
          onActivate();
        }
      },
    });

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
      }

      if (onActivate) {
        onActivate();
      }

      if (announceOnClick) {
        announceToScreenReader(announceOnClick);
      }
    };

    return (
      <Button
        ref={buttonRef}
        onClick={handleClick}
        aria-label={accessibilityLabel}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";
