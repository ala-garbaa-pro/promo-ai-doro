"use client";

import React from "react";

interface SettingsContainerProps {
  children: React.ReactNode;
}

export function SettingsContainer({ children }: SettingsContainerProps) {
  return <div className="space-y-8">{children}</div>;
}
