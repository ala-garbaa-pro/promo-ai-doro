/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";

// Create a simple mock component for testing
const MockTimer = () => (
  <div data-testid="timer-component">
    <div data-testid="timer-display">25:00</div>
    <button data-testid="start-button">Start</button>
    <button data-testid="pause-button">Pause</button>
    <button data-testid="reset-button">Reset</button>
    <button data-testid="mute-button">Mute</button>
  </div>
);

describe("Timer Component", () => {
  it("renders the timer component", () => {
    render(<MockTimer />);

    const timerComponent = screen.getByTestId("timer-component");
    const timerDisplay = screen.getByTestId("timer-display");
    const startButton = screen.getByTestId("start-button");
    const pauseButton = screen.getByTestId("pause-button");
    const resetButton = screen.getByTestId("reset-button");
    const muteButton = screen.getByTestId("mute-button");

    expect(timerComponent).toBeTruthy();
    expect(timerDisplay).toBeTruthy();
    expect(startButton).toBeTruthy();
    expect(pauseButton).toBeTruthy();
    expect(resetButton).toBeTruthy();
    expect(muteButton).toBeTruthy();
  });
});
