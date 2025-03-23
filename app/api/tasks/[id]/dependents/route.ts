import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { tasks, taskDependencies } from "@/lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/tasks/[id]/dependents - Get all tasks that depend on this task
export async function GET(
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
    const taskId = params.id;

    // Check if task exists and belongs to user
    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get all tasks that depend on this task
    const dependents = await db.query.taskDependencies.findMany({
      where: eq(taskDependencies.dependsOnTaskId, taskId),
      with: {
        task: true,
      },
    });

    // Return just the dependent tasks
    const dependentTasks = dependents.map((dep) => dep.task);

    return NextResponse.json(dependentTasks);
  } catch (error) {
    console.error("Error fetching task dependents:", error);
    return NextResponse.json(
      { error: "Failed to fetch task dependents" },
      { status: 500 }
    );
  }
}
