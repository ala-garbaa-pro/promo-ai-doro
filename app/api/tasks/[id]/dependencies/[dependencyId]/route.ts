import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { tasks, taskDependencies } from "@/lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

// DELETE /api/tasks/[id]/dependencies/[dependencyId] - Remove a dependency from a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; dependencyId: string } }
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
    const dependsOnTaskId = params.dependencyId;

    // Check if task exists and belongs to user
    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if dependency exists
    const dependency = await db.query.taskDependencies.findFirst({
      where: and(
        eq(taskDependencies.taskId, taskId),
        eq(taskDependencies.dependsOnTaskId, dependsOnTaskId)
      ),
    });

    if (!dependency) {
      return NextResponse.json(
        { error: "Dependency not found" },
        { status: 404 }
      );
    }

    // Delete dependency
    await db
      .delete(taskDependencies)
      .where(
        and(
          eq(taskDependencies.taskId, taskId),
          eq(taskDependencies.dependsOnTaskId, dependsOnTaskId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing task dependency:", error);
    return NextResponse.json(
      { error: "Failed to remove task dependency" },
      { status: 500 }
    );
  }
}
