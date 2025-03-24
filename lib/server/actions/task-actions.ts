"use server";

import { db } from "@/lib/server/db";
import { tasks, categories } from "@/lib/server/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ParsedTaskData } from "@/lib/utils/natural-language-parser";

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  estimatedPomodoros?: number;
  categoryId?: string;
  category?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringType?: string;
  recurringInterval?: number;
  recurringEndDate?: Date;
  naturalLanguageInput?: string;
}

export async function createTask(input: CreateTaskInput) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("You must be logged in to create a task");
    }

    // Handle category creation if needed
    let categoryId = input.categoryId;

    if (input.category && !categoryId) {
      // Check if category exists
      const existingCategory = await db.query.categories.findFirst({
        where: and(
          eq(categories.userId, user.id),
          eq(categories.name, input.category)
        ),
      });

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // Create new category
        const [newCategory] = await db
          .insert(categories)
          .values({
            userId: user.id,
            name: input.category,
            color: generateRandomColor(),
          })
          .returning();

        categoryId = newCategory.id;
      }
    }

    // Create the task
    const [newTask] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        priority: input.priority || "medium",
        estimatedPomodoros: input.estimatedPomodoros,
        categoryId: categoryId,
        tags: input.tags,
        isRecurring: input.isRecurring || false,
        recurringType: input.recurringType,
        recurringInterval: input.recurringInterval,
        recurringEndDate: input.recurringEndDate,
        naturalLanguageInput: input.naturalLanguageInput,
      })
      .returning();

    revalidatePath("/app/tasks");
    revalidatePath("/app");

    return { success: true, task: newTask };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function createTaskFromNaturalLanguage(
  parsedTask: ParsedTaskData
) {
  try {
    // Convert ParsedTaskData to CreateTaskInput
    const taskInput: CreateTaskInput = {
      title: parsedTask.title,
      dueDate: parsedTask.dueDate,
      priority: parsedTask.priority,
      estimatedPomodoros: parsedTask.estimatedPomodoros,
      category: parsedTask.category,
      tags: parsedTask.tags,
      isRecurring: parsedTask.isRecurring,
      recurringType: parsedTask.recurringPattern,
      naturalLanguageInput: parsedTask.title, // Store original input
    };

    return await createTask(taskInput);
  } catch (error) {
    console.error("Error creating task from natural language:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Helper function to generate a random color for new categories
function generateRandomColor(): string {
  const colors = [
    "#f87171", // red
    "#fb923c", // orange
    "#fbbf24", // amber
    "#a3e635", // lime
    "#4ade80", // green
    "#2dd4bf", // teal
    "#38bdf8", // sky
    "#818cf8", // indigo
    "#a78bfa", // violet
    "#f472b6", // pink
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}
