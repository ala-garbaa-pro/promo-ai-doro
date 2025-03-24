import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Timer } from "@/__tests__/__mocks__/timer";

describe("Timer Component", () => {
  it("renders the timer component", () => {
    render(<Timer />);

    expect(screen.getByTestId("timer-component")).toBeInTheDocument();
    expect(screen.getByTestId("timer-display")).toBeInTheDocument();
    expect(screen.getByTestId("start-button")).toBeInTheDocument();
    expect(screen.getByTestId("reset-button")).toBeInTheDocument();
    expect(screen.getByTestId("mute-button")).toBeInTheDocument();
  });

  it("displays the correct initial time", () => {
    render(<Timer />);
    expect(screen.getByTestId("timer-display").textContent).toBe("25:00");
  });

  it("changes mode when clicking mode buttons", () => {
    render(<Timer />);

    // Initially in Pomodoro mode (25:00)
    expect(screen.getByTestId("timer-display").textContent).toBe("25:00");

    // Click on Short Break
    fireEvent.click(screen.getByText("Short Break"));

    // Should now show 5:00
    expect(screen.getByTestId("timer-display").textContent).toBe("05:00");

    // Click on Long Break
    fireEvent.click(screen.getByText("Long Break"));

    // Should now show 15:00
    expect(screen.getByTestId("timer-display").textContent).toBe("15:00");

    // Back to Pomodoro
    fireEvent.click(screen.getByText("Focus"));

    // Should show 25:00 again
    expect(screen.getByTestId("timer-display").textContent).toBe("25:00");
  });

  it("changes button state when starting and pausing", () => {
    render(<Timer />);

    // Initially has Start button
    expect(screen.getByTestId("start-button")).toBeInTheDocument();
    expect(screen.queryByTestId("pause-button")).not.toBeInTheDocument();

    // Click Start
    fireEvent.click(screen.getByTestId("start-button"));

    // Now should have Pause button
    expect(screen.queryByTestId("start-button")).not.toBeInTheDocument();
    expect(screen.getByTestId("pause-button")).toBeInTheDocument();

    // Click Pause
    fireEvent.click(screen.getByTestId("pause-button"));

    // Back to Start button
    expect(screen.getByTestId("start-button")).toBeInTheDocument();
    expect(screen.queryByTestId("pause-button")).not.toBeInTheDocument();
  });
});
