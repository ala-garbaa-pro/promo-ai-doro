"use client";

import { useEffect, useState } from "react";
import { useFocusMode } from "@/lib/contexts/focus-mode-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EyeOff, Volume2, VolumeX } from "lucide-react";
import { useAmbientSoundPlayer } from "@/components/ambient-sound-player/use-ambient-sound-player";

export function FocusModeOverlay() {
  const { focusMode, settings, toggleFocusMode } = useFocusMode();
  const [mounted, setMounted] = useState(false);
  const { playSound, stopSound, setVolume, isPlaying } =
    useAmbientSoundPlayer();

  // Only show the overlay after mounting to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ambient sounds
  useEffect(() => {
    if (!mounted) return;

    if (focusMode && settings.playAmbientSounds && !settings.muteAllSounds) {
      // Map the ambient sound type to the actual sound file
      const soundMap: Record<string, string> = {
        "white-noise": "/sounds/ambient/focus/white-noise.mp3",
        rain: "/sounds/ambient/focus/rain.mp3",
        forest: "/sounds/ambient/focus/forest.mp3",
        cafe: "/sounds/ambient/focus/cafe.mp3",
        ocean: "/sounds/ambient/focus/ocean.mp3",
        binaural: "/sounds/ambient/binaural/alpha.mp3",
      };

      const soundFile =
        soundMap[settings.ambientSoundType] || soundMap["white-noise"];

      // Set volume and play sound
      setVolume(settings.ambientSoundVolume / 100);
      playSound(soundFile, true); // Loop the sound
    } else {
      // Stop sound when focus mode is disabled
      stopSound();
    }

    return () => {
      // Clean up when component unmounts
      if (isPlaying) {
        stopSound();
      }
    };
  }, [
    focusMode,
    settings.playAmbientSounds,
    settings.muteAllSounds,
    settings.ambientSoundType,
    settings.ambientSoundVolume,
    mounted,
    playSound,
    stopSound,
    setVolume,
    isPlaying,
  ]);

  if (!mounted) return null;

  // If focus mode is not active, don't render anything
  if (!focusMode) return null;

  return (
    <>
      {/* Global styles for focus mode */}
      <style jsx global>{`
        ${settings.simplifiedUI
          ? `
          /* Hide non-essential UI elements */
          .focus-hide {
            display: none !important;
          }
        `
          : ""}

        ${settings.dimInterface
          ? `
          /* Dim the interface */
          body {
            filter: brightness(0.95) contrast(1.05);
          }
        `
          : ""}
        
        ${settings.reduceMotion
          ? `
          /* Reduce motion */
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        `
          : ""}
        
        ${settings.hideNavigation
          ? `
          /* Hide navigation */
          nav, .sidebar {
            display: none !important;
          }
          
          /* Expand main content */
          main {
            width: 100% !important;
            margin-left: 0 !important;
          }
        `
          : ""}
      `}</style>

      {/* Floating control panel */}
      <div
        className={cn(
          "fixed bottom-4 right-4 z-50 flex items-center gap-2 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-md transition-all duration-300",
          settings.simplifiedUI ? "opacity-30 hover:opacity-100" : ""
        )}
      >
        {settings.playAmbientSounds && !settings.muteAllSounds && (
          <div className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
            <Volume2 className="h-3 w-3" />
            <span>{settings.ambientSoundType}</span>
          </div>
        )}

        {settings.muteAllSounds && (
          <div className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
            <VolumeX className="h-3 w-3" />
            <span>Muted</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
          onClick={toggleFocusMode}
        >
          <EyeOff className="h-4 w-4" />
          <span className="sr-only">Exit Focus Mode</span>
        </Button>
      </div>

      {/* Notification blocker */}
      {settings.blockNotifications && (
        <div className="hidden">
          {/* This component will intercept and block notifications */}
          <NotificationBlocker
            allowUrgent={settings.allowUrgentNotifications}
          />
        </div>
      )}
    </>
  );
}

// Component to intercept and block notifications
function NotificationBlocker({
  allowUrgent = false,
}: {
  allowUrgent?: boolean;
}) {
  useEffect(() => {
    // Store the original Notification constructor
    const OriginalNotification = window.Notification;

    // Create a proxy to intercept notification creation
    class NotificationProxy extends OriginalNotification {
      constructor(title: string, options?: NotificationOptions) {
        // Check if this is an urgent notification that should be allowed
        const isUrgent =
          options?.tag?.includes("urgent") ||
          options?.tag?.includes("important") ||
          title.toLowerCase().includes("urgent") ||
          title.toLowerCase().includes("important");

        // Allow urgent notifications if configured to do so
        if (allowUrgent && isUrgent) {
          super(title, options);
        } else {
          // For non-urgent notifications, don't actually create the notification
          // but still return an object that looks like a Notification
          return {
            close: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
            onclick: null,
            onclose: null,
            onerror: null,
            onshow: null,
          } as unknown as Notification;
        }
      }
    }

    // Replace the global Notification constructor with our proxy
    window.Notification = NotificationProxy as any;

    // Restore the original Notification constructor when the component unmounts
    return () => {
      window.Notification = OriginalNotification;
    };
  }, [allowUrgent]);

  return null;
}
