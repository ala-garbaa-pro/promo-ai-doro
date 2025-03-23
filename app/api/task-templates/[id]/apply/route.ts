import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import {
  taskTemplates,
  templateItems,
  templateItemDependencies,
} from "@/lib/server/db/schema-templates";
import { tasks, taskDependencies } from "@/lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

// POST /api/task-templates/[id]/apply - Apply a task template to create tasks
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const templateId = params.id;

    // Get the template
    const template = await db.query.taskTemplates.findFirst({
      where: and(
        eq(taskTemplates.id, templateId),
        eq(taskTemplates.userId, userId)
      ),
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Get template items
    const items = await db.query.templateItems.findMany({
      where: eq(templateItems.templateId, templateId),
      orderBy: (items, { asc }) => [asc(items.order)],
    });

    // Get template item dependencies
    const dependencies = await db.query.templateItemDependencies.findMany({
      where: eq(templateItemDependencies.itemId, templateId),
    });

    // Create tasks from template
    const createdTasks: Record<string, string> = {}; // Map template item ID to created task ID

    // Transaction to create tasks and dependencies
    await db.transaction(async (tx) => {
      // Create main task from template
      const [mainTask] = await tx
        .insert(tasks)
        .values({
          userId,
          title: template.name,
          description: template.description,
          priority: template.priority,
          estimatedPomodoros: template.estimatedPomodoros,
          categoryId: template.categoryId,
          tags: template.tags,
          isRecurring: template.isRecurring,
          recurringType: template.recurringType,
          recurringInterval: template.recurringInterval,
        })
        .returning();

      // Create tasks from template items
      for (const item of items) {
        const [task] = await tx
          .insert(tasks)
          .values({
            userId,
            title: item.title,
            description: item.description,
            priority: item.priority,
            estimatedPomodoros: item.estimatedPomodoros,
            categoryId: item.categoryId,
            tags: item.tags,
          })
          .returning();

        createdTasks[item.id] = task.id;
      }

      // Create dependencies between tasks
      for (const dependency of dependencies) {
        const taskId = createdTasks[dependency.itemId];
        const dependsOnTaskId = createdTasks[dependency.dependsOnItemId];

        if (taskId && dependsOnTaskId) {
          await tx.insert(taskDependencies).values({
            taskId,
            dependsOnTaskId,
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Created ${
        Object.keys(createdTasks).length
      } tasks from template`,
    });
  } catch (error) {
    console.error("Error applying task template:", error);
    return NextResponse.json(
      { error: "Failed to apply task template" },
      { status: 500 }
    );
  }
}
