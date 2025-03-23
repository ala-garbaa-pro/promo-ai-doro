import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import {
  collaborativeSessions,
  sessionParticipants,
  sessionMessages,
  users,
} from "@/lib/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/collaborative-sessions/[id]
 *
 * Get a specific collaborative session by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Get the collaborative session
    const collaborativeSession = await db.query.collaborativeSessions.findFirst(
      {
        where: eq(collaborativeSessions.id, id),
        with: {
          creator: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          participants: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            where: eq(sessionParticipants.leftAt, null),
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

    // Check if the session is public or the user is a participant
    const isPublic = collaborativeSession.isPublic;
    const isParticipant = collaborativeSession.participants.some(
      (participant) => participant.userId === userId
    );
    const isCreator = collaborativeSession.creatorId === userId;

    if (!isPublic && !isParticipant && !isCreator) {
      return NextResponse.json(
        { error: "You don't have access to this session" },
        { status: 403 }
      );
    }

    // Get recent messages
    const recentMessages = await db
      .select({
        id: sessionMessages.id,
        message: sessionMessages.message,
        type: sessionMessages.type,
        createdAt: sessionMessages.createdAt,
        user: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(sessionMessages)
      .leftJoin(users, eq(sessionMessages.userId, users.id))
      .where(eq(sessionMessages.sessionId, id))
      .orderBy(desc(sessionMessages.createdAt))
      .limit(50);

    // Return the session with messages
    return NextResponse.json({
      ...collaborativeSession,
      messages: recentMessages.reverse(), // Return in chronological order
    });
  } catch (error) {
    console.error("Error fetching collaborative session:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborative session" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/collaborative-sessions/[id]
 *
 * Update a collaborative session
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

    // Check if the session exists and the user is the creator
    const existingSession = await db.query.collaborativeSessions.findFirst({
      where: eq(collaborativeSessions.id, id),
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Collaborative session not found" },
        { status: 404 }
      );
    }

    if (existingSession.creatorId !== userId) {
      return NextResponse.json(
        { error: "Only the creator can update the session" },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const {
      name,
      description,
      isPublic,
      maxParticipants,
      workDuration,
      breakDuration,
      longBreakDuration,
      sessionsBeforeLongBreak,
      startTime,
      endTime,
      status,
    } = body;

    // Update the session
    const [updatedSession] = await db
      .update(collaborativeSessions)
      .set({
        name: name || existingSession.name,
        description:
          description !== undefined ? description : existingSession.description,
        isPublic: isPublic !== undefined ? isPublic : existingSession.isPublic,
        maxParticipants: maxParticipants || existingSession.maxParticipants,
        workDuration: workDuration || existingSession.workDuration,
        breakDuration: breakDuration || existingSession.breakDuration,
        longBreakDuration:
          longBreakDuration || existingSession.longBreakDuration,
        sessionsBeforeLongBreak:
          sessionsBeforeLongBreak || existingSession.sessionsBeforeLongBreak,
        startTime: startTime ? new Date(startTime) : existingSession.startTime,
        endTime: endTime ? new Date(endTime) : existingSession.endTime,
        status: status || existingSession.status,
        updatedAt: new Date(),
      })
      .where(eq(collaborativeSessions.id, id))
      .returning();

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating collaborative session:", error);
    return NextResponse.json(
      { error: "Failed to update collaborative session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collaborative-sessions/[id]
 *
 * Delete a collaborative session
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check if the session exists and the user is the creator
    const existingSession = await db.query.collaborativeSessions.findFirst({
      where: eq(collaborativeSessions.id, id),
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Collaborative session not found" },
        { status: 404 }
      );
    }

    if (existingSession.creatorId !== userId) {
      return NextResponse.json(
        { error: "Only the creator can delete the session" },
        { status: 403 }
      );
    }

    // Delete the session (cascade will delete participants and messages)
    await db
      .delete(collaborativeSessions)
      .where(eq(collaborativeSessions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collaborative session:", error);
    return NextResponse.json(
      { error: "Failed to delete collaborative session" },
      { status: 500 }
    );
  }
}
