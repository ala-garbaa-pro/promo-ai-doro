import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskDependencies } from "@/components/tasks/task-dependencies";
import { useToast } from "@/components/ui/use-toast";

// Mock the fetch API
global.fetch = jest.fn();

// Mock the hooks
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("TaskDependencies", () => {
  const mockTaskId = "task-123";
  const mockDependencies = ["dep-1", "dep-2"];
  const mockOnAddDependency = jest.fn();
  const mockOnRemoveDependency = jest.fn();
  const mockToast = { toast: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);

    // Mock the fetch response for tasks
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        { id: "task-1", title: "Task 1", description: "Description 1" },
        { id: "task-2", title: "Task 2", description: "Description 2" },
        { id: "task-3", title: "Task 3", description: "Description 3" },
      ]),
    });
  });

  it("renders the component with dependencies", () => {
    render(
      <TaskDependencies
        taskId={mockTaskId}
        dependencies={mockDependencies}
        onAddDependency={mockOnAddDependency}
        onRemoveDependency={mockOnRemoveDependency}
      />
    );

    expect(screen.getByText("Dependencies")).toBeInTheDocument();
    expect(screen.getByText("Task dep-1...")).toBeInTheDocument();
    expect(screen.getByText("Task dep-2...")).toBeInTheDocument();
  });

  it("renders empty state when no dependencies", () => {
    render(
      <TaskDependencies
        taskId={mockTaskId}
        dependencies={[]}
        onAddDependency={mockOnAddDependency}
        onRemoveDependency={mockOnRemoveDependency}
      />
    );

    expect(screen.getByText("Dependencies")).toBeInTheDocument();
    expect(screen.getByText("No dependencies added yet")).toBeInTheDocument();
  });

  it("opens the add dependencies dialog when add button is clicked", async () => {
    render(
      <TaskDependencies
        taskId={mockTaskId}
        dependencies={mockDependencies}
        onAddDependency={mockOnAddDependency}
        onRemoveDependency={mockOnRemoveDependency}
      />
    );

    // Click the add button
    fireEvent.click(screen.getByText("Add"));

    // Dialog should be open
    expect(screen.getByText("Add Dependencies")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Select tasks that must be completed before this task can be started."
      )
    ).toBeInTheDocument();

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
      expect(screen.getByText("Task 3")).toBeInTheDocument();
    });

    // Verify the API call
    expect(global.fetch).toHaveBeenCalledWith("/api/tasks");
  });

  it("filters tasks when searching", async () => {
    render(
      <TaskDependencies
        taskId={mockTaskId}
        dependencies={mockDependencies}
        onAddDependency={mockOnAddDependency}
        onRemoveDependency={mockOnRemoveDependency}
      />
    );

    // Click the add button
    fireEvent.click(screen.getByText("Add"));

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
    });

    // Search for "Task 2"
    fireEvent.change(screen.getByPlaceholderText("Search tasks..."), {
      target: { value: "Task 2" },
    });

    // Only Task 2 should be visible
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.queryByText("Task 3")).not.toBeInTheDocument();
  });

  it("selects and adds dependencies", async () => {
    render(
      <TaskDependencies
        taskId={mockTaskId}
        dependencies={mockDependencies}
        onAddDependency={mockOnAddDependency}
        onRemoveDependency={mockOnRemoveDependency}
      />
    );

    // Click the add button
    fireEvent.click(screen.getByText("Add"));

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
    });

    // Select Task 1 and Task 3
    fireEvent.click(screen.getByLabelText("Task 1"));
    fireEvent.click(screen.getByLabelText("Task 3"));

    // Add the selected dependencies
    fireEvent.click(screen.getByText("Add Selected"));

    // Verify the onAddDependency calls
    expect(mockOnAddDependency).toHaveBeenCalledTimes(2);
    expect(mockOnAddDependency).toHaveBeenCalledWith("task-1");
    expect(mockOnAddDependency).toHaveBeenCalledWith("task-3");

    // Verify the toast
    expect(mockToast.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Dependencies added",
        description: "2 dependencies have been added.",
      })
    );
  });

  it("removes a dependency when remove button is clicked", async () => {
    render(
      <TaskDependencies
        taskId={mockTaskId}
        dependencies={mockDependencies}
        onAddDependency={mockOnAddDependency}
        onRemoveDependency={mockOnRemoveDependency}
      />
    );

    // Click the remove button for the first dependency
    const removeButtons = screen.getAllByLabelText("Remove");
    fireEvent.click(removeButtons[0]);

    // Verify the onRemoveDependency call
    expect(mockOnRemoveDependency).toHaveBeenCalledWith("dep-1");

    // Verify the toast
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Dependency removed",
        })
      );
    });
  });

  it("handles API errors when fetching tasks", async () => {
    // Mock a failed API response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    render(
      <TaskDependencies
        taskId={mockTaskId}
        dependencies={mockDependencies}
        onAddDependency={mockOnAddDependency}
        onRemoveDependency={mockOnRemoveDependency}
      />
    );

    // Click the add button
    fireEvent.click(screen.getByText("Add"));

    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText("Failed to load tasks")).toBeInTheDocument();
    });
  });
});
