"use client";

import { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/lib/contexts/settings-context";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { useAccessibility } from "@/lib/contexts/accessibility-context";

export default function AccessibilitySettings() {
  const { settings, updateAccessibilitySettings } = useSettings();
  const { announceToScreenReader } = useAccessibility();

  const highContrastRef = useRef<HTMLButtonElement>(null);
  const reducedMotionRef = useRef<HTMLButtonElement>(null);
  const largeTextRef = useRef<HTMLButtonElement>(null);
  const keyboardShortcutsRef = useRef<HTMLButtonElement>(null);
  const screenReaderRef = useRef<HTMLButtonElement>(null);

  useKeyboardNavigation(highContrastRef);
  useKeyboardNavigation(reducedMotionRef);
  useKeyboardNavigation(largeTextRef);
  useKeyboardNavigation(keyboardShortcutsRef);
  useKeyboardNavigation(screenReaderRef);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility Settings</CardTitle>
        <CardDescription>
          Customize your experience to make the app more accessible
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="highContrastMode">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              ref={highContrastRef}
              id="highContrastMode"
              checked={settings.accessibility.highContrastMode}
              onCheckedChange={(checked) => {
                updateAccessibilitySettings({ highContrastMode: checked });
                announceToScreenReader(
                  `High contrast mode ${checked ? "enabled" : "disabled"}`
                );
              }}
              aria-label="Toggle high contrast mode"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reducedMotion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and motion effects
              </p>
            </div>
            <Switch
              ref={reducedMotionRef}
              id="reducedMotion"
              checked={settings.accessibility.reducedMotion}
              onCheckedChange={(checked) => {
                updateAccessibilitySettings({ reducedMotion: checked });
                announceToScreenReader(
                  `Reduced motion ${checked ? "enabled" : "disabled"}`
                );
              }}
              aria-label="Toggle reduced motion"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="largeText">Large Text</Label>
              <p className="text-sm text-muted-foreground">
                Increase text size throughout the app
              </p>
            </div>
            <Switch
              ref={largeTextRef}
              id="largeText"
              checked={settings.accessibility.largeText}
              onCheckedChange={(checked) => {
                updateAccessibilitySettings({ largeText: checked });
                announceToScreenReader(
                  `Large text ${checked ? "enabled" : "disabled"}`
                );
              }}
              aria-label="Toggle large text"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="keyboardShortcuts">Keyboard Shortcuts</Label>
              <p className="text-sm text-muted-foreground">
                Enable keyboard navigation and shortcuts
              </p>
            </div>
            <Switch
              ref={keyboardShortcutsRef}
              id="keyboardShortcuts"
              checked={settings.accessibility.keyboardShortcutsEnabled}
              onCheckedChange={(checked) => {
                updateAccessibilitySettings({
                  keyboardShortcutsEnabled: checked,
                });
                announceToScreenReader(
                  `Keyboard shortcuts ${checked ? "enabled" : "disabled"}`
                );
              }}
              aria-label="Toggle keyboard shortcuts"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screenReaderAnnouncements">
                Screen Reader Announcements
              </Label>
              <p className="text-sm text-muted-foreground">
                Announce important events and changes
              </p>
            </div>
            <Switch
              ref={screenReaderRef}
              id="screenReaderAnnouncements"
              checked={settings.accessibility.screenReaderAnnouncements}
              onCheckedChange={(checked) => {
                updateAccessibilitySettings({
                  screenReaderAnnouncements: checked,
                });
                if (checked) {
                  announceToScreenReader("Screen reader announcements enabled");
                }
              }}
              aria-label="Toggle screen reader announcements"
            />
          </div>
        </div>

        <Separator />

        <div className="rounded-lg bg-muted p-4">
          <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <kbd className="px-2 py-1 bg-background rounded border">Tab</kbd>{" "}
              - Navigate between elements
            </p>
            <p>
              <kbd className="px-2 py-1 bg-background rounded border">
                Enter
              </kbd>{" "}
              - Activate buttons and controls
            </p>
            <p>
              <kbd className="px-2 py-1 bg-background rounded border">
                Space
              </kbd>{" "}
              - Toggle switches and checkboxes
            </p>
            <p>
              <kbd className="px-2 py-1 bg-background rounded border">Esc</kbd>{" "}
              - Close dialogs and menus
            </p>
            <p>
              <kbd className="px-2 py-1 bg-background rounded border">Alt</kbd>{" "}
              +{" "}
              <kbd className="px-2 py-1 bg-background rounded border">
                Arrow Keys
              </kbd>{" "}
              - Navigate between sections
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
