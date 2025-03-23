import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { categories } from "@/lib/server/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// GET /api/categories - Get all categories for the current user
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

    // Get all categories for the user
    const userCategories = await db.query.categories.findMany({
      where: eq(categories.userId, userId),
      orderBy: categories.name,
    });

    return NextResponse.json(userCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
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
    const { name, color } = body;

    // Validate request body
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required and must be a string" },
        { status: 400 }
      );
    }

    if (!color || typeof color !== "string") {
      return NextResponse.json(
        { error: "Color is required and must be a string" },
        { status: 400 }
      );
    }

    // Create new category
    const [newCategory] = await db
      .insert(categories)
      .values({
        userId,
        name,
        color,
      })
      .returning();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
