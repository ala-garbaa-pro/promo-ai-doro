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
 * POST /api/collaborative-sessions/[id]/leave
 *
 * Leave a collaborative session
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
        { status: 400 }
      );
    }

    // Update the participant record
    const [updatedParticipant] = await db
      .update(sessionParticipants)
      .set({
        leftAt: new Date(),
        status: "left",
        updatedAt: new Date(),
      })
      .where(eq(sessionParticipants.id, participant.id))
      .returning();

    // Add a system message
    await db.insert(sessionMessages).values({
      sessionId: id,
      userId,
      message: "left the session",
      type: "system",
    });

    // If the user is the creator and there are other participants, transfer ownership
    if (collaborativeSession.creatorId === userId) {
      const remainingParticipants = await db.query.sessionParticipants.findMany(
        {
          where: and(
            eq(sessionParticipants.sessionId, id),
            isNull(sessionParticipants.leftAt)
          ),
          orderBy: (participants, { asc }) => [asc(participants.joinedAt)],
        }
      );

      if (remainingParticipants.length > 0) {
        const newCreator = remainingParticipants[0];
        await db
          .update(collaborativeSessions)
          .set({
            creatorId: newCreator.userId,
            updatedAt: new Date(),
          })
          .where(eq(collaborativeSessions.id, id));

        // Add a system message about the ownership transfer
        await db.insert(sessionMessages).values({
          sessionId: id,
          userId: newCreator.userId,
          message: "is now the session host",
          type: "system",
        });
      } else {
        // If no participants left, mark the session as completed
        await db
          .update(collaborativeSessions)
          .set({
            status: "completed",
            endTime: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(collaborativeSessions.id, id));
      }
    }

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error("Error leaving collaborative session:", error);
    return NextResponse.json(
      { error: "Failed to leave collaborative session" },
      { status: 500 }
    );
  }
}
