"use client";

import { Task, TaskStatus } from "@/hooks/use-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { TaskItem } from "./task-item";

interface TaskListProps {
  tasks: Task[];
  toggleTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  openTaskDetails: (task: Task) => void;
}

export function TaskList({
  tasks,
  toggleTaskStatus,
  deleteTask,
  openTaskDetails,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No tasks found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskItem
                task={task}
                toggleTaskStatus={toggleTaskStatus}
                deleteTask={deleteTask}
                openTaskDetails={openTaskDetails}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
