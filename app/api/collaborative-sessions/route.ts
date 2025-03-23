import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import {
  collaborativeSessions,
  sessionParticipants,
  users,
} from "@/lib/server/db/schema";
import { eq, and, gte, desc, count, sql } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * GET /api/collaborative-sessions
 *
 * Get all available collaborative sessions
 */
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
    const status = searchParams.get("status") || "active,scheduled";
    const isPublic = searchParams.get("isPublic") !== "false"; // Default to true
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Parse status filter
    const statusValues = status.split(",");

    // Query to get sessions with participant count
    const sessionsWithParticipants = await db
      .select({
        session: collaborativeSessions,
        creator: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
        participantCount: count(sessionParticipants.id).as("participant_count"),
        isParticipating: sql<boolean>`
          EXISTS (
            SELECT 1 FROM ${sessionParticipants}
            WHERE ${sessionParticipants.sessionId} = ${collaborativeSessions.id}
            AND ${sessionParticipants.userId} = ${userId}
            AND ${sessionParticipants.leftAt} IS NULL
          )
        `.as("is_participating"),
      })
      .from(collaborativeSessions)
      .leftJoin(
        sessionParticipants,
        eq(collaborativeSessions.id, sessionParticipants.sessionId)
      )
      .leftJoin(users, eq(collaborativeSessions.creatorId, users.id))
      .where(
        and(
          isPublic ? eq(collaborativeSessions.isPublic, true) : sql`1=1`,
          statusValues.length > 0
            ? sql`${collaborativeSessions.status} IN (${statusValues.join(
                ","
              )})`
            : sql`1=1`
        )
      )
      .groupBy(collaborativeSessions.id, users.id, users.name, users.image)
      .orderBy(desc(collaborativeSessions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(sessionsWithParticipants);
  } catch (error) {
    console.error("Error fetching collaborative sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborative sessions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collaborative-sessions
 *
 * Create a new collaborative session
 */
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
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Session name is required" },
        { status: 400 }
      );
    }

    // Create the collaborative session
    const [newSession] = await db
      .insert(collaborativeSessions)
      .values({
        creatorId: userId,
        name,
        description,
        isPublic: isPublic !== false, // Default to true
        maxParticipants: maxParticipants || 10,
        workDuration: workDuration || 25 * 60,
        breakDuration: breakDuration || 5 * 60,
        longBreakDuration: longBreakDuration || 15 * 60,
        sessionsBeforeLongBreak: sessionsBeforeLongBreak || 4,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        status: "scheduled",
      })
      .returning();

    // Add the creator as a participant
    await db.insert(sessionParticipants).values({
      sessionId: newSession.id,
      userId,
      status: "joined",
    });

    // Return the created session
    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Error creating collaborative session:", error);
    return NextResponse.json(
      { error: "Failed to create collaborative session" },
      { status: 500 }
    );
  }
}
