import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { processRecurringTasks } from "@/lib/server/services/recurring-tasks";
import { headers } from "next/headers";

// POST /api/tasks/recurring/process - Process recurring tasks
export async function POST(request: NextRequest) {
  try {
    // Get the session using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an admin (optional, depending on your requirements)
    // const isAdmin = session.user.role === "admin";
    // if (!isAdmin) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Process recurring tasks
    const results = await processRecurringTasks();

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error processing recurring tasks:", error);
    return NextResponse.json(
      { error: "Failed to process recurring tasks" },
      { status: 500 }
    );
  }
}
