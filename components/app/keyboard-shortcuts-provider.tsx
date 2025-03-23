"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  useKeyboardShortcuts,
  KeyboardShortcutsDialog,
} from "@/components/ui/keyboard-shortcuts";

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  const router = useRouter();

  const shortcuts = [
    // Global navigation shortcuts
    {
      key: "g+h",
      description: "Go to home",
      action: () => router.push("/app"),
      global: true,
    },
    {
      key: "g+t",
      description: "Go to tasks",
      action: () => router.push("/app/tasks"),
      global: true,
    },
    {
      key: "g+a",
      description: "Go to analytics",
      action: () => router.push("/app/analytics"),
      global: true,
    },
    {
      key: "g+b",
      description: "Go to cognitive enhancement",
      action: () => router.push("/app/cognitive-enhancement"),
      global: true,
    },
    {
      key: "g+c",
      description: "Go to calendar",
      action: () => router.push("/app/calendar"),
      global: true,
    },
    {
      key: "g+s",
      description: "Go to settings",
      action: () => router.push("/app/settings"),
      global: true,
    },
    {
      key: "g+p",
      description: "Go to profile",
      action: () => router.push("/app/profile"),
      global: true,
    },
    // Timer shortcuts
    {
      key: "Space",
      description: "Start/Pause timer",
      action: () => {
        const startButton = document.querySelector(
          '[data-action="start-timer"]'
        ) as HTMLButtonElement;
        const pauseButton = document.querySelector(
          '[data-action="pause-timer"]'
        ) as HTMLButtonElement;

        if (startButton) {
          startButton.click();
        } else if (pauseButton) {
          pauseButton.click();
        }
      },
    },
    {
      key: "r",
      description: "Reset timer",
      action: () => {
        const resetButton = document.querySelector(
          '[data-action="reset-timer"]'
        ) as HTMLButtonElement;
        if (resetButton) {
          resetButton.click();
        }
      },
    },
    // Task shortcuts
    {
      key: "n",
      description: "New task",
      action: () => {
        const newTaskButton = document.querySelector(
          '[data-action="new-task"]'
        ) as HTMLButtonElement;
        if (newTaskButton) {
          newTaskButton.click();
        }
      },
    },
    {
      key: "/",
      description: "Focus search",
      action: () => {
        const searchInput = document.querySelector(
          '[data-action="search-input"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
  ];

  const { showShortcutsDialog, setShowShortcutsDialog } =
    useKeyboardShortcuts(shortcuts);

  return (
    <>
      {children}
      <KeyboardShortcutsDialog
        shortcuts={shortcuts}
        showDialog={showShortcutsDialog}
        onClose={() => setShowShortcutsDialog(false)}
      />
    </>
  );
}
