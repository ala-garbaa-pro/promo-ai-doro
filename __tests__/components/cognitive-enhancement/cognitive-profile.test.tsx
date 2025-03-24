import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CognitiveProfile } from "@/components/cognitive-enhancement/cognitive-profile";
import { useSettings } from "@/lib/contexts/settings-context";

// Mock the hooks
jest.mock("@/lib/contexts/settings-context", () => ({
  useSettings: jest.fn(),
}));

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("CognitiveProfile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock settings
    (useSettings as jest.Mock).mockReturnValue({
      settings: {
        timer: {
          earlyBirdMode: false,
          nightOwlMode: false,
          adaptiveScheduling: true,
          cognitiveLoadOptimization: true,
          contextSwitchingMinimization: true,
        },
      },
      updateTimerSettings: jest.fn(),
    });
  });

  it("renders the cognitive profile component", () => {
    render(<CognitiveProfile />);

    // Check if component title is rendered
    expect(screen.getByText(/cognitive profile/i)).toBeInTheDocument();

    // Check if chronotype selector is rendered
    expect(screen.getByText(/chronotype/i)).toBeInTheDocument();

    // Check if energy level slider is rendered
    expect(screen.getByText(/energy level/i)).toBeInTheDocument();

    // Check if focus capacity slider is rendered
    expect(screen.getByText(/focus capacity/i)).toBeInTheDocument();
  });

  it("updates chronotype when selected", async () => {
    const mockUpdateTimerSettings = jest.fn();
    (useSettings as jest.Mock).mockReturnValue({
      settings: {
        timer: {
          earlyBirdMode: false,
          nightOwlMode: false,
          adaptiveScheduling: true,
          cognitiveLoadOptimization: true,
          contextSwitchingMinimization: true,
        },
      },
      updateTimerSettings: mockUpdateTimerSettings,
    });

    render(<CognitiveProfile />);

    // Find and click the chronotype selector
    const chronotypeSelector = screen.getByRole("combobox", {
      name: /chronotype/i,
    });
    fireEvent.click(chronotypeSelector);

    // Select "Early Bird"
    const earlyBirdOption = screen.getByText(/early bird/i);
    fireEvent.click(earlyBirdOption);

    // Check if updateTimerSettings was called with correct arguments
    await waitFor(() => {
      expect(mockUpdateTimerSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          earlyBirdMode: true,
          nightOwlMode: false,
        })
      );
    });
  });

  it("updates energy level when slider is moved", async () => {
    const mockUpdateTimerSettings = jest.fn();
    (useSettings as jest.Mock).mockReturnValue({
      settings: {
        timer: {
          earlyBirdMode: false,
          nightOwlMode: false,
          adaptiveScheduling: true,
          cognitiveLoadOptimization: true,
          contextSwitchingMinimization: true,
        },
      },
      updateTimerSettings: mockUpdateTimerSettings,
    });

    render(<CognitiveProfile />);

    // Find the energy level slider
    const energySlider = screen.getByRole("slider", { name: /energy level/i });

    // Move the slider
    fireEvent.change(energySlider, { target: { value: 80 } });

    // Check if updateTimerSettings was called
    await waitFor(() => {
      expect(mockUpdateTimerSettings).toHaveBeenCalled();
    });
  });

  it("updates focus capacity when slider is moved", async () => {
    const mockUpdateTimerSettings = jest.fn();
    (useSettings as jest.Mock).mockReturnValue({
      settings: {
        timer: {
          earlyBirdMode: false,
          nightOwlMode: false,
          adaptiveScheduling: true,
          cognitiveLoadOptimization: true,
          contextSwitchingMinimization: true,
        },
      },
      updateTimerSettings: mockUpdateTimerSettings,
    });

    render(<CognitiveProfile />);

    // Find the focus capacity slider
    const focusSlider = screen.getByRole("slider", { name: /focus capacity/i });

    // Move the slider
    fireEvent.change(focusSlider, { target: { value: 70 } });

    // Check if updateTimerSettings was called
    await waitFor(() => {
      expect(mockUpdateTimerSettings).toHaveBeenCalled();
    });
  });

  it("toggles adaptive scheduling when switch is clicked", async () => {
    const mockUpdateTimerSettings = jest.fn();
    (useSettings as jest.Mock).mockReturnValue({
      settings: {
        timer: {
          earlyBirdMode: false,
          nightOwlMode: false,
          adaptiveScheduling: true,
          cognitiveLoadOptimization: true,
          contextSwitchingMinimization: true,
        },
      },
      updateTimerSettings: mockUpdateTimerSettings,
    });

    render(<CognitiveProfile />);

    // Find and click the adaptive scheduling switch
    const adaptiveSwitch = screen.getByRole("switch", {
      name: /adaptive scheduling/i,
    });
    fireEvent.click(adaptiveSwitch);

    // Check if updateTimerSettings was called with correct arguments
    await waitFor(() => {
      expect(mockUpdateTimerSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          adaptiveScheduling: false,
        })
      );
    });
  });

  it("saves profile when save button is clicked", async () => {
    const mockUpdateTimerSettings = jest.fn();
    (useSettings as jest.Mock).mockReturnValue({
      settings: {
        timer: {
          earlyBirdMode: false,
          nightOwlMode: false,
          adaptiveScheduling: true,
          cognitiveLoadOptimization: true,
          contextSwitchingMinimization: true,
        },
      },
      updateTimerSettings: mockUpdateTimerSettings,
    });

    render(<CognitiveProfile />);

    // Find and click the save button
    const saveButton = screen.getByRole("button", { name: /save profile/i });
    fireEvent.click(saveButton);

    // Check if updateTimerSettings was called
    await waitFor(() => {
      expect(mockUpdateTimerSettings).toHaveBeenCalled();
    });
  });

  it("resets profile when reset button is clicked", async () => {
    const mockUpdateTimerSettings = jest.fn();
    (useSettings as jest.Mock).mockReturnValue({
      settings: {
        timer: {
          earlyBirdMode: true,
          nightOwlMode: false,
          adaptiveScheduling: false,
          cognitiveLoadOptimization: false,
          contextSwitchingMinimization: false,
        },
      },
      updateTimerSettings: mockUpdateTimerSettings,
    });

    render(<CognitiveProfile />);

    // Find and click the reset button
    const resetButton = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetButton);

    // Check if updateTimerSettings was called with default values
    await waitFor(() => {
      expect(mockUpdateTimerSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          earlyBirdMode: false,
          nightOwlMode: false,
          adaptiveScheduling: true,
          cognitiveLoadOptimization: true,
          contextSwitchingMinimization: true,
        })
      );
    });
  });
});
