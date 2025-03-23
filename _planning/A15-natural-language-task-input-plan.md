# Pomo AI-doro: Natural Language Task Input Plan

## Overview

This plan outlines the implementation of a natural language task input feature for the Pomo AI-doro application, inspired by Todoist's quick add functionality. This feature will allow users to create tasks with various attributes (due dates, priorities, tags, etc.) using natural language patterns, making task creation faster and more intuitive.

## Research Insights

Based on analysis of Pomofocus, Todoist, and emerging productivity trends, the following key insights have informed this plan:

1. **From Todoist:**

   - Natural language task input is one of Todoist's most praised features
   - The ability to add tasks with dates, priorities, and labels in a single input
   - Support for recurring task patterns with flexible scheduling
   - Quick capture of tasks at the "speed of thought"

2. **From Pomofocus:**

   - Task templates for repetitive work
   - Estimated finish time calculations
   - Simple, distraction-free interface

3. **From 2024 Productivity Trends:**
   - AI-powered personalization of work patterns
   - Voice-based task management
   - Hyper-personalized productivity recommendations
   - Contextual awareness in productivity tools

## Feature Description

The natural language task input feature will allow users to quickly add tasks with various attributes using natural language patterns. For example:

- "Call John tomorrow at 3pm p1 #work" would create a high-priority task titled "Call John" due tomorrow at 3pm with the tag "work"
- "Submit report every Friday #project" would create a recurring task titled "Submit report" that repeats every Friday with the tag "project"
- "Buy groceries today #personal @shopping" would create a task titled "Buy groceries" due today with the tag "personal" and category "shopping"

### Supported Patterns

The natural language parser will support the following patterns:

1. **Dates:**

   - Relative dates: "today", "tomorrow", "next Monday"
   - Absolute dates: "on 2023-05-15"

2. **Times:**

   - "at 3pm", "at 15:30"

3. **Priority:**

   - "p1" (high), "p2" (medium), "p3" (low)
   - "high priority", "medium priority", "low priority"

4. **Tags:**

   - "#work", "#personal", "#project"

5. **Categories:**

   - "@work", "@home", "@shopping"

6. **Pomodoros:**

   - "2p", "3 pomodoros"

7. **Recurring:**
   - "every day", "every 2 weeks", "every month"

## Implementation Plan

### 1. Create a Natural Language Parser Service

Create a utility function that parses natural language input and extracts task details:

```typescript
// lib/utils/task-parser.ts
export interface ParsedTask {
  title: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  estimatedPomodoros?: number;
  category?: string;
  isRecurring?: boolean;
  recurringType?: "daily" | "weekly" | "monthly" | "yearly";
  recurringInterval?: number;
}

export function parseTaskInput(input: string): ParsedTask {
  // Implementation details...
}
```

### 2. Modify the Task Creation UI

Update the task creation UI to use the parser:

```typescript
// Import the parser
import { parseTaskInput } from "@/lib/utils/task-parser";

// Update the handleAddTask function
const handleAddTask = async () => {
  if (newTaskTitle.trim() === "" || isCreating) return;

  setIsCreating(true);

  try {
    // Parse the task input
    const parsedTask = parseTaskInput(newTaskTitle);

    // Create the task with the parsed details
    await createTask({
      title: parsedTask.title,
      priority: parsedTask.priority || "medium",
      status: "pending",
      estimatedPomodoros: parsedTask.estimatedPomodoros || 1,
      dueDate: parsedTask.dueDate,
      category: parsedTask.category,
      tags: parsedTask.tags,
      isRecurring: parsedTask.isRecurring,
      recurringType: parsedTask.recurringType,
      recurringInterval: parsedTask.recurringInterval,
    });

    setNewTaskTitle("");
  } finally {
    setIsCreating(false);
  }
};
```

### 3. Add UI Feedback for Parsed Task

Create a preview component to provide immediate feedback to users about how their input is being parsed:

```typescript
// components/tasks/task-input-preview.tsx
import { useState, useEffect } from "react";
import { parseTaskInput, ParsedTask } from "@/lib/utils/task-parser";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TaskInputPreviewProps {
  input: string;
}

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

  return (
    <div className="text-sm text-muted-foreground mt-2 space-y-1">
      {/* Display parsed task details */}
    </div>
  );
}
```

### 4. Add Help Documentation

Create a help dialog to explain how to use the natural language input:

```typescript
// components/tasks/task-input-help.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export function TaskInputHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Natural Language Task Input</DialogTitle>
          <DialogDescription>
            You can use natural language to quickly add tasks with details.
          </DialogDescription>
        </DialogHeader>

        {/* Help content */}
      </DialogContent>
    </Dialog>
  );
}
```

### 5. Testing the Implementation

Create tests to ensure the natural language parser works correctly:

```typescript
// __tests__/lib/utils/task-parser.test.ts
import { parseTaskInput } from "@/lib/utils/task-parser";
import { describe, it, expect } from "vitest";

describe("Task Parser", () => {
  it("should parse a simple task", () => {
    const result = parseTaskInput("Buy groceries");
    expect(result.title).toBe("Buy groceries");
  });

  // Additional tests...
});
```

## Future Enhancements

1. **AI-Powered Suggestions:**

   - Suggest task attributes based on past behavior
   - Learn from user patterns to improve parsing accuracy

2. **Voice Input:**

   - Allow users to add tasks using voice commands
   - Integrate with mobile device voice assistants

3. **Smart Templates:**

   - Recognize patterns in task creation and suggest templates
   - Auto-complete task details based on similar past tasks

4. **Context-Aware Parsing:**
   - Consider the current project, time of day, or user location when parsing tasks
   - Suggest appropriate tags, priorities, or due dates based on context

## Implementation Priorities

### Phase 1: Core Functionality

1. Implement the basic natural language parser
2. Update the task creation UI to use the parser
3. Add the preview component for immediate feedback
4. Create help documentation

### Phase 2: Refinements

1. Improve parsing accuracy and pattern recognition
2. Add support for more complex date and time formats
3. Implement error handling and suggestions for invalid inputs
4. Add keyboard shortcuts for quick task creation

### Phase 3: Advanced Features

1. Implement AI-powered suggestions
2. Add voice input support
3. Create smart templates based on user patterns
4. Develop context-aware parsing

## Success Metrics

- **Task Creation Speed:** Measure the time it takes users to create tasks with attributes
- **Feature Adoption:** Track the percentage of tasks created using natural language patterns
- **User Satisfaction:** Collect feedback on the feature's usability and helpfulness
- **Error Rate:** Monitor parsing errors and improve accuracy over time

## Conclusion

The natural language task input feature will significantly enhance the user experience of the Pomo AI-doro application by making task creation faster and more intuitive. By allowing users to quickly capture tasks with all their attributes in a single input, we can reduce friction in the task management workflow and help users stay focused on their work rather than managing their to-do list.
