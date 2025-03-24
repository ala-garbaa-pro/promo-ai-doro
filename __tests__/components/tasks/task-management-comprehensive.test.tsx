import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskListEnhanced } from "@/components/tasks/task-list-enhanced";
import { DraggableTaskList } from "@/components/tasks/draggable-task-list";
import { TaskItem } from "@/components/tasks/task-item";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";
import { Task, TaskStatus, TaskPriority } from "@/hooks/use-tasks";

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

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

describe("Task Management Components", () => {
  // Mock functions
  const mockToggleTaskStatus = jest.fn();
  const mockDeleteTask = jest.fn();
  const mockOpenTaskDetails = jest.fn();
  const mockOnReorder = jest.fn().mockResolvedValue(true);
  const mockOnTaskCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("TaskListEnhanced Component", () => {
    it("renders tasks correctly", () => {
      render(
        <TaskListEnhanced
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Check if all tasks are rendered
      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(screen.getByText("Review code")).toBeInTheDocument();
      expect(screen.getByText("Write tests")).toBeInTheDocument();
    });

    it("displays 'No tasks found' when tasks array is empty", () => {
      render(
        <TaskListEnhanced
          tasks={[]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      expect(screen.getByText("No tasks found")).toBeInTheDocument();
    });
  });

  describe("DraggableTaskList Component", () => {
    it("renders tasks in correct order", () => {
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

      // Check if tasks are rendered in the correct order
      const taskElements = screen.getAllByRole("listitem");
      expect(taskElements.length).toBe(3);

      // Check order by finding text within each list item
      expect(taskElements[0]).toHaveTextContent("Complete project");
      expect(taskElements[1]).toHaveTextContent("Review code");
      expect(taskElements[2]).toHaveTextContent("Write tests");
    });

    it("displays 'No tasks found' when tasks array is empty", () => {
      render(
        <DndProvider backend={HTML5Backend}>
          <DraggableTaskList
            tasks={[]}
            toggleTaskStatus={mockToggleTaskStatus}
            deleteTask={mockDeleteTask}
            openTaskDetails={mockOpenTaskDetails}
            onReorder={mockOnReorder}
          />
        </DndProvider>
      );

      expect(screen.getByText("No tasks found")).toBeInTheDocument();
    });
  });

  describe("TaskItem Component", () => {
    it("renders task details correctly", () => {
      const task = mockTasks[0];

      render(
        <TaskItem
          task={task}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Check if task details are rendered
      expect(screen.getByText(task.title)).toBeInTheDocument();
      expect(
        screen.getByText(`${task.estimatedPomodoros} pomodoros`)
      ).toBeInTheDocument();

      // Check if priority indicator is present
      const priorityElement = screen.getByTestId(`priority-${task.priority}`);
      expect(priorityElement).toBeInTheDocument();
    });

    it("calls toggleTaskStatus when checkbox is clicked", () => {
      const task = mockTasks[0];

      render(
        <TaskItem
          task={task}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Find and click the checkbox
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      // Check if toggleTaskStatus was called with correct arguments
      expect(mockToggleTaskStatus).toHaveBeenCalledWith(
        task.id,
        task.status === "completed" ? "pending" : "completed"
      );
    });

    it("calls deleteTask when delete button is clicked", () => {
      const task = mockTasks[0];

      render(
        <TaskItem
          task={task}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Find and click the delete button
      const deleteButton = screen.getByRole("button", { name: /delete/i });
      fireEvent.click(deleteButton);

      // Check if deleteTask was called with correct argument
      expect(mockDeleteTask).toHaveBeenCalledWith(task.id);
    });

    it("calls openTaskDetails when edit button is clicked", () => {
      const task = mockTasks[0];

      render(
        <TaskItem
          task={task}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Find and click the edit button
      const editButton = screen.getByRole("button", { name: /edit/i });
      fireEvent.click(editButton);

      // Check if openTaskDetails was called with correct argument
      expect(mockOpenTaskDetails).toHaveBeenCalledWith(task);
    });
  });

  describe("NaturalLanguageTaskInput Component", () => {
    it("parses and creates a task with natural language input", async () => {
      render(<NaturalLanguageTaskInput onTaskCreate={mockOnTaskCreate} />);

      // Find the input field
      const input = screen.getByPlaceholderText(/add a task/i);

      // Type a task with natural language
      fireEvent.change(input, {
        target: { value: "Complete project report by tomorrow #high ~3" },
      });

      // Submit the task
      fireEvent.keyDown(input, { key: "Enter" });

      // Verify task was created with correct data
      await waitFor(() => {
        expect(mockOnTaskCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Complete project report",
            priority: "high",
            estimatedPomodoros: 3,
            dueDate: expect.any(Date),
          })
        );
      });

      // Input should be cleared after submission
      expect(input).toHaveValue("");
    });

    it("doesn't create a task when input is empty", () => {
      render(<NaturalLanguageTaskInput onTaskCreate={mockOnTaskCreate} />);

      // Find the input field
      const input = screen.getByPlaceholderText(/add a task/i);

      // Submit with empty input
      fireEvent.keyDown(input, { key: "Enter" });

      // Verify task was not created
      expect(mockOnTaskCreate).not.toHaveBeenCalled();
    });
  });
});
