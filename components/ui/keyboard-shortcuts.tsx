"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

interface ShortcutDefinition {
  key: string;
  description: string;
  action: () => void;
  global?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]) {
  const { toast } = useToast();
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Check for ? key to show shortcuts dialog
      if (event.key === "?" && !event.ctrlKey && !event.metaKey) {
        setShowShortcutsDialog(true);
        return;
      }

      // Check for registered shortcuts
      for (const shortcut of shortcuts) {
        const keyParts = shortcut.key.split("+");
        const mainKey = keyParts[keyParts.length - 1].toLowerCase();
        const needsCtrl = keyParts.includes("Ctrl");
        const needsShift = keyParts.includes("Shift");
        const needsAlt = keyParts.includes("Alt");
        const needsMeta = keyParts.includes("Meta");

        if (
          event.key.toLowerCase() === mainKey &&
          event.ctrlKey === needsCtrl &&
          event.shiftKey === needsShift &&
          event.altKey === needsAlt &&
          event.metaKey === needsMeta
        ) {
          event.preventDefault();
          shortcut.action();

          // Show toast notification for the shortcut
          toast({
            title: `Shortcut: ${shortcut.key}`,
            description: shortcut.description,
            duration: 2000,
          });

          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, toast]);

  return {
    showShortcutsDialog,
    setShowShortcutsDialog,
  };
}

interface KeyboardShortcutsProps {
  shortcuts: ShortcutDefinition[];
  showDialog: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsDialog({
  shortcuts,
  showDialog,
  onClose,
}: KeyboardShortcutsProps) {
  return (
    <Dialog open={showDialog} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Press the following keys to quickly navigate and perform actions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="rounded-md border">
            <div className="bg-muted px-4 py-2 rounded-t-md">
              <h3 className="font-medium">Global Shortcuts</h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Show Keyboard Shortcuts</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold">
                  ?
                </kbd>
              </div>
              {shortcuts
                .filter((s) => s.global)
                .map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
            </div>
          </div>
          <div className="rounded-md border">
            <div className="bg-muted px-4 py-2 rounded-t-md">
              <h3 className="font-medium">Page Shortcuts</h3>
            </div>
            <div className="p-4 space-y-2">
              {shortcuts
                .filter((s) => !s.global)
                .map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function KeyboardShortcutsButton() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="gap-1"
      >
        <Keyboard className="h-4 w-4" />
        <span className="sr-only md:not-sr-only">Keyboard Shortcuts</span>
      </Button>

      <KeyboardShortcutsDialog
        shortcuts={[
          // Global navigation shortcuts
          {
            key: "?",
            description: "Show keyboard shortcuts",
            action: () => {},
            global: true,
          },
          {
            key: "g+h",
            description: "Go to home",
            action: () => {},
            global: true,
          },
          {
            key: "g+t",
            description: "Go to tasks",
            action: () => {},
            global: true,
          },
          {
            key: "g+a",
            description: "Go to analytics",
            action: () => {},
            global: true,
          },
          {
            key: "g+s",
            description: "Go to settings",
            action: () => {},
            global: true,
          },

          // Timer shortcuts
          {
            key: "Space",
            description: "Start or pause timer",
            action: () => {},
          },
          {
            key: "r",
            description: "Reset timer",
            action: () => {},
          },
          {
            key: "m",
            description: "Toggle mute",
            action: () => {},
          },
          {
            key: "f",
            description: "Switch to focus mode",
            action: () => {},
          },
          {
            key: "s",
            description: "Switch to short break",
            action: () => {},
          },
          {
            key: "l",
            description: "Switch to long break",
            action: () => {},
          },

          // Task shortcuts
          {
            key: "n",
            description: "New task",
            action: () => {},
          },
          {
            key: "d",
            description: "Mark selected task as done",
            action: () => {},
          },
          {
            key: "Delete",
            description: "Delete selected task",
            action: () => {},
          },
        ]}
        showDialog={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </>
  );
}
