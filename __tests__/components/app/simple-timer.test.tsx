/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";

// Simple component for testing
const SimpleTimer = () => (
  <div data-testid="timer">
    <h1>Timer</h1>
    <div>25:00</div>
    <button>Start</button>
  </div>
);

describe("Simple Timer", () => {
  it("renders correctly", () => {
    render(<SimpleTimer />);
    const timerElement = screen.getByTestId("timer");
    expect(timerElement).toBeTruthy();
  });
});
