"use client";

import { useState, useEffect } from "react";
import { parseTaskInput, ParsedTask } from "@/lib/utils/task-parser";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TaskInputPreviewProps {
  input: string;
}

/**
 * Component that shows a preview of how the natural language task input
 * will be parsed, providing immediate feedback to the user.
 */
export function TaskInputPreview({ input }: TaskInputPreviewProps) {
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null);

  useEffect(() => {
    if (input.trim()) {
      setParsedTask(parseTaskInput(input));
    } else {
      setParsedTask(null);
    }
  }, [input]);

  if (!parsedTask || input.trim() === "") {
    return null;
  }

  // Only show the preview if there are additional attributes beyond the title
  const hasAttributes =
    parsedTask.dueDate ||
    parsedTask.priority ||
    parsedTask.tags?.length ||
    parsedTask.estimatedPomodoros ||
    parsedTask.category ||
    parsedTask.isRecurring;

  if (!hasAttributes) {
    return null;
  }

  return (
    <div className="text-sm text-muted-foreground mt-2 space-y-1 p-2 border rounded-md bg-muted/30">
      <div>
        <span className="font-medium">Title:</span> {parsedTask.title}
      </div>

      {parsedTask.dueDate && (
        <div>
          <span className="font-medium">Due:</span>{" "}
          {format(parsedTask.dueDate, "PPP")}
          {parsedTask.dueDate.getHours() !== 0 &&
            ` at ${format(parsedTask.dueDate, "p")}`}
        </div>
      )}

      {parsedTask.priority && (
        <div>
          <span className="font-medium">Priority:</span> {parsedTask.priority}
        </div>
      )}

      {parsedTask.estimatedPomodoros && (
        <div>
          <span className="font-medium">Pomodoros:</span>{" "}
          {parsedTask.estimatedPomodoros}
        </div>
      )}

      {parsedTask.tags && parsedTask.tags.length > 0 && (
        <div className="flex gap-1 items-center">
          <span className="font-medium">Tags:</span>
          {parsedTask.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {parsedTask.category && (
        <div>
          <span className="font-medium">Category:</span> {parsedTask.category}
        </div>
      )}

      {parsedTask.isRecurring && (
        <div>
          <span className="font-medium">Recurring:</span> Every{" "}
          {parsedTask.recurringInterval} {parsedTask.recurringType}
        </div>
      )}
    </div>
  );
}
