import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { taskTemplates, templateItems } from "@/lib/server/db/schema-templates";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/task-templates/[id]/items - Get all items for a task template
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

    // Get all items for the template
    const items = await db.query.templateItems.findMany({
      where: eq(templateItems.templateId, templateId),
      orderBy: (items, { asc }) => [asc(items.order)],
      with: {
        category: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching template items:", error);
    return NextResponse.json(
      { error: "Failed to fetch template items" },
      { status: 500 }
    );
  }
}

// POST /api/task-templates/[id]/items - Create a new template item
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
    const {
      title,
      description,
      priority,
      estimatedPomodoros,
      categoryId,
      tags,
      order,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get the highest order if not provided
    let itemOrder = order;
    if (itemOrder === undefined) {
      const highestOrderItem = await db.query.templateItems.findFirst({
        where: eq(templateItems.templateId, templateId),
        orderBy: (items, { desc }) => [desc(items.order)],
      });

      itemOrder = highestOrderItem ? highestOrderItem.order + 1 : 0;
    }

    // Create new template item
    const [newItem] = await db
      .insert(templateItems)
      .values({
        templateId,
        title,
        description,
        priority,
        estimatedPomodoros,
        categoryId,
        tags,
        order: itemOrder,
      })
      .returning();

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error creating template item:", error);
    return NextResponse.json(
      { error: "Failed to create template item" },
      { status: 500 }
    );
  }
}

// PUT /api/task-templates/[id]/items/reorder - Reorder template items
export async function PUT(
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
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items must be an array" },
        { status: 400 }
      );
    }

    // Transaction to update item orders
    await db.transaction(async (tx) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await tx
          .update(templateItems)
          .set({ order: i, updatedAt: new Date() })
          .where(
            and(
              eq(templateItems.id, item.id),
              eq(templateItems.templateId, templateId)
            )
          );
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering template items:", error);
    return NextResponse.json(
      { error: "Failed to reorder template items" },
      { status: 500 }
    );
  }
}
