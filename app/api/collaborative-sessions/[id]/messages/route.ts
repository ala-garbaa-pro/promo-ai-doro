import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import {
  collaborativeSessions,
  sessionParticipants,
  sessionMessages,
  users,
} from "@/lib/server/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { headers } from "next/headers";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/collaborative-sessions/[id]/messages
 *
 * Get messages for a collaborative session
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

    // Check if the user is a participant or the session is public
    const isParticipant = await db.query.sessionParticipants.findFirst({
      where: and(
        eq(sessionParticipants.sessionId, id),
        eq(sessionParticipants.userId, userId),
        isNull(sessionParticipants.leftAt)
      ),
    });

    if (!isParticipant && !collaborativeSession.isPublic) {
      return NextResponse.json(
        { error: "You don't have access to this session's messages" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before");

    // Get messages
    let query = db
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
      .where(eq(sessionMessages.sessionId, id));

    // Add before filter if provided
    if (before) {
      query = query.where(
        and(
          eq(sessionMessages.sessionId, id),
          sessionMessages.createdAt < new Date(before)
        )
      );
    }

    const messages = await query
      .orderBy(desc(sessionMessages.createdAt))
      .limit(limit);

    return NextResponse.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error("Error fetching session messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch session messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collaborative-sessions/[id]/messages
 *
 * Send a message in a collaborative session
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
    const isParticipant = await db.query.sessionParticipants.findFirst({
      where: and(
        eq(sessionParticipants.sessionId, id),
        eq(sessionParticipants.userId, userId),
        isNull(sessionParticipants.leftAt)
      ),
    });

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You must be a participant to send messages" },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { message, type = "chat" } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Validate message type
    const validTypes = ["chat", "goal", "progress"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid message type" },
        { status: 400 }
      );
    }

    // Create the message
    const [newMessage] = await db
      .insert(sessionMessages)
      .values({
        sessionId: id,
        userId,
        message,
        type,
      })
      .returning();

    // Get the user info
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json({
      ...newMessage,
      user,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
