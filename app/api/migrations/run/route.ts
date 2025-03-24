import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { headers } from "next/headers";
import { runMigration as runTaskCategoriesMigration } from "@/lib/server/db/migrations/add-task-categories-junction";
import { runMigration as runTaskTemplatesMigration } from "@/lib/server/db/migrations/add-task-templates";
import { runMigration as runTaskTextTemplatesMigration } from "@/lib/server/db/migrations/add-task-text-to-templates";

// POST /api/migrations/run - Run database migrations
export async function POST(request: NextRequest) {
  try {
    // Get the session using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admin users to run migrations
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: "Only admin users can run migrations" },
        { status: 403 }
      );
    }

    // Parse request body to determine which migration to run
    const body = await request.json();
    const { migrationType } = body;

    if (migrationType === "taskTemplates") {
      // Run task templates migration
      await runTaskTemplatesMigration();
    } else if (migrationType === "taskTextTemplates") {
      // Run task text templates migration
      await runTaskTextTemplatesMigration();
    } else {
      // Default to task categories migration
      await runTaskCategoriesMigration();
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
    });
  } catch (error) {
    console.error("Error running migration:", error);
    return NextResponse.json(
      { error: "Failed to run migration" },
      { status: 500 }
    );
  }
}
