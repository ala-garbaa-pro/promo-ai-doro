import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import {
  completeSession,
  getSessionById,
} from "@/lib/server/services/session-service";
import { headers } from "next/headers";
import { generateDailyAnalytics } from "@/lib/server/services/analytics-service";

// GET /api/sessions/[id] - Get a session by ID
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
    const sessionId = params.id;

    // Get session
    const sessionData = await getSessionById(sessionId);

    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if the session belongs to the user
    if (sessionData.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error getting session:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}

// PATCH /api/sessions/[id] - Complete a session
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
    const sessionId = params.id;

    // Get session to check ownership
    const sessionData = await getSessionById(sessionId);

    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if the session belongs to the user
    if (sessionData.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { wasInterrupted, interruptionCount, notes } = body;

    // Complete session
    const updatedSession = await completeSession({
      sessionId,
      wasInterrupted,
      interruptionCount,
      notes,
    });

    // Generate analytics for the day
    await generateDailyAnalytics(userId, new Date());

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error completing session:", error);
    return NextResponse.json(
      { error: "Failed to complete session" },
      { status: 500 }
    );
  }
}
