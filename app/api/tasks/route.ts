import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { tasks } from "@/lib/server/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

// GET /api/tasks - Get all tasks for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the session using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const dueDate = searchParams.get("dueDate");

    // Build query
    let query = db.select().from(tasks).where(eq(tasks.userId, userId));

    // Apply filters if provided
    if (status) {
      query = query.where(eq(tasks.status, status as any));
    }

    if (category) {
      query = query.where(eq(tasks.category, category));
    }

    if (priority) {
      query = query.where(eq(tasks.priority, priority as any));
    }

    // Execute query
    const userTasks = await query.orderBy(tasks.createdAt);

    return NextResponse.json(userTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    // Get the session using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      priority,
      status,
      estimatedPomodoros,
      dueDate,
      category,
      tags,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create task
    const result = await db
      .insert(tasks)
      .values({
        userId,
        title,
        description,
        priority: priority || "medium",
        status: status || "pending",
        estimatedPomodoros,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        category,
        tags,
      })
      .returning();

    const newTask = result[0];

    return NextResponse.json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
