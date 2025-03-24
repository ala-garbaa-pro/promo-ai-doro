import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskList } from "@/components/tasks/task-list";
import { TaskListEnhanced } from "@/components/tasks/task-list-enhanced";
import { DraggableTaskList } from "@/components/tasks/draggable-task-list";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskDetails } from "@/components/tasks/task-details";
import { NaturalLanguageTaskInput } from "@/components/tasks/natural-language-task-input";
import { Task } from "@/hooks/use-tasks";

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
const mockToggleTaskStatus = jest.fn();
const mockDeleteTask = jest.fn();
const mockOpenTaskDetails = jest.fn();
const mockOnReorder = jest.fn().mockResolvedValue(true);
const mockCreateTask = jest.fn();
const mockUpdateTask = jest.fn();

describe("Task Management Components - Enhanced Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("TaskList Component", () => {
    it("renders tasks correctly", () => {
      render(
        <TaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Check if all task titles are rendered
      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(screen.getByText("Review code")).toBeInTheDocument();
      expect(screen.getByText("Write tests")).toBeInTheDocument();
    });

    it("displays empty state when no tasks", () => {
      render(
        <TaskList
          tasks={[]}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      expect(screen.getByText("No tasks found")).toBeInTheDocument();
    });

    it("calls toggleTaskStatus when checkbox is clicked", async () => {
      render(
        <TaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      const user = userEvent.setup();
      const checkbox = screen.getAllByRole("checkbox")[0];

      await user.click(checkbox);

      expect(mockToggleTaskStatus).toHaveBeenCalledWith("1");
    });

    it("calls deleteTask when delete button is clicked", async () => {
      render(
        <TaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      const user = userEvent.setup();
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });

      await user.click(deleteButtons[0]);

      expect(mockDeleteTask).toHaveBeenCalledWith("1");
    });

    it("calls openTaskDetails when task title is clicked", async () => {
      render(
        <TaskList
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      const user = userEvent.setup();
      const taskTitle = screen.getByText("Complete project");

      await user.click(taskTitle);

      expect(mockOpenTaskDetails).toHaveBeenCalledWith("1");
    });
  });

  describe("TaskListEnhanced Component", () => {
    it("renders tasks with priority indicators", () => {
      render(
        <TaskListEnhanced
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Check if priority indicators are rendered
      const highPriorityIndicator = screen.getByTestId(
        "priority-indicator-high"
      );
      const mediumPriorityIndicator = screen.getByTestId(
        "priority-indicator-medium"
      );
      const lowPriorityIndicator = screen.getByTestId("priority-indicator-low");

      expect(highPriorityIndicator).toBeInTheDocument();
      expect(mediumPriorityIndicator).toBeInTheDocument();
      expect(lowPriorityIndicator).toBeInTheDocument();
    });

    it("renders tasks with estimated pomodoros", () => {
      render(
        <TaskListEnhanced
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Check if estimated pomodoros are rendered
      const pomodoroIndicators = screen.getAllByTestId(/pomodoro-indicator/);
      expect(pomodoroIndicators.length).toBe(3); // One for each task
    });

    it("renders tasks with status indicators", () => {
      render(
        <TaskListEnhanced
          tasks={mockTasks}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Check if status indicators are rendered
      const pendingIndicator = screen.getByTestId("status-indicator-pending");
      const inProgressIndicator = screen.getByTestId(
        "status-indicator-in_progress"
      );
      const completedIndicator = screen.getByTestId(
        "status-indicator-completed"
      );

      expect(pendingIndicator).toBeInTheDocument();
      expect(inProgressIndicator).toBeInTheDocument();
      expect(completedIndicator).toBeInTheDocument();
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
      expect(screen.getByText(task.description!)).toBeInTheDocument();
      expect(
        screen.getByTestId(`priority-indicator-${task.priority}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`status-indicator-${task.status}`)
      ).toBeInTheDocument();
      expect(screen.getByTestId("pomodoro-indicator")).toBeInTheDocument();
    });

    it("renders completed task with strikethrough", () => {
      const completedTask = mockTasks[2]; // The completed task

      render(
        <TaskItem
          task={completedTask}
          toggleTaskStatus={mockToggleTaskStatus}
          deleteTask={mockDeleteTask}
          openTaskDetails={mockOpenTaskDetails}
        />
      );

      // Check if title has strikethrough class
      const titleElement = screen.getByText(completedTask.title);
      expect(titleElement).toHaveClass("line-through");
    });
  });

  describe("NaturalLanguageTaskInput Component", () => {
    it("creates a task with natural language input", async () => {
      render(<NaturalLanguageTaskInput onTaskCreate={mockCreateTask} />);

      const user = userEvent.setup();
      const input = screen.getByPlaceholderText(/add a task/i);

      // Type a task with natural language
      await user.type(input, "Complete project report by tomorrow #high ~3");
      await user.keyboard("{Enter}");

      // Check if task was created with correct data
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Complete project report",
          priority: "high",
          estimatedPomodoros: 3,
          dueDate: expect.any(Date),
        })
      );
    });

    it("handles invalid input gracefully", async () => {
      render(<NaturalLanguageTaskInput onTaskCreate={mockCreateTask} />);

      const user = userEvent.setup();
      const input = screen.getByPlaceholderText(/add a task/i);

      // Type an empty task
      await user.type(input, "   ");
      await user.keyboard("{Enter}");

      // Check that task was not created
      expect(mockCreateTask).not.toHaveBeenCalled();
    });
  });

  describe("TaskDetails Component", () => {
    const task = mockTasks[0];

    it("renders task details correctly", () => {
      render(
        <TaskDetails
          task={task}
          onClose={() => {}}
          onUpdate={mockUpdateTask}
          onDelete={mockDeleteTask}
        />
      );

      // Check if task details are rendered
      expect(screen.getByDisplayValue(task.title)).toBeInTheDocument();
      expect(screen.getByDisplayValue(task.description!)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(task.estimatedPomodoros!.toString())
      ).toBeInTheDocument();
    });

    it("updates task when form is submitted", async () => {
      render(
        <TaskDetails
          task={task}
          onClose={() => {}}
          onUpdate={mockUpdateTask}
          onDelete={mockDeleteTask}
        />
      );

      const user = userEvent.setup();

      // Update title
      const titleInput = screen.getByDisplayValue(task.title);
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Title");

      // Submit form
      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      // Check if task was updated with new title
      expect(mockUpdateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          id: task.id,
          title: "Updated Title",
        })
      );
    });

    it("deletes task when delete button is clicked", async () => {
      render(
        <TaskDetails
          task={task}
          onClose={() => {}}
          onUpdate={mockUpdateTask}
          onDelete={mockDeleteTask}
        />
      );

      const user = userEvent.setup();

      // Click delete button
      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      // Check if task was deleted
      expect(mockDeleteTask).toHaveBeenCalledWith(task.id);
    });
  });
});
