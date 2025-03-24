"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface SettingsHeaderProps {
  title: string;
  description: string;
  onSave: () => void;
  isSaving?: boolean;
}

export function SettingsHeader({
  title,
  description,
  onSave,
  isSaving = false,
}: SettingsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button
        onClick={onSave}
        disabled={isSaving}
        className="mt-4 md:mt-0"
        size="sm"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}
