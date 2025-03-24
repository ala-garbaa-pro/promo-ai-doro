import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";
import { ParsedTaskData } from "@/lib/utils/natural-language-parser";

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("NaturalLanguageTaskInput", () => {
  const mockOnTaskCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the input field with placeholder", () => {
    render(
      <NaturalLanguageTaskInput
        onTaskCreate={mockOnTaskCreate}
        placeholder="Test placeholder"
      />
    );

    expect(screen.getByPlaceholderText("Test placeholder")).toBeInTheDocument();
  });

  it("parses input and shows preview when typing", async () => {
    render(
      <NaturalLanguageTaskInput
        onTaskCreate={mockOnTaskCreate}
        placeholder="Test placeholder"
      />
    );

    const input = screen.getByPlaceholderText("Test placeholder");
    fireEvent.change(input, {
      target: { value: "Call John tomorrow #important" },
    });

    // Wait for the preview to appear
    await waitFor(() => {
      expect(screen.getByText(/Task Preview:/i)).toBeInTheDocument();
    });

    // Check that the parsed task is displayed correctly
    expect(screen.getByText("Call John")).toBeInTheDocument();
    // Check for tags instead of specific date text which might vary
    expect(screen.getByText("important")).toBeInTheDocument();
  });

  it("submits the task when clicking the Add Task button", async () => {
    render(
      <NaturalLanguageTaskInput
        onTaskCreate={mockOnTaskCreate}
        placeholder="Test placeholder"
      />
    );

    const input = screen.getByPlaceholderText("Test placeholder");
    fireEvent.change(input, {
      target: { value: "Call John tomorrow #important" },
    });

    // Wait for the preview to appear
    await waitFor(() => {
      expect(screen.getByText(/Task Preview:/i)).toBeInTheDocument();
    });

    // Click the Add Task button
    const addButton = screen.getByText("Add Task");
    fireEvent.click(addButton);

    // Check that onTaskCreate was called with the correct data
    expect(mockOnTaskCreate).toHaveBeenCalledTimes(1);
    const calledWith = mockOnTaskCreate.mock.calls[0][0] as ParsedTaskData;
    expect(calledWith.title).toBe("Call John");
    expect(calledWith.priority).toBe("high");
    expect(calledWith.dueDate).toBeDefined();
  });

  it("submits the task when pressing Enter", async () => {
    render(
      <NaturalLanguageTaskInput
        onTaskCreate={mockOnTaskCreate}
        placeholder="Test placeholder"
      />
    );

    const input = screen.getByPlaceholderText("Test placeholder");
    fireEvent.change(input, {
      target: { value: "Call John tomorrow #important" },
    });

    // Wait for the preview to appear
    await waitFor(() => {
      expect(screen.getByText(/Task Preview:/i)).toBeInTheDocument();
    });

    // Press Enter
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Check that onTaskCreate was called with the correct data
    expect(mockOnTaskCreate).toHaveBeenCalledTimes(1);
    const calledWith = mockOnTaskCreate.mock.calls[0][0] as ParsedTaskData;
    expect(calledWith.title).toBe("Call John");
    expect(calledWith.priority).toBe("high");
    expect(calledWith.dueDate).toBeDefined();
  });

  it("resets the input after submitting", async () => {
    render(
      <NaturalLanguageTaskInput
        onTaskCreate={mockOnTaskCreate}
        placeholder="Test placeholder"
      />
    );

    const input = screen.getByPlaceholderText("Test placeholder");
    fireEvent.change(input, {
      target: { value: "Call John tomorrow #important" },
    });

    // Wait for the preview to appear
    await waitFor(() => {
      expect(screen.getByText(/Task Preview:/i)).toBeInTheDocument();
    });

    // Click the Add Task button
    const addButton = screen.getByText("Add Task");
    fireEvent.click(addButton);

    // Check that the input was reset
    expect(input).toHaveValue("");

    // Check that the preview is no longer shown
    await waitFor(() => {
      expect(screen.queryByText(/Task Preview:/i)).not.toBeInTheDocument();
    });
  });

  it("responds to custom events for template selection", async () => {
    render(
      <NaturalLanguageTaskInput
        onTaskCreate={mockOnTaskCreate}
        placeholder="Test placeholder"
      />
    );

    // Dispatch a custom event to simulate template selection
    const event = new CustomEvent("set-task-input", {
      detail: { text: "Weekly meeting every Monday at 10am #work" },
    });
    document.dispatchEvent(event);

    // Wait for the preview to appear
    await waitFor(() => {
      expect(screen.getByText(/Task Preview:/i)).toBeInTheDocument();
    });

    // Check that the input was updated
    const input = screen.getByPlaceholderText("Test placeholder");
    expect(input).toHaveValue("Weekly meeting every Monday at 10am #work");

    // Check that the parsed task is displayed correctly
    expect(screen.getByText("Weekly meeting")).toBeInTheDocument();
    // Check for tags and recurring indicator
    expect(screen.getByText("work")).toBeInTheDocument();
    expect(screen.getByText(/Recurring/)).toBeInTheDocument();
  });
});
