"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function RunMigrationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const runMigration = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/migrations/run", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Migration successful",
          description: "Database migration completed successfully.",
        });
      } else {
        toast({
          title: "Migration failed",
          description: data.error || "An error occurred during migration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error running migration:", error);
      toast({
        title: "Migration failed",
        description: "An unexpected error occurred during migration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={runMigration}
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Running Migration...
        </>
      ) : (
        "Run Task Categories Migration"
      )}
    </Button>
  );
}
