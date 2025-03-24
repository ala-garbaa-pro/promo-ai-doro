import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskList } from "@/components/tasks/task-list";
import { DraggableTaskList } from "@/components/tasks/draggable-task-list";
import { TaskItem } from "@/components/tasks/task-item";
import { Task } from "@/types/task";

// Mock the DropdownMenu component
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  DropdownMenuSeparator: () => <hr />,
}));

// Mock the TaskCategoryBadges component
vi.mock("@/components/tasks/task-category-badge", () => ({
  TaskCategoryBadges: ({ categoryIds }: { categoryIds: string[] }) => (
    <div data-testid="task-category-badges">
      {categoryIds?.map((id) => (
        <span key={id}>{id}</span>
      ))}
    </div>
  ),
}));

// Mock fetch for API calls
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ id: "work" }, { id: "personal" }]),
  })
);

// Mock tasks for testing
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete project",
    description: "Finish the project by end of day",
    priority: "high",
    status: "pending",
    estimatedPomodoros: 4,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Review code",
    description: "Review pull request",
    priority: "medium",
    status: "in_progress",
    estimatedPomodoros: 2,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Write tests",
    description: "Add unit tests",
    priority: "low",
    status: "completed",
    estimatedPomodoros: 3,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock functions
const mockToggleTaskStatus = vi.fn();
const mockDeleteTask = vi.fn();
const mockOpenTaskDetails = vi.fn();
const mockOnReorder = vi.fn().mockResolvedValue(true);

describe("Task Management Components (Vitest)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("TaskItem Component", () => {
    it("renders task item correctly", async () => {
      await act(async () => {
        render(
          <TaskItem
            task={mockTasks[0]}
            toggleTaskStatus={mockToggleTaskStatus}
            deleteTask={mockDeleteTask}
            openTaskDetails={mockOpenTaskDetails}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByText("Complete project")).toBeInTheDocument();
        expect(
          screen.getByText("Finish the project by end of day")
        ).toBeInTheDocument();
        expect(screen.getByText(/4 pomodoros/i)).toBeInTheDocument(); // Estimated pomodoros
      });
    });

    it("calls toggleTaskStatus when checkbox is clicked", async () => {
      await act(async () => {
        render(
          <TaskItem
            task={mockTasks[0]}
            toggleTaskStatus={mockToggleTaskStatus}
            deleteTask={mockDeleteTask}
            openTaskDetails={mockOpenTaskDetails}
          />
        );
      });

      const statusButtons = await screen.findAllByRole("button");

      await act(async () => {
        // The first button is the status button
        fireEvent.click(statusButtons[0]);
      });

      expect(mockToggleTaskStatus).toHaveBeenCalledWith(
        mockTasks[0].id,
        mockTasks[0].status
      );
    });

    it("calls deleteTask when delete button is clicked", async () => {
      await act(async () => {
        render(
          <TaskItem
            task={mockTasks[0]}
            toggleTaskStatus={mockToggleTaskStatus}
            deleteTask={mockDeleteTask}
            openTaskDetails={mockOpenTaskDetails}
          />
        );
      });

      // Open dropdown menu
      const menuButton = await screen.findByRole("button", {
        name: /task options/i,
      });

      await act(async () => {
        fireEvent.click(menuButton);
      });

      // Click delete option
      const deleteOption = await screen.findByText(/Delete/i);

      await act(async () => {
        fireEvent.click(deleteOption);
      });

      expect(mockDeleteTask).toHaveBeenCalledWith(mockTasks[0].id);
    });

    it("calls openTaskDetails when edit button is clicked", async () => {
      await act(async () => {
        render(
          <TaskItem
            task={mockTasks[0]}
            toggleTaskStatus={mockToggleTaskStatus}
            deleteTask={mockDeleteTask}
            openTaskDetails={mockOpenTaskDetails}
          />
        );
      });

      // Open dropdown menu
      const menuButton = await screen.findByRole("button", {
        name: /task options/i,
      });

      await act(async () => {
        fireEvent.click(menuButton);
      });

      // Click edit option
      const editOption = await screen.findByText(/Edit Task/i);

      await act(async () => {
        fireEvent.click(editOption);
      });

      expect(mockOpenTaskDetails).toHaveBeenCalledWith(mockTasks[0]);
    });
  });

  describe("TaskList Component", () => {
    it("renders tasks correctly", async () => {
      await act(async () => {
        render(
          <TaskList
            tasks={mockTasks}
            toggleTaskStatus={mockToggleTaskStatus}
            deleteTask={mockDeleteTask}
            openTaskDetails={mockOpenTaskDetails}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByText("Complete project")).toBeInTheDocument();
        expect(screen.getByText("Review code")).toBeInTheDocument();
        expect(screen.getByText("Write tests")).toBeInTheDocument();
      });
    });

    it("renders empty state when no tasks", async () => {
      await act(async () => {
        render(
          <TaskList
            tasks={[]}
            toggleTaskStatus={mockToggleTaskStatus}
            deleteTask={mockDeleteTask}
            openTaskDetails={mockOpenTaskDetails}
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByText("No tasks found")).toBeInTheDocument();
      });
    });
  });

  describe("DraggableTaskList Component", () => {
    it("renders tasks in correct order", async () => {
      await act(async () => {
        render(
          <DndProvider backend={HTML5Backend}>
            <DraggableTaskList
              tasks={mockTasks}
              toggleTaskStatus={mockToggleTaskStatus}
              deleteTask={mockDeleteTask}
              openTaskDetails={mockOpenTaskDetails}
              onReorder={mockOnReorder}
            />
          </DndProvider>
        );
      });

      // Check if tasks are rendered in the correct order
      const taskElements = await screen.findAllByRole("listitem");

      await waitFor(() => {
        expect(taskElements.length).toBe(3);

        // Check order by finding text within each list item
        expect(taskElements[0]).toHaveTextContent("Complete project");
        expect(taskElements[1]).toHaveTextContent("Review code");
        expect(taskElements[2]).toHaveTextContent("Write tests");
      });
    });
  });
});
