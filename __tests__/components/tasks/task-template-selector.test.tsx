import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskTemplateSelector } from "@/components/tasks/task-template-selector";
import { useTaskTemplates } from "@/hooks/use-task-templates";

// Mock the hooks
jest.mock("@/hooks/use-task-templates", () => ({
  useTaskTemplates: jest.fn(),
}));

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  toast: jest.fn(),
}));

describe("TaskTemplateSelector", () => {
  const mockOnSelectTemplate = jest.fn();

  const mockTemplates = [
    {
      id: "1",
      name: "Daily Standup",
      description: "Template for daily standup meetings",
      taskText: "Daily standup meeting at 9am #work @meetings",
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Weekly Report",
      description: "Template for weekly reports",
      taskText: "Prepare weekly report every Friday at 3pm p1 #work",
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the useTaskTemplates hook
    (useTaskTemplates as jest.Mock).mockReturnValue({
      templates: mockTemplates,
      isLoading: false,
      error: null,
      createTemplate: jest.fn().mockResolvedValue({}),
      updateTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
    });
  });

  it("renders the template selector button", () => {
    render(<TaskTemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    const button = screen.getByRole("button", { name: /select template/i });
    expect(button).toBeInTheDocument();
  });

  it("shows templates when clicked", async () => {
    render(<TaskTemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    // Click the button to open the popover
    const button = screen.getByRole("button", { name: /select template/i });
    fireEvent.click(button);

    // Check if templates are displayed
    await waitFor(() => {
      expect(screen.getByText("Daily Standup")).toBeInTheDocument();
      expect(screen.getByText("Weekly Report")).toBeInTheDocument();
    });
  });

  it("calls onSelectTemplate when a template is selected", async () => {
    render(<TaskTemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    // Click the button to open the popover
    const button = screen.getByRole("button", { name: /select template/i });
    fireEvent.click(button);

    // Click on a template
    await waitFor(() => {
      const templateItem = screen.getByText("Daily Standup");
      fireEvent.click(templateItem);
    });

    // Check if onSelectTemplate was called with the correct template text
    expect(mockOnSelectTemplate).toHaveBeenCalledWith(
      "Daily standup meeting at 9am #work @meetings"
    );
  });

  it("shows loading state when templates are loading", async () => {
    // Mock loading state
    (useTaskTemplates as jest.Mock).mockReturnValue({
      templates: [],
      isLoading: true,
      error: null,
      createTemplate: jest.fn(),
      updateTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
    });

    render(<TaskTemplateSelector onSelectTemplate={mockOnSelectTemplate} />);

    // Click the button to open the popover
    const button = screen.getByRole("button", { name: /select template/i });
    fireEvent.click(button);

    // Check if loading state is displayed
    await waitFor(() => {
      expect(screen.getByText("Loading templates...")).toBeInTheDocument();
    });
  });
});
