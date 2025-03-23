import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { taskTemplates, templateItems } from "@/lib/server/db/schema-templates";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/task-templates/[id]/items/[itemId] - Get a specific template item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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
    const itemId = params.itemId;

    // Check if template exists and belongs to user
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

    // Get the template item
    const item = await db.query.templateItems.findFirst({
      where: and(
        eq(templateItems.id, itemId),
        eq(templateItems.templateId, templateId)
      ),
      with: {
        category: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Template item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching template item:", error);
    return NextResponse.json(
      { error: "Failed to fetch template item" },
      { status: 500 }
    );
  }
}

// PATCH /api/task-templates/[id]/items/[itemId] - Update a template item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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
    const itemId = params.itemId;

    // Check if template exists and belongs to user
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

    // Parse request body
    const body = await request.json();

    // Check if item exists and belongs to template
    const existingItem = await db
      .select()
      .from(templateItems)
      .where(
        and(
          eq(templateItems.id, itemId),
          eq(templateItems.templateId, templateId)
        )
      )
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        { error: "Template item not found" },
        { status: 404 }
      );
    }

    // Update template item
    const [updatedItem] = await db
      .update(templateItems)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(templateItems.id, itemId),
          eq(templateItems.templateId, templateId)
        )
      )
      .returning();

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating template item:", error);
    return NextResponse.json(
      { error: "Failed to update template item" },
      { status: 500 }
    );
  }
}

// DELETE /api/task-templates/[id]/items/[itemId] - Delete a template item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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
    const itemId = params.itemId;

    // Check if template exists and belongs to user
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

    // Check if item exists and belongs to template
    const existingItem = await db
      .select()
      .from(templateItems)
      .where(
        and(
          eq(templateItems.id, itemId),
          eq(templateItems.templateId, templateId)
        )
      )
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        { error: "Template item not found" },
        { status: 404 }
      );
    }

    // Delete template item
    await db
      .delete(templateItems)
      .where(
        and(
          eq(templateItems.id, itemId),
          eq(templateItems.templateId, templateId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template item:", error);
    return NextResponse.json(
      { error: "Failed to delete template item" },
      { status: 500 }
    );
  }
}
