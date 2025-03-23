"use client";

import React from "react";
import { SettingsProvider as CoreSettingsProvider } from "@/lib/contexts/settings-context";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  return <CoreSettingsProvider>{children}</CoreSettingsProvider>;
}

export { useSettings } from "@/lib/contexts/settings-context";
