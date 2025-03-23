import { db } from "@/lib/server/db";
import { tasks } from "@/lib/server/db/schema";
import { eq, and, lt, gte } from "drizzle-orm";
import { addDays, addWeeks, addMonths, addYears, startOfDay } from "date-fns";

/**
 * Creates the next occurrence of a recurring task
 */
export async function createNextOccurrence(taskId: string) {
  // Get the task
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  // Check if task is recurring
  if (!task.isRecurring) {
    throw new Error(`Task is not recurring: ${taskId}`);
  }

  // Check if task has reached its end date
  if (task.recurringEndDate && new Date(task.recurringEndDate) < new Date()) {
    return null; // No more occurrences
  }

  // Calculate next due date
  let nextDueDate: Date | null = null;

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const interval = task.recurringInterval || 1;

    switch (task.recurringType) {
      case "daily":
        nextDueDate = addDays(dueDate, interval);
        break;
      case "weekly":
        nextDueDate = addWeeks(dueDate, interval);
        break;
      case "monthly":
        nextDueDate = addMonths(dueDate, interval);
        break;
      case "yearly":
        nextDueDate = addYears(dueDate, interval);
        break;
      default:
        nextDueDate = addDays(dueDate, interval);
    }
  } else {
    // If no due date, use current date as reference
    const today = startOfDay(new Date());
    const interval = task.recurringInterval || 1;

    switch (task.recurringType) {
      case "daily":
        nextDueDate = addDays(today, interval);
        break;
      case "weekly":
        nextDueDate = addWeeks(today, interval);
        break;
      case "monthly":
        nextDueDate = addMonths(today, interval);
        break;
      case "yearly":
        nextDueDate = addYears(today, interval);
        break;
      default:
        nextDueDate = addDays(today, interval);
    }
  }

  // Create new task occurrence
  const [newTask] = await db
    .insert(tasks)
    .values({
      userId: task.userId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: "pending", // Always start as pending
      estimatedPomodoros: task.estimatedPomodoros,
      dueDate: nextDueDate,
      categoryId: task.categoryId,
      category: task.category,
      tags: task.tags,
      isRecurring: task.isRecurring,
      recurringType: task.recurringType,
      recurringInterval: task.recurringInterval,
      recurringEndDate: task.recurringEndDate,
      parentTaskId: task.id, // Link to parent task
    })
    .returning();

  return newTask;
}

/**
 * Processes all recurring tasks that need new occurrences
 */
export async function processRecurringTasks() {
  // Get all recurring tasks with completed status and no child tasks for the next period
  const recurringTasks = await db.query.tasks.findMany({
    where: and(eq(tasks.isRecurring, true), eq(tasks.status, "completed")),
  });

  const results = {
    processed: 0,
    created: 0,
    errors: 0,
  };

  // Process each task
  for (const task of recurringTasks) {
    results.processed++;

    try {
      // Check if a future occurrence already exists
      const existingOccurrence = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.parentTaskId, task.id),
          gte(tasks.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Created in the last 24 hours
        ),
      });

      if (!existingOccurrence) {
        const newTask = await createNextOccurrence(task.id);
        if (newTask) {
          results.created++;
        }
      }
    } catch (error) {
      console.error(`Error processing recurring task ${task.id}:`, error);
      results.errors++;
    }
  }

  return results;
}
