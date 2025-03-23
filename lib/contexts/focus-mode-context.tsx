"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "@/lib/contexts/settings-context";
import { useFlowStateDetection } from "@/lib/cognitive-enhancement/flow-state-detection";

export interface FocusModeSettings {
  // General settings
  enabled: boolean;
  autoEnable: boolean;
  autoEnableThreshold: "light" | "deep"; // Flow state level to auto-enable

  // UI settings
  simplifiedUI: boolean;
  hideNotifications: boolean;
  hideNavigation: boolean;

  // Notification settings
  blockNotifications: boolean;
  allowUrgentNotifications: boolean;

  // Environment settings
  dimInterface: boolean;
  reduceMotion: boolean;
  increaseContrast: boolean;

  // Sound settings
  muteAllSounds: boolean;
  playAmbientSounds: boolean;
  ambientSoundVolume: number;
  ambientSoundType: string;

  // Keyboard shortcuts
  enableShortcuts: boolean;
  toggleShortcut: string;
}

export interface FocusModeContextType {
  focusMode: boolean;
  settings: FocusModeSettings;
  toggleFocusMode: () => void;
  updateSettings: (settings: Partial<FocusModeSettings>) => void;
}

// Default focus mode settings
export const defaultFocusModeSettings: FocusModeSettings = {
  enabled: false,
  autoEnable: true,
  autoEnableThreshold: "deep",

  simplifiedUI: true,
  hideNotifications: true,
  hideNavigation: false,

  blockNotifications: true,
  allowUrgentNotifications: true,

  dimInterface: true,
  reduceMotion: true,
  increaseContrast: false,

  muteAllSounds: false,
  playAmbientSounds: true,
  ambientSoundVolume: 50,
  ambientSoundType: "white-noise",

  enableShortcuts: true,
  toggleShortcut: "Alt+F",
};

// Create context
const FocusModeContext = createContext<FocusModeContextType | undefined>(
  undefined
);

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const { settings: appSettings } = useSettings();
  const { metrics } = useFlowStateDetection();

  // State for focus mode
  const [focusMode, setFocusMode] = useState(false);
  const [settings, setSettings] = useState<FocusModeSettings>(
    defaultFocusModeSettings
  );

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("focusModeSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error("Error parsing focus mode settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("focusModeSettings", JSON.stringify(settings));
  }, [settings]);

  // Auto-enable focus mode based on flow state
  useEffect(() => {
    if (!settings.autoEnable) return;

    if (
      (settings.autoEnableThreshold === "light" &&
        (metrics.flowState === "light" || metrics.flowState === "deep")) ||
      (settings.autoEnableThreshold === "deep" && metrics.flowState === "deep")
    ) {
      if (!focusMode) {
        setFocusMode(true);
      }
    } else if (
      metrics.flowState === "exiting" ||
      metrics.flowState === "none"
    ) {
      if (focusMode) {
        setFocusMode(false);
      }
    }
  }, [
    metrics.flowState,
    settings.autoEnable,
    settings.autoEnableThreshold,
    focusMode,
  ]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!settings.enableShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Parse the shortcut string
      const shortcut = settings.toggleShortcut.split("+");
      const key = shortcut[shortcut.length - 1].toLowerCase();
      const alt = shortcut.includes("Alt");
      const ctrl = shortcut.includes("Ctrl");
      const shift = shortcut.includes("Shift");

      // Check if the pressed keys match the shortcut
      if (
        e.key.toLowerCase() === key &&
        e.altKey === alt &&
        e.ctrlKey === ctrl &&
        e.shiftKey === shift
      ) {
        toggleFocusMode();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [settings.enableShortcuts, settings.toggleShortcut]);

  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusMode((prev) => !prev);
  };

  // Update settings
  const updateSettings = (newSettings: Partial<FocusModeSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <FocusModeContext.Provider
      value={{
        focusMode,
        settings,
        toggleFocusMode,
        updateSettings,
      }}
    >
      {children}
    </FocusModeContext.Provider>
  );
}

// Hook for using the focus mode context
export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error("useFocusMode must be used within a FocusModeProvider");
  }
  return context;
}
