import React, { useState, useEffect } from "react";

export function Timer() {
  const [mode, setMode] = useState<"pomodoro" | "short-break" | "long-break">(
    "pomodoro"
  );
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Update timeLeft when mode changes
  useEffect(() => {
    if (mode === "pomodoro") {
      setTimeLeft(25 * 60);
    } else if (mode === "short-break") {
      setTimeLeft(5 * 60);
    } else if (mode === "long-break") {
      setTimeLeft(15 * 60);
    }
  }, [mode]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(
      mode === "pomodoro" ? 25 * 60 : mode === "short-break" ? 5 * 60 : 15 * 60
    );
  };

  return (
    <div data-testid="timer-component">
      <div className="flex justify-center space-x-2 mb-6">
        <button
          onClick={() => setMode("pomodoro")}
          className={mode === "pomodoro" ? "active" : ""}
        >
          Focus
        </button>
        <button
          onClick={() => setMode("short-break")}
          className={mode === "short-break" ? "active" : ""}
        >
          Short Break
        </button>
        <button
          onClick={() => setMode("long-break")}
          className={mode === "long-break" ? "active" : ""}
        >
          Long Break
        </button>
      </div>

      <div data-testid="timer-display">{formatTime(timeLeft)}</div>

      <div className="flex justify-center space-x-4">
        {!isRunning ? (
          <button data-testid="start-button" onClick={startTimer}>
            Start
          </button>
        ) : (
          <button data-testid="pause-button" onClick={pauseTimer}>
            Pause
          </button>
        )}

        <button data-testid="reset-button" onClick={resetTimer}>
          Reset
        </button>

        <button data-testid="mute-button">{/* Mute/Unmute */}</button>
      </div>
    </div>
  );
}
