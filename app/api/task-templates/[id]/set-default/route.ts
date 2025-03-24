import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { headers } from "next/headers";
import { db } from "@/lib/server/db";
import { taskTemplates } from "@/lib/server/db/schema-templates";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const templateId = params.id;

    // Check if template exists and belongs to the user
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

    // Update all templates to not be default
    await db
      .update(taskTemplates)
      .set({ isDefault: false })
      .where(eq(taskTemplates.userId, userId));

    // Set the specified template as default
    const [updatedTemplate] = await db
      .update(taskTemplates)
      .set({ isDefault: true })
      .where(
        and(eq(taskTemplates.id, templateId), eq(taskTemplates.userId, userId))
      )
      .returning();

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error setting default template:", error);
    return NextResponse.json(
      { error: "Failed to set default template" },
      { status: 500 }
    );
  }
}
