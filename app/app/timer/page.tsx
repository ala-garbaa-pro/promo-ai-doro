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
} from "lucide-react";
import { useSettings } from "@/lib/contexts/settings-context";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  requestNotificationPermission,
  showNotification,
  playSound,
} from "@/lib/utils/notifications";

// Timer modes
type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

// Get timer durations from settings
const getTimerDurations = (settings: any) => ({
  pomodoro: settings.timer.pomodoroDuration * 60,
  shortBreak: settings.timer.shortBreakDuration * 60,
  longBreak: settings.timer.longBreakDuration * 60,
});

export default function TimerPage() {
  const { settings } = useSettings();
  const { toast } = useToast();
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
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            clearInterval(timerRef.current!);
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
                    ? "Pomodoro completed! Time for a break."
                    : "Break completed! Ready to focus again?",
                icon: "/favicon.ico",
              });
            }

            // Update completed pomodoros count
            if (mode === "pomodoro") {
              setCompletedPomodoros((prev) => prev + 1);

              // Auto-start break if enabled in settings
              if (settings.timer.autoStartBreaks) {
                // After 4 pomodoros (or the configured interval), take a long break
                if (
                  (completedPomodoros + 1) %
                    settings.timer.longBreakInterval ===
                  0
                ) {
                  setMode("longBreak");
                } else {
                  setMode("shortBreak");
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
              // Auto-start the pomodoro timer
              setTimeout(() => setIsRunning(true), 500);
            }

            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isMuted, mode]);

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
    setIsRunning((prev) => !prev);
  };

  // Handle reset
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerDurations[mode]);
  };

  // Handle skip
  const skipTimer = () => {
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
  };

  // Toggle sound
  const toggleSound = () => {
    setIsMuted((prev) => !prev);
    toast({
      title: isMuted ? "Sound Enabled" : "Sound Disabled",
      description: isMuted
        ? "You will now hear notifications when timers end."
        : "You will no longer hear notifications when timers end.",
    });
  };

  // Get background color based on mode
  const getBgColor = () => {
    switch (mode) {
      case "pomodoro":
        return "from-red-600 to-red-700";
      case "shortBreak":
        return "from-green-600 to-green-700";
      case "longBreak":
        return "from-blue-600 to-blue-700";
    }
  };

  return (
    <div className="container mx-auto p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Pomodoro Timer
        </h1>

        <Tabs
          defaultValue="pomodoro"
          value={mode}
          onValueChange={(value) => setMode(value as TimerMode)}
          className="w-full mb-8"
        >
          <TabsList className="grid grid-cols-3 w-full bg-gray-800">
            <TabsTrigger
              value="pomodoro"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Pomodoro
            </TabsTrigger>
            <TabsTrigger
              value="shortBreak"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              Short Break
            </TabsTrigger>
            <TabsTrigger
              value="longBreak"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Long Break
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pomodoro" className="mt-0">
            <TimerCard
              timeLeft={timeLeft}
              formatTime={formatTime}
              progressPercentage={progressPercentage}
              isRunning={isRunning}
              bgColor={getBgColor()}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
              skipTimer={skipTimer}
              toggleSound={toggleSound}
              isMuted={isMuted}
            />
          </TabsContent>

          <TabsContent value="shortBreak" className="mt-0">
            <TimerCard
              timeLeft={timeLeft}
              formatTime={formatTime}
              progressPercentage={progressPercentage}
              isRunning={isRunning}
              bgColor={getBgColor()}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
              skipTimer={skipTimer}
              toggleSound={toggleSound}
              isMuted={isMuted}
            />
          </TabsContent>

          <TabsContent value="longBreak" className="mt-0">
            <TimerCard
              timeLeft={timeLeft}
              formatTime={formatTime}
              progressPercentage={progressPercentage}
              isRunning={isRunning}
              bgColor={getBgColor()}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
              skipTimer={skipTimer}
              toggleSound={toggleSound}
              isMuted={isMuted}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mb-8">
          <div className="text-gray-400">
            <span className="text-white font-medium">{completedPomodoros}</span>{" "}
            pomodoros completed today
          </div>
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

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Current Task</h2>

            {/* Empty state */}
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No task selected</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Select a Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Timer Card Component
interface TimerCardProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
  progressPercentage: number;
  isRunning: boolean;
  bgColor: string;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  toggleSound: () => void;
  isMuted: boolean;
}

function TimerCard({
  timeLeft,
  formatTime,
  progressPercentage,
  isRunning,
  bgColor,
  toggleTimer,
  resetTimer,
  skipTimer,
  toggleSound,
  isMuted,
}: TimerCardProps) {
  return (
    <Card className={`border-0 shadow-lg overflow-hidden relative`}>
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${bgColor} transition-all duration-1000`}
        style={{ width: `${progressPercentage}%` }}
      />

      <CardContent className="p-0">
        <div className="bg-gray-800 p-8 flex flex-col items-center">
          {/* Timer display */}
          <div className="text-7xl font-bold text-white mb-8 font-mono tracking-wider">
            {formatTime(timeLeft)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleTimer}
              size="lg"
              className={`h-14 w-14 rounded-full ${
                isRunning
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white`}
            >
              {isRunning ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
              <span className="sr-only">{isRunning ? "Pause" : "Start"}</span>
            </Button>

            <Button
              onClick={resetTimer}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Reset</span>
            </Button>

            <Button
              onClick={skipTimer}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <SkipForward className="h-4 w-4" />
              <span className="sr-only">Skip</span>
            </Button>

            <Button
              onClick={toggleSound}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
