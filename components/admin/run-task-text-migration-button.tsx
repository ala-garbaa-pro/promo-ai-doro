"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function RunTaskTextMigrationButton() {
  const [isRunning, setIsRunning] = useState(false);

  const handleRunMigration = async () => {
    setIsRunning(true);

    try {
      const response = await fetch("/api/migrations/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ migrationType: "taskTextTemplates" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to run migration");
      }

      const data = await response.json();

      toast({
        title: "Migration Successful",
        description:
          data.message ||
          "Task text templates migration completed successfully.",
      });
    } catch (error) {
      console.error("Error running migration:", error);

      toast({
        title: "Migration Failed",
        description:
          error instanceof Error ? error.message : "Failed to run migration",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button
      onClick={handleRunMigration}
      disabled={isRunning}
      variant="outline"
      size="sm"
    >
      {isRunning ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Running Task Text Migration...
        </>
      ) : (
        "Run Task Text Migration"
      )}
    </Button>
  );
}
