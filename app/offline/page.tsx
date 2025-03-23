"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Try to refresh the page
  const handleRefresh = () => {
    router.refresh();
  };

  // Try to go back to the home page
  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isOnline ? (
              <Wifi className="h-12 w-12 text-green-500" />
            ) : (
              <WifiOff className="h-12 w-12 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isOnline ? "You're back online!" : "You're offline"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {isOnline
              ? "Your internet connection has been restored. You can continue using the app."
              : "It seems you're not connected to the internet. Some features may not be available."}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              onClick={handleRefresh}
              className="flex items-center gap-2"
              variant={isOnline ? "default" : "outline"}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={handleGoHome}
              variant={isOnline ? "outline" : "default"}
            >
              Go to Home
            </Button>
          </div>

          {!isOnline && (
            <div className="mt-6 text-sm text-muted-foreground">
              <p className="font-medium mb-2">While offline, you can still:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>View previously loaded tasks</li>
                <li>Use the Pomodoro timer</li>
                <li>Access your settings</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
