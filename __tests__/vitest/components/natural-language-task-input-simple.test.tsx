import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";

// Mock the useToast hook
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the parseNaturalLanguageTask function
vi.mock("@/lib/utils/natural-language-parser", () => ({
  parseNaturalLanguageTask: (input: string) => ({
    title: input,
    priority: input.includes("#high") ? "high" : undefined,
    tags: input.includes("#") ? ["tag"] : undefined,
  }),
  generateTaskDescription: vi.fn(),
  ParsedTaskData: vi.fn(),
}));

// Mock SpeechRecognition by mocking the entire component
vi.mock(
  "@/components/tasks/natural-language-task-input",
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
    };
  }
);

describe("NaturalLanguageTaskInput Component (Simple)", () => {
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
});
