import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";
import { ParsedTaskData } from "@/lib/utils/natural-language-parser";

// Mock the useToast hook
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the window.SpeechRecognition and window.webkitSpeechRecognition
// We need to mock the component's internal usage of these APIs
vi.mock(
  "@/components/tasks/natural-language-task-input",
  async (importOriginal) => {
    const module = await importOriginal();
    return {
      ...module,
      // Override the NaturalLanguageTaskInput component to mock SpeechRecognition
      NaturalLanguageTaskInput: module.NaturalLanguageTaskInput,
    };
  }
);

describe("NaturalLanguageTaskInput Component", () => {
  const onTaskCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the input field with default placeholder", () => {
    render(<NaturalLanguageTaskInput onTaskCreate={onTaskCreate} />);

    const inputElement = screen.getByPlaceholderText(/Add a task/i);
    expect(inputElement).toBeInTheDocument();
  });

  it("renders the input field with custom placeholder", () => {
    const customPlaceholder = "Enter your task here";
    render(
      <NaturalLanguageTaskInput
        onTaskCreate={onTaskCreate}
        placeholder={customPlaceholder}
      />
    );

    const inputElement = screen.getByPlaceholderText(customPlaceholder);
    expect(inputElement).toBeInTheDocument();
  });

  it("updates input value when typing", () => {
    render(<NaturalLanguageTaskInput onTaskCreate={onTaskCreate} />);

    const inputElement = screen.getByPlaceholderText(/Add a task/i);
    fireEvent.change(inputElement, { target: { value: "New task" } });

    expect(inputElement).toHaveValue("New task");
  });

  it("shows task preview when input is not empty", async () => {
    render(<NaturalLanguageTaskInput onTaskCreate={onTaskCreate} />);

    const inputElement = screen.getByPlaceholderText(/Add a task/i);
    fireEvent.change(inputElement, {
      target: { value: "Complete project report" },
    });

    await waitFor(() => {
      expect(screen.getByText("Task Preview:")).toBeInTheDocument();
      expect(screen.getByText("Complete project report")).toBeInTheDocument();
    });
  });

  it("calls onTaskCreate when Add Task button is clicked", async () => {
    render(<NaturalLanguageTaskInput onTaskCreate={onTaskCreate} />);

    const inputElement = screen.getByPlaceholderText(/Add a task/i);
    fireEvent.change(inputElement, {
      target: { value: "Complete project report" },
    });

    const addButton = screen.getByText("Add Task");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(onTaskCreate).toHaveBeenCalledTimes(1);
      expect(onTaskCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Complete project report",
        })
      );
    });

    // Input should be cleared after submission
    expect(inputElement).toHaveValue("");
  });

  it("calls onTaskCreate when Enter key is pressed", async () => {
    render(<NaturalLanguageTaskInput onTaskCreate={onTaskCreate} />);

    const inputElement = screen.getByPlaceholderText(/Add a task/i);
    fireEvent.change(inputElement, {
      target: { value: "Complete project report" },
    });
    fireEvent.keyDown(inputElement, { key: "Enter" });

    await waitFor(() => {
      expect(onTaskCreate).toHaveBeenCalledTimes(1);
      expect(onTaskCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Complete project report",
        })
      );
    });

    // Input should be cleared after submission
    expect(inputElement).toHaveValue("");
  });

  it("parses task with priority", async () => {
    render(<NaturalLanguageTaskInput onTaskCreate={onTaskCreate} />);

    const inputElement = screen.getByPlaceholderText(/Add a task/i);
    fireEvent.change(inputElement, {
      target: { value: "Complete project report #high" },
    });

    await waitFor(() => {
      expect(screen.getByText("high priority")).toBeInTheDocument();
    });
  });

  it("clears input when reset button is clicked", async () => {
    render(<NaturalLanguageTaskInput onTaskCreate={onTaskCreate} />);

    const inputElement = screen.getByPlaceholderText(/Add a task/i);
    fireEvent.change(inputElement, {
      target: { value: "Complete project report" },
    });

    // Wait for the reset button to appear
    await waitFor(() => {
      const resetButton = screen.getByTitle("Clear input");
      fireEvent.click(resetButton);
    });

    // Input should be cleared
    expect(inputElement).toHaveValue("");
  });

  it("disables Add Task button when input is empty", () => {
    render(<NaturalLanguageTaskInput onTaskCreate={onTaskCreate} />);

    const addButton = screen.getByText("Add Task");
    expect(addButton).toBeDisabled();

    const inputElement = screen.getByPlaceholderText(/Add a task/i);
    fireEvent.change(inputElement, {
      target: { value: "Complete project report" },
    });

    expect(addButton).not.toBeDisabled();
  });
});
