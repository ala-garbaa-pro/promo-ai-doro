"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        We apologize for the inconvenience. Our team has been notified and is
        working to fix the issue.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Go to homepage
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-muted rounded-md text-left max-w-2xl overflow-auto">
          <h2 className="text-lg font-semibold mb-2">Error details:</h2>
          <p className="font-mono text-sm break-all">{error.message}</p>
          {error.stack && (
            <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
