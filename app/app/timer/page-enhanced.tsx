"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Settings,
  Trophy,
  Target,
  CheckCircle,
} from "lucide-react";
import { useSettings } from "@/lib/contexts/settings-context";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  requestNotificationPermission,
  showNotification,
  playSound,
} from "@/lib/utils/notifications";
import { useAccessibility } from "@/lib/contexts/accessibility-context";
import { SkipToContent } from "@/components/accessibility/skip-to-content";
import { AccessibleButton } from "@/components/accessibility/accessible-button";
import { cn } from "@/lib/utils";

// Timer modes
type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

// Get timer durations from settings
const getTimerDurations = (settings: any) => ({
  pomodoro: settings.timer.pomodoroDuration * 60,
  shortBreak: settings.timer.shortBreakDuration * 60,
  longBreak: settings.timer.longBreakDuration * 60,
});

// Create a Progress component if it doesn't exist
function Progress({
  value,
  max,
  className,
  ...props
}: {
  value: number;
  max: number;
  className?: string;
  [key: string]: any;
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        "w-full bg-secondary rounded-full h-2 overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}

export default function TimerPage() {
  const { settings } = useSettings();
  const { toast } = useToast();
  const { announceToScreenReader, isReducedMotion } = useAccessibility();
  const timerDurations = getTimerDurations(settings);

  // Request notification permission on component mount
  useEffect(() => {
    if (settings.notification.desktopNotificationsEnabled) {
      requestNotificationPermission();
    }
  }, [settings.notification.desktopNotificationsEnabled]);

  // Timer state
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(timerDurations[mode]);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(!settings.notification.soundEnabled);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [dailyGoalReached, setDailyGoalReached] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Refs for accessibility
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when mode changes or settings change
  useEffect(() => {
    setTimeLeft(timerDurations[mode]);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [mode, timerDurations]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setIsRunning(false);

            // Play sound if not muted and sound is enabled
            if (!isMuted && settings.notification.soundEnabled) {
              const soundFile = `/sounds/${
                settings.notification.notificationSound || "bell"
              }.mp3`;
              playSound(soundFile, settings.notification.volume / 100);
            }

            // Show desktop notification if enabled
            if (settings.notification.desktopNotificationsEnabled) {
              showNotification("Pomo AI-doro", {
                body:
                  mode === "pomodoro"
                    ? settings.notification.customMessages.pomodoro
                    : mode === "shortBreak"
                    ? settings.notification.customMessages.shortBreak
                    : settings.notification.customMessages.longBreak,
                icon: "/favicon.ico",
              });
            }

            // Update completed pomodoros count
            if (mode === "pomodoro") {
              const newCount = completedPomodoros + 1;
              setCompletedPomodoros(newCount);

              // Check if daily goal is reached
              if (newCount >= settings.timer.dailyGoal && !dailyGoalReached) {
                setDailyGoalReached(true);
                setShowCelebration(true);
                toast({
                  title: "Daily Goal Reached! 🎉",
                  description: `You've completed ${newCount} pomodoros today!`,
                });
                announceToScreenReader(
                  "Congratulations! You've reached your daily goal.",
                  "assertive"
                );

                // Hide celebration after 5 seconds
                setTimeout(() => {
                  setShowCelebration(false);
                }, 5000);
              }

              // Auto-start break if enabled in settings
              if (settings.timer.autoStartBreaks) {
                // After configured pomodoros, take a long break
                if (newCount % settings.timer.longBreakInterval === 0) {
                  setMode("longBreak");
                  announceToScreenReader("Starting long break");
                } else {
                  setMode("shortBreak");
                  announceToScreenReader("Starting short break");
                }
                // Auto-start the break timer
                setTimeout(() => setIsRunning(true), 500);
              }
            } else if (
              settings.timer.autoStartPomodoros &&
              mode !== "pomodoro"
            ) {
              // Auto-start pomodoro if enabled in settings and we're coming from a break
              setMode("pomodoro");
              announceToScreenReader("Starting new pomodoro");
              // Auto-start the pomodoro timer
              setTimeout(() => setIsRunning(true), 500);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [
    isRunning,
    isMuted,
    mode,
    completedPomodoros,
    settings,
    toast,
    announceToScreenReader,
    dailyGoalReached,
  ]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progressPercentage = (timeLeft / timerDurations[mode]) * 100;

  // Handle start/pause
  const toggleTimer = () => {
    const newState = !isRunning;
    setIsRunning(newState);

    // Announce to screen reader
    announceToScreenReader(newState ? "Timer started" : "Timer paused");

    // Show toast notification
    toast({
      title: newState ? "Timer Started" : "Timer Paused",
      description: newState
        ? `${formatTime(timeLeft)} remaining for ${
            settings.timer.timerLabels[mode]
          }`
        : "Resume when you're ready",
    });
  };

  // Handle reset
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerDurations[mode]);

    // Announce to screen reader
    announceToScreenReader("Timer reset");

    // Show toast notification
    toast({
      title: "Timer Reset",
      description: `${settings.timer.timerLabels[mode]} timer has been reset`,
    });
  };

  // Get next mode
  const getNextMode = (): string => {
    if (mode === "pomodoro") {
      return (completedPomodoros + 1) % settings.timer.longBreakInterval === 0
        ? settings.timer.timerLabels.longBreak
        : settings.timer.timerLabels.shortBreak;
    } else {
      return settings.timer.timerLabels.pomodoro;
    }
  };

  // Handle skip
  const skipToNext = () => {
    setIsRunning(false);

    // Determine next mode
    if (mode === "pomodoro") {
      // After configured number of pomodoros, take a long break
      if ((completedPomodoros + 1) % settings.timer.longBreakInterval === 0) {
        setMode("longBreak");
      } else {
        setMode("shortBreak");
      }
    } else {
      setMode("pomodoro");
    }

    // Announce to screen reader
    announceToScreenReader(`Skipped to ${getNextMode()}`);

    // Show toast notification
    toast({
      title: "Timer Skipped",
      description: `Switched to ${getNextMode()}`,
    });
  };

  // Toggle sound
  const toggleSound = () => {
    const newState = !isMuted;
    setIsMuted(newState);

    // Announce to screen reader
    announceToScreenReader(newState ? "Sound disabled" : "Sound enabled");

    // Show toast notification
    toast({
      title: newState ? "Sound Disabled" : "Sound Enabled",
      description: newState
        ? "You will no longer hear notifications when timers end."
        : "You will now hear notifications when timers end.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <SkipToContent contentId="timer-content" />

      <div className="max-w-md mx-auto">
        <Card className="border-none shadow-lg">
          <CardContent
            className="p-6"
            id="timer-content"
            ref={mainContentRef}
            tabIndex={-1}
          >
            <Tabs defaultValue="pomodoro" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="pomodoro"
                  onClick={() => {
                    setMode("pomodoro");
                    announceToScreenReader(
                      `${settings.timer.timerLabels.pomodoro} mode selected`
                    );
                  }}
                  className={
                    mode === "pomodoro"
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                  aria-label={settings.timer.timerLabels.pomodoro}
                >
                  {settings.timer.timerLabels.pomodoro}
                </TabsTrigger>
                <TabsTrigger
                  value="shortBreak"
                  onClick={() => {
                    setMode("shortBreak");
                    announceToScreenReader(
                      `${settings.timer.timerLabels.shortBreak} mode selected`
                    );
                  }}
                  className={
                    mode === "shortBreak"
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                  aria-label={settings.timer.timerLabels.shortBreak}
                >
                  {settings.timer.timerLabels.shortBreak}
                </TabsTrigger>
                <TabsTrigger
                  value="longBreak"
                  onClick={() => {
                    setMode("longBreak");
                    announceToScreenReader(
                      `${settings.timer.timerLabels.longBreak} mode selected`
                    );
                  }}
                  className={
                    mode === "longBreak"
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                  aria-label={settings.timer.timerLabels.longBreak}
                >
                  {settings.timer.timerLabels.longBreak}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Daily Goal Progress */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  Daily Goal: {completedPomodoros}/{settings.timer.dailyGoal}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: settings.timer.dailyGoal }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i < completedPomodoros ? "bg-primary" : "bg-muted",
                        dailyGoalReached && "animate-pulse"
                      )}
                      aria-hidden="true"
                    />
                  )
                )}
              </div>
            </div>

            {/* Timer Circle */}
            <div className="flex flex-col items-center justify-center py-8">
              <div
                className="relative w-64 h-64 rounded-full flex items-center justify-center mb-8"
                style={{
                  background: settings.theme.showProgressBar
                    ? `conic-gradient(var(--primary) ${progressPercentage}%, transparent 0)`
                    : undefined,
                }}
                role="timer"
                aria-label={`${formatTime(timeLeft)} remaining for ${
                  settings.timer.timerLabels[mode]
                }`}
                aria-live="polite"
              >
                <div className="absolute inset-2 rounded-full bg-card flex flex-col items-center justify-center">
                  <div className="text-5xl font-mono">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {settings.timer.timerLabels[mode]}
                  </div>
                </div>
              </div>

              {/* Show celebration animation when daily goal is reached */}
              {showCelebration && (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center z-10",
                    isReducedMotion ? "opacity-80" : "animate-fade-in-out"
                  )}
                >
                  <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center">
                    <Trophy className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h2 className="text-xl font-bold">Daily Goal Reached!</h2>
                    <p className="text-muted-foreground">
                      Great job! You've completed {completedPomodoros} pomodoros
                      today.
                    </p>
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mt-2" />
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <AccessibleButton
                  size="lg"
                  onClick={toggleTimer}
                  className="w-24 h-12 text-lg"
                  accessibilityLabel={isRunning ? "Pause timer" : "Start timer"}
                  announceOnClick={isRunning ? "Timer paused" : "Timer started"}
                >
                  {isRunning ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </AccessibleButton>
                <AccessibleButton
                  size="lg"
                  variant="outline"
                  onClick={resetTimer}
                  className="w-12 h-12"
                  accessibilityLabel="Reset timer"
                  announceOnClick="Timer reset"
                >
                  <RotateCcw className="h-5 w-5" />
                </AccessibleButton>
                <AccessibleButton
                  size="lg"
                  variant="outline"
                  onClick={skipToNext}
                  className="w-12 h-12"
                  accessibilityLabel="Skip to next timer"
                  announceOnClick={`Skipped to ${getNextMode()}`}
                >
                  <SkipForward className="h-5 w-5" />
                </AccessibleButton>
                <AccessibleButton
                  size="lg"
                  variant="outline"
                  onClick={toggleSound}
                  className="w-12 h-12"
                  accessibilityLabel={
                    isMuted ? "Enable sound" : "Disable sound"
                  }
                  announceOnClick={isMuted ? "Sound enabled" : "Sound disabled"}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </AccessibleButton>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-400 hover:text-white"
                asChild
              >
                <Link href="/app/settings">
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
