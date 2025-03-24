import React from "react";
import { Task, TaskStatus } from "@/hooks/use-tasks";

interface TaskItemProps {
  task: Task;
  toggleTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  openTaskDetails: (task: Task) => void;
}

export function TaskItem({
  task,
  toggleTaskStatus,
  deleteTask,
  openTaskDetails,
}: TaskItemProps) {
  const handleToggle = () => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    toggleTaskStatus(task.id, newStatus);
  };

  return (
    <div data-testid={`task-item-${task.id}`}>
      <input
        type="checkbox"
        checked={task.status === "completed"}
        onChange={handleToggle}
        data-testid={`task-checkbox-${task.id}`}
      />
      <span>{task.title}</span>
      <button
        onClick={() => openTaskDetails(task)}
        data-testid={`task-edit-${task.id}`}
      >
        Edit
      </button>
      <button
        onClick={() => deleteTask(task.id)}
        data-testid={`task-delete-${task.id}`}
      >
        Delete
      </button>
    </div>
  );
}
