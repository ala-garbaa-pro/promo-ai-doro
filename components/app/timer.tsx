"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/lib/contexts/settings-context";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { AnimatedTransition } from "@/components/ui/animated-transition";
import { useSessionRecording } from "@/hooks/use-session-recording";

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
    if (!startSoundRef.current) {
      startSoundRef.current = new Audio("/sounds/start.mp3");
    }

    if (!endSoundRef.current) {
      endSoundRef.current = new Audio("/sounds/complete.mp3");
    }

    if (!tickSoundRef.current) {
      tickSoundRef.current = new Audio("/sounds/tick.mp3");
    }

    // Set volume based on mute state
    startSoundRef.current.volume = isMuted ? 0 : 0.5;
    endSoundRef.current.volume = isMuted ? 0 : 0.5;
    tickSoundRef.current.volume = isMuted ? 0 : 0.2;

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
        startSoundRef.current
          .play()
          .catch((err) => console.error("Error playing sound:", err));
      } catch (error) {
        console.error("Error playing start sound:", error);
      }
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        // Play tick sound every second if enabled
        if (settings.tickSound && tickSoundRef.current && !isMuted) {
          try {
            tickSoundRef.current
              .play()
              .catch((err) => console.error("Error playing sound:", err));
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
        endSoundRef.current
          .play()
          .catch((err) => console.error("Error playing sound:", err));
      } catch (error) {
        console.error("Error playing end sound:", error);
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
            >
              Focus
            </Button>
            <Button
              variant={mode === "short-break" ? "default" : "outline"}
              onClick={() => setMode("short-break")}
              className="flex-1"
            >
              Short Break
            </Button>
            <Button
              variant={mode === "long-break" ? "default" : "outline"}
              onClick={() => setMode("long-break")}
              className="flex-1"
            >
              Long Break
            </Button>
          </div>

          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-muted-foreground">
              {mode === "pomodoro"
                ? "Focus on your task"
                : mode === "short-break"
                ? "Take a short break"
                : "Take a long break"}
            </div>
          </div>

          <Progress value={calculateProgress()} className="mb-6" />

          <div className="flex justify-center space-x-4">
            {!isRunning ? (
              <Button
                data-action="start-timer"
                data-testid="start-timer"
                onClick={startTimer}
                size="lg"
                className="w-32"
              >
                <Play className="h-5 w-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                data-action="pause-timer"
                data-testid="start-timer"
                onClick={pauseTimer}
                size="lg"
                className="w-32"
                variant="secondary"
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
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>

            <Button onClick={toggleMute} size="icon" variant="ghost">
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            Completed: {completedPomodoros} pomodoros
          </div>
        </CardContent>
      </Card>
    </AnimatedTransition>
  );
}
