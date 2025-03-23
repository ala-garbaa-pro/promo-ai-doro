"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

// Define types for our settings
export interface TimerSettings {
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
  autoIncrementFocus: boolean;
  incrementAmount: number;
  dailyGoal: number;
  timerLabels: {
    pomodoro: string;
    shortBreak: string;
    longBreak: string;
  };
  countDirection: "down" | "up";
  // Cognitive enhancement settings
  earlyBirdMode: boolean;
  nightOwlMode: boolean;
  adaptiveScheduling: boolean;
  cognitiveLoadOptimization: boolean;
  contextSwitchingMinimization: boolean;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  desktopNotificationsEnabled: boolean;
  volume: number;
  notificationSound: string;
  customMessages: {
    pomodoro: string;
    shortBreak: string;
    longBreak: string;
  };
  showRemainingTime: boolean;
  notifyBeforeEnd: boolean;
  notifyBeforeEndTime: number; // in seconds
  ambientSounds: {
    enabled: boolean;
    volume: number;
    defaultSound: string;
    autoPlay: boolean;
    preferBinauralBeats: boolean;
    showDescriptions: boolean;
    defaultCategory: string;
  };
}

export interface ThemeSettings {
  fontSize: "small" | "medium" | "large";
  accentColor: string;
  fontFamily: "system" | "poppins" | "inter" | "jetbrains";
  animationSpeed: "none" | "slow" | "normal" | "fast";
  useCustomColors: boolean;
  customColors: {
    primary: string;
    background: string;
    card: string;
  };
  timerStyle: "minimal" | "classic" | "digital";
  showProgressBar: boolean;
}

export interface AppSettings {
  timer: TimerSettings;
  notification: NotificationSettings;
  theme: ThemeSettings;
  accessibility: {
    highContrastMode: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    keyboardShortcutsEnabled: boolean;
    screenReaderAnnouncements: boolean;
  };
}

// Default settings
export const defaultSettings: AppSettings = {
  timer: {
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4,
    autoIncrementFocus: false,
    incrementAmount: 5,
    dailyGoal: 8,
    timerLabels: {
      pomodoro: "Focus",
      shortBreak: "Short Break",
      longBreak: "Long Break",
    },
    countDirection: "down",
    // Cognitive enhancement settings
    earlyBirdMode: false,
    nightOwlMode: false,
    adaptiveScheduling: true,
    cognitiveLoadOptimization: true,
    contextSwitchingMinimization: true,
  },
  notification: {
    soundEnabled: true,
    desktopNotificationsEnabled: true,
    volume: 80,
    notificationSound: "bell",
    customMessages: {
      pomodoro: "Time to focus!",
      shortBreak: "Take a short break!",
      longBreak: "Take a long break!",
    },
    showRemainingTime: true,
    notifyBeforeEnd: false,
    notifyBeforeEndTime: 30,
    ambientSounds: {
      enabled: true,
      volume: 50,
      defaultSound: "rain",
      autoPlay: false,
      preferBinauralBeats: false,
      showDescriptions: true,
      defaultCategory: "nature",
    },
  },
  theme: {
    fontSize: "medium",
    accentColor: "indigo",
    fontFamily: "system",
    animationSpeed: "normal",
    useCustomColors: false,
    customColors: {
      primary: "#6366f1",
      background: "#ffffff",
      card: "#f8fafc",
    },
    timerStyle: "classic",
    showProgressBar: true,
  },
  accessibility: {
    highContrastMode: false,
    reducedMotion: false,
    largeText: false,
    keyboardShortcutsEnabled: true,
    screenReaderAnnouncements: true,
  },
};

// Create context
interface SettingsContextType {
  settings: AppSettings;
  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  updateAccessibilitySettings: (
    settings: Partial<AppSettings["accessibility"]>
  ) => void;
  resetSettings: () => void;
  saveSettings: () => void;
  hasUnsavedChanges: boolean;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [savedSettings, setSavedSettings] =
    useState<AppSettings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem("pomodoro-settings");
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings) as AppSettings;
          setSettings(parsedSettings);
          setSavedSettings(parsedSettings);
        }
      } catch (error) {
        console.error("Failed to load settings from localStorage:", error);
      }
    };

    loadSettings();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(
      JSON.stringify(settings) !== JSON.stringify(savedSettings)
    );
  }, [settings, savedSettings]);

  // Update timer settings
  const updateTimerSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        ...newSettings,
      },
    }));
  };

  // Update notification settings
  const updateNotificationSettings = (
    newSettings: Partial<NotificationSettings>
  ) => {
    setSettings((prev) => ({
      ...prev,
      notification: {
        ...prev.notification,
        ...newSettings,
      },
    }));
  };

  // Update theme settings
  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...newSettings,
      },
    }));
  };

  // Update accessibility settings
  const updateAccessibilitySettings = (
    newSettings: Partial<AppSettings["accessibility"]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        ...newSettings,
      },
    }));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem("pomodoro-settings", JSON.stringify(settings));
      setSavedSettings(settings);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  // Export settings as JSON string
  const exportSettings = (): string => {
    return JSON.stringify(settings, null, 2);
  };

  // Import settings from JSON string
  const importSettings = (settingsJson: string): boolean => {
    try {
      const parsedSettings = JSON.parse(settingsJson) as AppSettings;

      // Validate the imported settings
      if (
        !parsedSettings.timer ||
        !parsedSettings.notification ||
        !parsedSettings.theme ||
        !parsedSettings.accessibility
      ) {
        throw new Error("Invalid settings format");
      }

      setSettings(parsedSettings);
      return true;
    } catch (error) {
      console.error("Failed to import settings:", error);
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateTimerSettings,
        updateNotificationSettings,
        updateThemeSettings,
        updateAccessibilitySettings,
        resetSettings,
        saveSettings,
        hasUnsavedChanges,
        exportSettings,
        importSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
