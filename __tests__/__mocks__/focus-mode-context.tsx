import React, { createContext, useContext, useState, useEffect } from "react";

// Default focus mode settings
export const defaultFocusModeSettings = {
  simplifiedUI: true,
  hideNotifications: true,
  dimInterface: true,
  playAmbientSounds: true,
};

// Create the context
const FocusModeContext = createContext<{
  focusMode: boolean;
  settings: typeof defaultFocusModeSettings;
  toggleFocusMode: () => void;
  updateSettings: (
    newSettings: Partial<typeof defaultFocusModeSettings>
  ) => void;
}>({
  focusMode: false,
  settings: defaultFocusModeSettings,
  toggleFocusMode: () => {},
  updateSettings: () => {},
});

// Provider component
export const FocusModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [focusMode, setFocusMode] = useState(false);
  const [settings, setSettings] = useState(defaultFocusModeSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("focusModeSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error parsing focus mode settings:", error);
      }
    }
  }, []);

  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusMode((prev) => !prev);
  };

  // Update settings
  const updateSettings = (
    newSettings: Partial<typeof defaultFocusModeSettings>
  ) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem("focusModeSettings", JSON.stringify(updatedSettings));
  };

  // Set up keyboard shortcut for focus mode (Alt+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "f") {
        toggleFocusMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
};

// Hook for using the focus mode context
export const useFocusMode = () => useContext(FocusModeContext);
