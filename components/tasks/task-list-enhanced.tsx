"use client";

import { Task, TaskStatus } from "@/hooks/use-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { TaskItem } from "./task-item";
import { AnimatedList } from "@/components/ui/animated-list";

interface TaskListEnhancedProps {
  tasks: Task[];
  toggleTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  openTaskDetails: (task: Task) => void;
}

export function TaskListEnhanced({
  tasks,
  toggleTaskStatus,
  deleteTask,
  openTaskDetails,
}: TaskListEnhancedProps) {
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
        <AnimatedList
          className="divide-y"
          animation="slide-up"
          staggerDelay={0.05}
        >
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
        </AnimatedList>
      </CardContent>
    </Card>
  );
}
