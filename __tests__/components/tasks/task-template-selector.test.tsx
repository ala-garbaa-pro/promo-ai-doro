import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { TaskTemplateSelector } from "../../../components/tasks/task-template-selector";
import { useTaskTemplates } from "../../../hooks/use-task-templates";

// Mock the @radix-ui/react-popover module
jest.mock("@radix-ui/react-popover");

// Mock the @radix-ui/react-dialog module
jest.mock("@radix-ui/react-dialog");

// Mock the cmdk module
jest.mock("cmdk");

// Mock the lucide-react icons
jest.mock("lucide-react", () => ({
  Template: () => <div data-testid="template-icon">Template</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  X: () => <div data-testid="x-icon">X</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  Save: () => <div data-testid="save-icon">Save</div>,
  Loader2: () => <div data-testid="loader-icon">Loading...</div>,
}));

// Mock the popover component
jest.mock("../../../components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

// Mock the command component
jest.mock("../../../components/ui/command", () => ({
  Command: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command">{children}</div>
  ),
  CommandInput: React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
  >((props, ref) => <input ref={ref} data-testid="command-input" {...props} />),
  CommandList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-list">{children}</div>
  ),
  CommandEmpty: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-empty">{children}</div>
  ),
  CommandGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-group">{children}</div>
  ),
  CommandItem: ({
    children,
    onSelect,
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
  }) => (
    <div data-testid="command-item" onClick={onSelect}>
      {children}
    </div>
  ),
  CommandSeparator: () => <hr data-testid="command-separator" />,
}));

// Mock the dialog component
jest.mock("../../../components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="dialog-trigger">{children}</button>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
}));

// Mock the textarea component
jest.mock("../../../components/ui/textarea", () => ({
  Textarea: React.forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
  >((props, ref) => <textarea ref={ref} data-testid="textarea" {...props} />),
}));

// Mock the hooks
jest.mock("../../../hooks/use-task-templates", () => ({
  useTaskTemplates: jest.fn(),
}));

// Mock the toast component
jest.mock("../../../components/ui/use-toast", () => ({
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

  it("renders the template selector button", async () => {
    await act(async () => {
      render(<TaskTemplateSelector onSelectTemplate={mockOnSelectTemplate} />);
    });

    await waitFor(() => {
      const button = screen.getByTestId("popover-trigger");
      expect(button).toBeInTheDocument();
    });
  });

  it("shows templates when clicked", async () => {
    await act(async () => {
      render(<TaskTemplateSelector onSelectTemplate={mockOnSelectTemplate} />);
    });

    // Click the button to open the popover
    const button = await screen.findByTestId("popover-trigger");

    await act(async () => {
      fireEvent.click(button);
    });

    // Check if templates are displayed
    await waitFor(() => {
      expect(screen.getByText("Daily Standup")).toBeInTheDocument();
      expect(screen.getByText("Weekly Report")).toBeInTheDocument();
    });
  });

  it("calls onSelectTemplate when a template is selected", async () => {
    await act(async () => {
      render(<TaskTemplateSelector onSelectTemplate={mockOnSelectTemplate} />);
    });

    // Click the button to open the popover
    const button = await screen.findByTestId("popover-trigger");

    await act(async () => {
      fireEvent.click(button);
    });

    // Click on a template
    await waitFor(() => {
      const templateItem = screen.getByText("Daily Standup");

      act(() => {
        fireEvent.click(templateItem);
      });
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

    await act(async () => {
      render(<TaskTemplateSelector onSelectTemplate={mockOnSelectTemplate} />);
    });

    // Click the button to open the popover
    const button = await screen.findByTestId("popover-trigger");

    await act(async () => {
      fireEvent.click(button);
    });

    // Check if loading state is displayed
    await waitFor(() => {
      expect(screen.getByText("Loading templates...")).toBeInTheDocument();
    });
  });
});
