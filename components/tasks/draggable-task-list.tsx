"use client";

import { useState, useCallback } from "react";
import { Task, TaskStatus } from "@/hooks/use-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AnimatedList } from "@/components/ui/animated-list";
import { DraggableTaskItem } from "./draggable-task-item";

interface DraggableTaskListProps {
  tasks: Task[];
  toggleTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  openTaskDetails: (task: Task) => void;
  onReorder: (taskIds: string[]) => Promise<boolean>;
}

export function DraggableTaskList({
  tasks,
  toggleTaskStatus,
  deleteTask,
  openTaskDetails,
  onReorder,
}: DraggableTaskListProps) {
  // Sort tasks by order
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  // State to track the current order of tasks
  const [orderedTasks, setOrderedTasks] = useState<Task[]>(sortedTasks);

  // Handle task reordering
  const moveTask = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const draggedTask = orderedTasks[dragIndex];
      const newTasks = [...orderedTasks];

      // Remove the task from its original position
      newTasks.splice(dragIndex, 1);

      // Insert the task at the new position
      newTasks.splice(hoverIndex, 0, draggedTask);

      // Update the state with the new order
      setOrderedTasks(newTasks);
    },
    [orderedTasks]
  );

  // Save the new order to the server when a drag operation ends
  const handleDragEnd = useCallback(async () => {
    const taskIds = orderedTasks.map((task) => task.id);
    await onReorder(taskIds);
  }, [orderedTasks, onReorder]);

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
    <DndProvider backend={HTML5Backend}>
      <Card>
        <CardContent className="p-0">
          <AnimatedList
            className="divide-y"
            animation="slide-up"
            staggerDelay={0.05}
          >
            {orderedTasks.map((task, index) => (
              <DraggableTaskItem
                key={task.id}
                task={task}
                index={index}
                moveTask={moveTask}
                onDragEnd={handleDragEnd}
                toggleTaskStatus={toggleTaskStatus}
                deleteTask={deleteTask}
                openTaskDetails={openTaskDetails}
              />
            ))}
          </AnimatedList>
        </CardContent>
      </Card>
    </DndProvider>
  );
}
