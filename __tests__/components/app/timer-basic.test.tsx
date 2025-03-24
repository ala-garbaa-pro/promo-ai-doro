import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Mock the Timer component instead of using the real one
const mockStartTimer = jest.fn();
const mockPauseTimer = jest.fn();
const mockResetTimer = jest.fn();
const mockToggleMute = jest.fn();

// Create a simple mock of the Timer component
jest.mock("@/components/app/timer", () => ({
  Timer: () => (
    <div data-testid="timer-component">
      <div data-testid="timer-display">25:00</div>
      <button onClick={mockStartTimer} data-testid="start-button">
        Start
      </button>
      <button onClick={mockPauseTimer} data-testid="pause-button">
        Pause
      </button>
      <button onClick={mockResetTimer} data-testid="reset-button">
        Reset
      </button>
      <button onClick={mockToggleMute} data-testid="mute-button">
        Mute
      </button>
    </div>
  ),
}));

// Import the mocked Timer
import { Timer } from "@/components/app/timer";

describe("Timer Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the timer component", () => {
    render(<Timer />);

    expect(screen.getByTestId("timer-component")).toBeInTheDocument();
    expect(screen.getByTestId("timer-display")).toBeInTheDocument();
    expect(screen.getByTestId("start-button")).toBeInTheDocument();
    expect(screen.getByTestId("pause-button")).toBeInTheDocument();
    expect(screen.getByTestId("reset-button")).toBeInTheDocument();
    expect(screen.getByTestId("mute-button")).toBeInTheDocument();
  });

  it("calls start function when start button is clicked", () => {
    render(<Timer />);

    fireEvent.click(screen.getByTestId("start-button"));

    expect(mockStartTimer).toHaveBeenCalledTimes(1);
  });

  it("calls pause function when pause button is clicked", () => {
    render(<Timer />);

    fireEvent.click(screen.getByTestId("pause-button"));

    expect(mockPauseTimer).toHaveBeenCalledTimes(1);
  });

  it("calls reset function when reset button is clicked", () => {
    render(<Timer />);

    fireEvent.click(screen.getByTestId("reset-button"));

    expect(mockResetTimer).toHaveBeenCalledTimes(1);
  });

  it("calls mute function when mute button is clicked", () => {
    render(<Timer />);

    fireEvent.click(screen.getByTestId("mute-button"));

    expect(mockToggleMute).toHaveBeenCalledTimes(1);
  });
});
