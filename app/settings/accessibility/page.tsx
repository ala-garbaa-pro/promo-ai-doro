"use client";

import { useState } from "react";
import { useSettings } from "@/lib/contexts/settings-context";
import { SettingsHeader } from "@/components/settings/settings-header";
import { SettingsContainer } from "@/components/settings/settings-container";
import { SettingsSection } from "@/components/settings/settings-section";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { KeyboardShortcutsButton } from "@/components/ui/keyboard-shortcuts";
import { Keyboard, Eye, MousePointer, Type, Palette } from "lucide-react";

export default function AccessibilitySettingsPage() {
  const { settings, updateAccessibilitySettings, saveSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    saveSettings();
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <SettingsHeader
        title="Accessibility Settings"
        description="Customize your experience to make the app more accessible"
        onSave={handleSave}
        isSaving={isSaving}
      />

      <SettingsContainer>
        <SettingsSection
          title="Keyboard Navigation"
          description="Settings for keyboard users"
          icon={<Keyboard className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="keyboard-shortcuts" className="font-medium">
                  Enable Keyboard Shortcuts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use keyboard shortcuts to control the timer and navigate the
                  app
                </p>
              </div>
              <Switch
                id="keyboard-shortcuts"
                checked={settings.accessibility.keyboardShortcutsEnabled}
                onCheckedChange={(checked) =>
                  updateAccessibilitySettings({
                    keyboardShortcutsEnabled: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tab-navigation" className="font-medium">
                  Enhanced Tab Navigation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Improve navigation with the Tab key
                </p>
              </div>
              <Switch
                id="tab-navigation"
                checked={settings.accessibility.tabNavigation}
                onCheckedChange={(checked) =>
                  updateAccessibilitySettings({ tabNavigation: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="focus-indicators" className="font-medium">
                  Focus Indicators
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show clear visual indicators when elements are focused
                </p>
              </div>
              <Switch
                id="focus-indicators"
                checked={settings.accessibility.focusIndicators}
                onCheckedChange={(checked) =>
                  updateAccessibilitySettings({ focusIndicators: checked })
                }
              />
            </div>

            {settings.accessibility.keyboardShortcutsEnabled && (
              <div className="pt-2">
                <KeyboardShortcutsButton />
              </div>
            )}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Visual Accessibility"
          description="Settings for visual impairments"
          icon={<Eye className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-contrast" className="font-medium">
                  High Contrast Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.accessibility.highContrastMode}
                onCheckedChange={(checked) =>
                  updateAccessibilitySettings({ highContrastMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="large-text" className="font-medium">
                  Large Text
                </Label>
                <p className="text-sm text-muted-foreground">
                  Increase text size throughout the app
                </p>
              </div>
              <Switch
                id="large-text"
                checked={settings.accessibility.largeText}
                onCheckedChange={(checked) =>
                  updateAccessibilitySettings({ largeText: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color-blind-mode" className="font-medium">
                Color Blind Mode
              </Label>
              <RadioGroup
                id="color-blind-mode"
                value={settings.accessibility.colorBlindMode}
                onValueChange={(value) =>
                  updateAccessibilitySettings({
                    colorBlindMode: value as
                      | "none"
                      | "protanopia"
                      | "deuteranopia"
                      | "tritanopia",
                  })
                }
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="protanopia" id="protanopia" />
                  <Label htmlFor="protanopia">Protanopia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deuteranopia" id="deuteranopia" />
                  <Label htmlFor="deuteranopia">Deuteranopia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tritanopia" id="tritanopia" />
                  <Label htmlFor="tritanopia">Tritanopia</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Motion & Animation"
          description="Settings for motion sensitivity"
          icon={<MousePointer className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduced-motion" className="font-medium">
                  Reduced Motion
                </Label>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.accessibility.reducedMotion}
                onCheckedChange={(checked) =>
                  updateAccessibilitySettings({ reducedMotion: checked })
                }
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Screen Reader Support"
          description="Settings for screen reader users"
          icon={<Type className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="screen-reader" className="font-medium">
                  Screen Reader Optimized
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enhance compatibility with screen readers
                </p>
              </div>
              <Switch
                id="screen-reader"
                checked={settings.accessibility.screenReaderOptimized}
                onCheckedChange={(checked) =>
                  updateAccessibilitySettings({
                    screenReaderOptimized: checked,
                  })
                }
              />
            </div>
          </div>
        </SettingsSection>
      </SettingsContainer>
    </div>
  );
}
