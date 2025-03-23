import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { tasks, taskDependencies } from "@/lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/tasks/[id]/dependencies - Get all dependencies for a task
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

    // Get all dependencies for the task
    const dependencies = await db.query.taskDependencies.findMany({
      where: eq(taskDependencies.taskId, taskId),
      with: {
        dependsOnTask: true,
      },
    });

    // Return just the dependency tasks
    const dependencyTasks = dependencies.map((dep) => dep.dependsOnTask);

    return NextResponse.json(dependencyTasks);
  } catch (error) {
    console.error("Error fetching task dependencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch task dependencies" },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/dependencies - Add a dependency to a task
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
    const taskId = params.id;

    // Parse request body
    const body = await request.json();
    const { dependsOnTaskId } = body;

    // Validate request body
    if (!dependsOnTaskId) {
      return NextResponse.json(
        { error: "dependsOnTaskId is required" },
        { status: 400 }
      );
    }

    // Check if task exists and belongs to user
    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if dependency task exists and belongs to user
    const dependencyTask = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, dependsOnTaskId), eq(tasks.userId, userId)),
    });

    if (!dependencyTask) {
      return NextResponse.json(
        { error: "Dependency task not found" },
        { status: 404 }
      );
    }

    // Check if dependency already exists
    const existingDependency = await db.query.taskDependencies.findFirst({
      where: and(
        eq(taskDependencies.taskId, taskId),
        eq(taskDependencies.dependsOnTaskId, dependsOnTaskId)
      ),
    });

    if (existingDependency) {
      return NextResponse.json(
        { error: "Dependency already exists" },
        { status: 400 }
      );
    }

    // Check for circular dependencies
    const circularCheck = await db.query.taskDependencies.findFirst({
      where: and(
        eq(taskDependencies.taskId, dependsOnTaskId),
        eq(taskDependencies.dependsOnTaskId, taskId)
      ),
    });

    if (circularCheck) {
      return NextResponse.json(
        { error: "Circular dependency detected" },
        { status: 400 }
      );
    }

    // Create new dependency
    const [newDependency] = await db
      .insert(taskDependencies)
      .values({
        taskId,
        dependsOnTaskId,
      })
      .returning();

    return NextResponse.json(newDependency, { status: 201 });
  } catch (error) {
    console.error("Error adding task dependency:", error);
    return NextResponse.json(
      { error: "Failed to add task dependency" },
      { status: 500 }
    );
  }
}
