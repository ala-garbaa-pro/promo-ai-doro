import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { taskTemplates } from "@/lib/server/db/schema-templates";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/task-templates - Get all task templates for the current user
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

    // Get all templates for the user
    const templates = await db.query.taskTemplates.findMany({
      where: eq(taskTemplates.userId, userId),
      orderBy: (templates, { desc }) => [desc(templates.updatedAt)],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching task templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch task templates" },
      { status: 500 }
    );
  }
}

// POST /api/task-templates - Create a new task template
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
      name,
      description,
      priority,
      estimatedPomodoros,
      categoryId,
      tags,
      isRecurring,
      recurringType,
      recurringInterval,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create new template
    const [newTemplate] = await db
      .insert(taskTemplates)
      .values({
        userId,
        name,
        description,
        priority,
        estimatedPomodoros,
        categoryId,
        tags,
        isRecurring,
        recurringType,
        recurringInterval,
      })
      .returning();

    return NextResponse.json(newTemplate);
  } catch (error) {
    console.error("Error creating task template:", error);
    return NextResponse.json(
      { error: "Failed to create task template" },
      { status: 500 }
    );
  }
}
