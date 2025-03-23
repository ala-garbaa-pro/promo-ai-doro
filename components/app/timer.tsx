"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/components/app/settings-provider";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { AnimatedTransition } from "@/components/ui/animated-transition";

type TimerMode = "pomodoro" | "short-break" | "long-break";

export function Timer() {
  const { settings } = useSettings();
  const { toast } = useToast();

  // Timer state
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

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
        duration = settings.pomodoroMinutes * 60;
        break;
      case "short-break":
        duration = settings.shortBreakMinutes * 60;
        break;
      case "long-break":
        duration = settings.longBreakMinutes * 60;
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
  const startTimer = () => {
    if (isRunning) return;

    setIsRunning(true);

    // Play start sound
    if (startSoundRef.current && !isMuted) {
      startSoundRef.current
        .play()
        .catch((err) => console.error("Error playing sound:", err));
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        // Play tick sound every second if enabled
        if (settings.tickSound && tickSoundRef.current && !isMuted) {
          tickSoundRef.current
            .play()
            .catch((err) => console.error("Error playing sound:", err));
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

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset timer
  const resetTimer = () => {
    pauseTimer();

    let duration = 0;
    switch (mode) {
      case "pomodoro":
        duration = settings.pomodoroMinutes * 60;
        break;
      case "short-break":
        duration = settings.shortBreakMinutes * 60;
        break;
      case "long-break":
        duration = settings.longBreakMinutes * 60;
        break;
    }

    setTimeLeft(duration);
    updateDocumentTitle(duration);
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    // Play end sound
    if (endSoundRef.current && !isMuted) {
      endSoundRef.current
        .play()
        .catch((err) => console.error("Error playing sound:", err));
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
      if (newCompletedCount % settings.longBreakInterval === 0) {
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
        totalSeconds = settings.pomodoroMinutes * 60;
        break;
      case "short-break":
        totalSeconds = settings.shortBreakMinutes * 60;
        break;
      case "long-break":
        totalSeconds = settings.longBreakMinutes * 60;
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
