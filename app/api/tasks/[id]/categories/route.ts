import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { tasks, categories } from "@/lib/server/db/schema";
import { taskCategories } from "@/lib/server/db/schema-update";
import { eq, and, inArray } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/tasks/[id]/categories - Get all categories for a task
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

    // Get all categories for the task
    const taskCategoriesResult = await db
      .select({
        categoryId: taskCategories.categoryId,
      })
      .from(taskCategories)
      .where(eq(taskCategories.taskId, taskId));

    const categoryIds = taskCategoriesResult.map((tc) => tc.categoryId);

    if (categoryIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get category details
    const taskCategoriesDetails = await db.query.categories.findMany({
      where: and(
        inArray(categories.id, categoryIds),
        eq(categories.userId, userId)
      ),
    });

    return NextResponse.json(taskCategoriesDetails);
  } catch (error) {
    console.error("Error fetching task categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch task categories" },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/categories - Add a category to a task
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
    const { categoryId } = body;

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
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

    // Check if category exists and belongs to user
    const category = await db.query.categories.findFirst({
      where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if the relationship already exists
    const existingRelation = await db
      .select()
      .from(taskCategories)
      .where(
        and(
          eq(taskCategories.taskId, taskId),
          eq(taskCategories.categoryId, categoryId)
        )
      );

    if (existingRelation.length > 0) {
      return NextResponse.json(
        { error: "Category already added to task" },
        { status: 400 }
      );
    }

    // Add category to task
    await db.insert(taskCategories).values({
      taskId,
      categoryId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding category to task:", error);
    return NextResponse.json(
      { error: "Failed to add category to task" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id]/categories - Replace all categories for a task
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
    const taskId = params.id;

    // Parse request body
    const body = await request.json();
    const { categoryIds } = body;

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: "Category IDs must be an array" },
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

    // Check if all categories exist and belong to user
    if (categoryIds.length > 0) {
      const foundCategories = await db.query.categories.findMany({
        where: and(
          inArray(categories.id, categoryIds),
          eq(categories.userId, userId)
        ),
      });

      if (foundCategories.length !== categoryIds.length) {
        return NextResponse.json(
          { error: "One or more categories not found" },
          { status: 404 }
        );
      }
    }

    // Transaction to replace categories
    await db.transaction(async (tx) => {
      // Delete all existing category relationships
      await tx.delete(taskCategories).where(eq(taskCategories.taskId, taskId));

      // Add new category relationships
      if (categoryIds.length > 0) {
        await tx.insert(taskCategories).values(
          categoryIds.map((categoryId) => ({
            taskId,
            categoryId,
          }))
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating task categories:", error);
    return NextResponse.json(
      { error: "Failed to update task categories" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]/categories/[categoryId] - Remove a category from a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
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

    // Get categoryId from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const categoryId = pathParts[pathParts.length - 1];

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
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

    // Delete the relationship
    await db
      .delete(taskCategories)
      .where(
        and(
          eq(taskCategories.taskId, taskId),
          eq(taskCategories.categoryId, categoryId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing category from task:", error);
    return NextResponse.json(
      { error: "Failed to remove category from task" },
      { status: 500 }
    );
  }
}
