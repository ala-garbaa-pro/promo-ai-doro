import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { headers } from "next/headers";
import { runMigration } from "@/lib/server/db/migrations/add-task-categories-junction";

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

    // Run the migration
    await runMigration();

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
