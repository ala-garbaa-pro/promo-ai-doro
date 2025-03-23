import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { taskTemplates } from "@/lib/server/db/schema-templates";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/task-templates/[id] - Get a specific task template
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
    const templateId = params.id;

    // Get the template
    const template = await db.query.taskTemplates.findFirst({
      where: and(
        eq(taskTemplates.id, templateId),
        eq(taskTemplates.userId, userId)
      ),
      with: {
        category: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching task template:", error);
    return NextResponse.json(
      { error: "Failed to fetch task template" },
      { status: 500 }
    );
  }
}

// PATCH /api/task-templates/[id] - Update a task template
export async function PATCH(
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

    // Parse request body
    const body = await request.json();

    // Check if template exists and belongs to user
    const existingTemplate = await db
      .select()
      .from(taskTemplates)
      .where(
        and(eq(taskTemplates.id, templateId), eq(taskTemplates.userId, userId))
      )
      .limit(1);

    if (existingTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Update template
    const [updatedTemplate] = await db
      .update(taskTemplates)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(
        and(eq(taskTemplates.id, templateId), eq(taskTemplates.userId, userId))
      )
      .returning();

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating task template:", error);
    return NextResponse.json(
      { error: "Failed to update task template" },
      { status: 500 }
    );
  }
}

// DELETE /api/task-templates/[id] - Delete a task template
export async function DELETE(
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

    // Check if template exists and belongs to user
    const existingTemplate = await db
      .select()
      .from(taskTemplates)
      .where(
        and(eq(taskTemplates.id, templateId), eq(taskTemplates.userId, userId))
      )
      .limit(1);

    if (existingTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Delete template
    await db
      .delete(taskTemplates)
      .where(
        and(eq(taskTemplates.id, templateId), eq(taskTemplates.userId, userId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task template:", error);
    return NextResponse.json(
      { error: "Failed to delete task template" },
      { status: 500 }
    );
  }
}
