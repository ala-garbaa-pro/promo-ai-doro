import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import {
  collaborativeSessions,
  sessionParticipants,
  sessionMessages,
} from "@/lib/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { headers } from "next/headers";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/collaborative-sessions/[id]/join
 *
 * Join a collaborative session
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
        with: {
          participants: {
            where: isNull(sessionParticipants.leftAt),
          },
        },
      }
    );

    if (!collaborativeSession) {
      return NextResponse.json(
        { error: "Collaborative session not found" },
        { status: 404 }
      );
    }

    // Check if the session is public or the user is invited
    if (!collaborativeSession.isPublic) {
      // TODO: Check if the user is invited
      return NextResponse.json(
        { error: "This session is private" },
        { status: 403 }
      );
    }

    // Check if the session is full
    if (
      collaborativeSession.maxParticipants > 0 &&
      collaborativeSession.participants.length >=
        collaborativeSession.maxParticipants
    ) {
      return NextResponse.json(
        { error: "This session is full" },
        { status: 400 }
      );
    }

    // Check if the user is already a participant
    const existingParticipant = collaborativeSession.participants.find(
      (participant) => participant.userId === userId
    );

    if (existingParticipant) {
      return NextResponse.json(
        { error: "You are already a participant in this session" },
        { status: 400 }
      );
    }

    // Add the user as a participant
    const [participant] = await db
      .insert(sessionParticipants)
      .values({
        sessionId: id,
        userId,
        status: "joined",
      })
      .returning();

    // Add a system message
    await db.insert(sessionMessages).values({
      sessionId: id,
      userId,
      message: "joined the session",
      type: "system",
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error joining collaborative session:", error);
    return NextResponse.json(
      { error: "Failed to join collaborative session" },
      { status: 500 }
    );
  }
}
