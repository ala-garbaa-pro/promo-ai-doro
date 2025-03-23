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
}

export interface NotificationSettings {
  soundEnabled: boolean;
  desktopNotificationsEnabled: boolean;
  volume: number;
  notificationSound: string;
}

export interface ThemeSettings {
  fontSize: "small" | "medium" | "large";
  accentColor: string;
}

export interface AppSettings {
  timer: TimerSettings;
  notification: NotificationSettings;
  theme: ThemeSettings;
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
  },
  notification: {
    soundEnabled: true,
    desktopNotificationsEnabled: true,
    volume: 80,
    notificationSound: "bell",
  },
  theme: {
    fontSize: "medium",
    accentColor: "indigo",
  },
};

// Create context
interface SettingsContextType {
  settings: AppSettings;
  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
  saveSettings: () => void;
  hasUnsavedChanges: boolean;
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

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateTimerSettings,
        updateNotificationSettings,
        updateThemeSettings,
        resetSettings,
        saveSettings,
        hasUnsavedChanges,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
