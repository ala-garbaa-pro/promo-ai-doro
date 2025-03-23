import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import {
  collaborativeSessions,
  sessionParticipants,
} from "@/lib/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { headers } from "next/headers";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PUT /api/collaborative-sessions/[id]/status
 *
 * Update a participant's status in a collaborative session
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Get the session using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;

    // Check if the session exists
    const collaborativeSession = await db.query.collaborativeSessions.findFirst(
      {
        where: eq(collaborativeSessions.id, id),
      }
    );

    if (!collaborativeSession) {
      return NextResponse.json(
        { error: "Collaborative session not found" },
        { status: 404 }
      );
    }

    // Check if the user is a participant
    const participant = await db.query.sessionParticipants.findFirst({
      where: and(
        eq(sessionParticipants.sessionId, id),
        eq(sessionParticipants.userId, userId),
        isNull(sessionParticipants.leftAt)
      ),
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not a participant in this session" },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["joined", "active", "on_break", "away"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update the participant's status
    const [updatedParticipant] = await db
      .update(sessionParticipants)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(sessionParticipants.id, participant.id))
      .returning();

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error("Error updating participant status:", error);
    return NextResponse.json(
      { error: "Failed to update participant status" },
      { status: 500 }
    );
  }
}
