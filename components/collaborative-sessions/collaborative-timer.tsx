"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  SkipForward,
  Target,
  CheckCircle,
  Settings,
} from "lucide-react";

interface CollaborativeTimerProps {
  session: any;
  onStatusChange: (status: string) => Promise<void>;
  onSendGoal: (goal: string) => Promise<void>;
  onSendProgress: (progress: string) => Promise<void>;
}

export function CollaborativeTimer({
  session,
  onStatusChange,
  onSendGoal,
  onSendProgress,
}: CollaborativeTimerProps) {
  const [timeLeft, setTimeLeft] = useState(session.workDuration);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [goal, setGoal] = useState("");
  const [progress, setProgress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);

            // Play sound
            const audio = new Audio("/sounds/bell.mp3");
            audio.play().catch((e) => console.error("Error playing sound:", e));

            if (isBreak) {
              // Break is over, go back to work
              setIsBreak(false);
              setIsLongBreak(false);
              setIsActive(false);
              onStatusChange("joined");
              return session.workDuration;
            } else {
              // Work session is over
              setCompletedSessions((prev) => prev + 1);
              setIsBreak(true);
              setIsActive(false);
              onStatusChange("on_break");

              // Check if it's time for a long break
              const isTimeForLongBreak =
                (completedSessions + 1) % session.sessionsBeforeLongBreak === 0;
              setIsLongBreak(isTimeForLongBreak);

              return isTimeForLongBreak
                ? session.longBreakDuration
                : session.breakDuration;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isBreak, completedSessions, session, onStatusChange]);

  const toggleTimer = async () => {
    if (isActive) {
      setIsActive(false);
      await onStatusChange(isBreak ? "on_break" : "joined");
    } else {
      setIsActive(true);
      await onStatusChange(isBreak ? "on_break" : "active");
    }
  };

  const skipSession = () => {
    if (isBreak) {
      // Skip break
      setIsBreak(false);
      setIsLongBreak(false);
      setIsActive(false);
      setTimeLeft(session.workDuration);
      onStatusChange("joined");
    } else {
      // Skip work session
      setCompletedSessions((prev) => prev + 1);
      setIsBreak(true);
      setIsActive(false);

      // Check if it's time for a long break
      const isTimeForLongBreak =
        (completedSessions + 1) % session.sessionsBeforeLongBreak === 0;
      setIsLongBreak(isTimeForLongBreak);
      setTimeLeft(
        isTimeForLongBreak ? session.longBreakDuration : session.breakDuration
      );
      onStatusChange("on_break");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = () => {
    const total = isBreak
      ? isLongBreak
        ? session.longBreakDuration
        : session.breakDuration
      : session.workDuration;
    return ((total - timeLeft) / total) * 100;
  };

  const handleSubmitGoal = async () => {
    if (!goal.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await onSendGoal(goal);
      setGoal("");
      setGoalDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitProgress = async () => {
    if (!progress.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await onSendProgress(progress);
      setProgress("");
      setProgressDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Collaborative Timer</span>
          <Badge
            variant="outline"
            className={
              isBreak
                ? "bg-blue-500/10 text-blue-500"
                : "bg-green-500/10 text-green-500"
            }
          >
            {isBreak ? (isLongBreak ? "Long Break" : "Break") : "Focus"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Session {completedSessions + 1} of {session.sessionsBeforeLongBreak}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-6xl font-bold mb-4">{formatTime(timeLeft)}</div>
          <Progress value={getProgress()} className="w-full h-2" />
        </div>

        <div className="flex justify-center gap-2">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="gap-2 w-32"
            variant={isActive ? "destructive" : "default"}
          >
            {isActive ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={skipSession}
            variant="outline"
            size="icon"
            className="h-10 w-10"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex justify-center gap-2">
          <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Target className="h-4 w-4" />
                Share Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Goal</DialogTitle>
                <DialogDescription>
                  Let others know what you're working on during this session.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="goal">Your Goal</Label>
                  <Textarea
                    id="goal"
                    placeholder="What are you working on?"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSubmitGoal}
                  disabled={!goal.trim() || isSubmitting}
                >
                  {isSubmitting ? "Sharing..." : "Share Goal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={progressDialogOpen}
            onOpenChange={setProgressDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Share Progress
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Progress</DialogTitle>
                <DialogDescription>
                  Let others know what you've accomplished during this session.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="progress">Your Progress</Label>
                  <Textarea
                    id="progress"
                    placeholder="What have you accomplished?"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSubmitProgress}
                  disabled={!progress.trim() || isSubmitting}
                >
                  {isSubmitting ? "Sharing..." : "Share Progress"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </>
  );
}
