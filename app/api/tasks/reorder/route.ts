import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { tasks } from "@/lib/server/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// PATCH /api/tasks/reorder - Update the order of tasks
export async function PATCH(request: NextRequest) {
  try {
    // Get the session using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { taskIds } = await request.json();

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Expected an array of task IDs." },
        { status: 400 }
      );
    }

    // Update the order of each task
    const updates = await Promise.all(
      taskIds.map(async (taskId, index) => {
        // Verify the task belongs to the user
        const [taskToUpdate] = await db
          .select()
          .from(tasks)
          .where(eq(tasks.id, taskId))
          .limit(1);

        if (!taskToUpdate || taskToUpdate.userId !== userId) {
          throw new Error(`Task ${taskId} not found or not owned by user`);
        }

        // Update the task order
        return db
          .update(tasks)
          .set({ order: index, updatedAt: new Date() })
          .where(eq(tasks.id, taskId));
      })
    );

    return NextResponse.json(
      { message: "Tasks reordered successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reordering tasks:", error);
    return NextResponse.json(
      { error: "Failed to reorder tasks" },
      { status: 500 }
    );
  }
}
