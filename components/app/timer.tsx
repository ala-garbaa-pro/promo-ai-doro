"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/lib/contexts/settings-context";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  SkipForward,
} from "lucide-react";
import { AnimatedTransition } from "@/components/ui/animated-transition";
import { useSessionRecording } from "@/hooks/use-session-recording";
import { KeyboardShortcuts } from "@/components/ui/keyboard-shortcuts";

type TimerMode = "pomodoro" | "short-break" | "long-break";

export function Timer() {
  const { settings } = useSettings();
  const { toast } = useToast();

  // Session recording
  const {
    startRecordingSession,
    completeSessionRecording,
    cancelSessionRecording,
    currentSessionId,
  } = useSessionRecording();

  // Timer state
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(
    settings.timer.pomodoroDuration * 60
  );
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isMuted, setIsMuted] = useState(!settings.notification.soundEnabled);
  const [interruptionCount, setInterruptionCount] = useState(0);

  // Audio refs
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcuts handler
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Only handle shortcuts if accessibility settings allow it
      if (!settings.accessibility?.keyboardShortcutsEnabled) return;

      switch (event.key) {
        case " ": // Space
          event.preventDefault();
          isRunning ? pauseTimer() : startTimer();
          break;
        case "r":
          event.preventDefault();
          resetTimer();
          break;
        case "m":
          event.preventDefault();
          toggleMute();
          break;
        case "f":
          event.preventDefault();
          setMode("pomodoro");
          break;
        case "s":
          event.preventDefault();
          setMode("short-break");
          break;
        case "l":
          event.preventDefault();
          setMode("long-break");
          break;
      }
    },
    [isRunning, settings.accessibility?.keyboardShortcutsEnabled]
  );

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  // Initialize timer based on mode
  useEffect(() => {
    let duration = 0;

    switch (mode) {
      case "pomodoro":
        duration = settings.timer.pomodoroDuration * 60;
        break;
      case "short-break":
        duration = settings.timer.shortBreakDuration * 60;
        break;
      case "long-break":
        duration = settings.timer.longBreakDuration * 60;
        break;
    }

    setTimeLeft(duration);
    setIsRunning(false);

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Initialize audio elements
    try {
      if (!startSoundRef.current) {
        startSoundRef.current = new Audio("/sounds/start.mp3");
      }

      if (!endSoundRef.current) {
        endSoundRef.current = new Audio("/sounds/complete.mp3");
      }

      if (!tickSoundRef.current) {
        tickSoundRef.current = new Audio("/sounds/tick.mp3");
      }
    } catch (error) {
      console.error("Error initializing audio elements:", error);
      // Continue without audio if initialization fails
    }

    // Set volume based on mute state
    if (startSoundRef.current) startSoundRef.current.volume = isMuted ? 0 : 0.5;
    if (endSoundRef.current) endSoundRef.current.volume = isMuted ? 0 : 0.5;
    if (tickSoundRef.current) tickSoundRef.current.volume = isMuted ? 0 : 0.2;

    // Update document title
    updateDocumentTitle(duration);

    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mode, settings, isMuted]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Update document title with timer
  const updateDocumentTitle = (seconds: number) => {
    const timeString = formatTime(seconds);
    const modeString = mode === "pomodoro" ? "Focus" : "Break";
    document.title = `${timeString} - ${modeString} | Pomo AI-doro`;
  };

  // Start timer
  const startTimer = async () => {
    if (isRunning) return;

    // Reset interruption count when starting a new session
    setInterruptionCount(0);

    // Start session recording
    let sessionType: "work" | "short-break" | "long-break";
    let duration: number;

    switch (mode) {
      case "pomodoro":
        sessionType = "work";
        duration = settings.timer.pomodoroDuration;
        break;
      case "short-break":
        sessionType = "short-break";
        duration = settings.timer.shortBreakDuration;
        break;
      case "long-break":
        sessionType = "long-break";
        duration = settings.timer.longBreakDuration;
        break;
      default:
        sessionType = "work";
        duration = settings.timer.pomodoroDuration;
    }

    await startRecordingSession(sessionType, duration);

    setIsRunning(true);

    // Play start sound
    if (startSoundRef.current && !isMuted) {
      try {
        const playPromise = startSoundRef.current.play();

        // Handle browsers where play() returns a promise
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error("Error playing sound:", err);
            // Continue timer operation even if sound fails
          });
        }
      } catch (error) {
        console.error("Error playing start sound:", error);
        // Continue timer operation even if sound fails
      }
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        // Play tick sound every second if enabled
        if (
          settings.notification?.tickSound &&
          tickSoundRef.current &&
          !isMuted
        ) {
          try {
            const tickPromise = tickSoundRef.current.play();

            // Handle browsers where play() returns a promise
            if (tickPromise !== undefined) {
              tickPromise.catch((err) => {
                // Just log and continue - don't let sound errors affect timer
                console.error("Error playing tick sound:", err);
              });
            }
          } catch (error) {
            console.error("Error playing tick sound:", error);
          }
        }

        if (prev <= 1) {
          // Timer complete
          clearInterval(timerRef.current!);
          handleTimerComplete();
          return 0;
        }

        // Update document title
        updateDocumentTitle(prev - 1);

        return prev - 1;
      });
    }, 1000);
  };

  // Pause timer
  const pauseTimer = () => {
    if (!isRunning) return;

    setIsRunning(false);

    // Increment interruption count when pausing
    if (mode === "pomodoro") {
      setInterruptionCount((prev) => prev + 1);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset timer
  const resetTimer = async () => {
    pauseTimer();

    // Cancel the current session if it exists
    if (currentSessionId) {
      await cancelSessionRecording(currentSessionId);
    }

    // Reset interruption count
    setInterruptionCount(0);

    let duration = 0;
    switch (mode) {
      case "pomodoro":
        duration = settings.timer.pomodoroDuration * 60;
        break;
      case "short-break":
        duration = settings.timer.shortBreakDuration * 60;
        break;
      case "long-break":
        duration = settings.timer.longBreakDuration * 60;
        break;
    }

    setTimeLeft(duration);
    updateDocumentTitle(duration);
  };

  // Handle timer completion
  const handleTimerComplete = async () => {
    // Complete the session recording
    if (currentSessionId) {
      await completeSessionRecording(
        currentSessionId,
        false, // Not interrupted
        interruptionCount
      );
    }

    // Play end sound
    if (endSoundRef.current && !isMuted) {
      try {
        const endPromise = endSoundRef.current.play();

        // Handle browsers where play() returns a promise
        if (endPromise !== undefined) {
          endPromise.catch((err) => {
            console.error("Error playing end sound:", err);
            // Continue even if sound fails
          });
        }
      } catch (error) {
        console.error("Error playing end sound:", error);
        // Continue even if sound fails
      }
    }

    // Show notification
    if (mode === "pomodoro") {
      const newCompletedCount = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedCount);

      toast({
        title: "Pomodoro Complete!",
        description: "Time for a break. You've earned it!",
      });

      // Check if we should take a long break
      if (newCompletedCount % settings.timer.longBreakInterval === 0) {
        setMode("long-break");
      } else {
        setMode("short-break");
      }
    } else {
      toast({
        title: "Break Complete!",
        description: "Time to focus again!",
      });

      setMode("pomodoro");
    }

    // Reset interruption count
    setInterruptionCount(0);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    let totalSeconds = 0;

    switch (mode) {
      case "pomodoro":
        totalSeconds = settings.timer.pomodoroDuration * 60;
        break;
      case "short-break":
        totalSeconds = settings.timer.shortBreakDuration * 60;
        break;
      case "long-break":
        totalSeconds = settings.timer.longBreakDuration * 60;
        break;
    }

    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  return (
    <AnimatedTransition type="scale" duration={0.4}>
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-center space-x-2 mb-6">
            <Button
              variant={mode === "pomodoro" ? "default" : "outline"}
              onClick={() => setMode("pomodoro")}
              className="flex-1"
              aria-label="Focus mode"
              title="Keyboard shortcut: F"
            >
              <Clock className="h-4 w-4 mr-1 md:mr-2" />
              <span>Focus</span>
            </Button>
            <Button
              variant={mode === "short-break" ? "default" : "outline"}
              onClick={() => setMode("short-break")}
              className="flex-1"
              aria-label="Short break mode"
              title="Keyboard shortcut: S"
            >
              <span>Short Break</span>
            </Button>
            <Button
              variant={mode === "long-break" ? "default" : "outline"}
              onClick={() => setMode("long-break")}
              className="flex-1"
              aria-label="Long break mode"
              title="Keyboard shortcut: L"
            >
              <span>Long Break</span>
            </Button>
          </div>

          <div className="text-center mb-6">
            <div
              className="text-6xl font-bold mb-2"
              aria-live="polite"
              role="timer"
            >
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-muted-foreground">
              {mode === "pomodoro"
                ? "Focus on your task"
                : mode === "short-break"
                ? "Take a short break"
                : "Take a long break"}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {completedPomodoros > 0 && (
                <span>Completed: {completedPomodoros} pomodoros</span>
              )}
            </div>
          </div>

          <Progress
            value={calculateProgress()}
            className="mb-6"
            aria-label={`Timer progress: ${Math.round(calculateProgress())}%`}
          />

          <div className="flex justify-center space-x-4">
            {!isRunning ? (
              <Button
                data-action="start-timer"
                data-testid="start-timer"
                onClick={startTimer}
                size="lg"
                className="w-32"
                aria-label="Start timer"
                title="Keyboard shortcut: Space"
              >
                <Play className="h-5 w-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                data-action="pause-timer"
                data-testid="pause-timer"
                onClick={pauseTimer}
                size="lg"
                className="w-32"
                variant="secondary"
                aria-label="Pause timer"
                title="Keyboard shortcut: Space"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}

            <Button
              data-action="reset-timer"
              data-testid="reset-timer"
              onClick={resetTimer}
              size="lg"
              variant="outline"
              className="w-32"
              aria-label="Reset timer"
              title="Keyboard shortcut: R"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>

            <Button
              onClick={toggleMute}
              size="icon"
              variant="ghost"
              aria-label={isMuted ? "Unmute" : "Mute"}
              title="Keyboard shortcut: M"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>

          {settings.accessibility?.keyboardShortcutsEnabled && (
            <div className="mt-6 text-xs text-muted-foreground">
              <p className="text-center mb-2">Keyboard Shortcuts</p>
              <div className="grid grid-cols-2 gap-2">
                <div>Space: Start/Pause</div>
                <div>R: Reset</div>
                <div>M: Mute/Unmute</div>
                <div>F: Focus mode</div>
                <div>S: Short break</div>
                <div>L: Long break</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedTransition>
  );
}
