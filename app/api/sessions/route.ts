import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import {
  createSession,
  getSessions,
} from "@/lib/server/services/session-service";
import { headers } from "next/headers";

// GET /api/sessions - Get sessions for the current user
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const type = searchParams.get("type") as any;
    const isCompletedParam = searchParams.get("isCompleted");
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    // Convert parameters to appropriate types
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;
    const isCompleted = isCompletedParam
      ? isCompletedParam === "true"
      : undefined;
    const limit = limitParam ? parseInt(limitParam) : undefined;
    const offset = offsetParam ? parseInt(offsetParam) : undefined;

    // Get sessions
    const sessions = await getSessions({
      userId,
      startDate,
      endDate,
      type,
      isCompleted,
      limit,
      offset,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error getting sessions:", error);
    return NextResponse.json(
      { error: "Failed to get sessions" },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
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
    const { type, duration, templateId } = body;

    // Validate required fields
    if (!type || !duration) {
      return NextResponse.json(
        { error: "Type and duration are required" },
        { status: 400 }
      );
    }

    // Create session
    const newSession = await createSession({
      userId,
      type,
      duration,
      templateId,
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
