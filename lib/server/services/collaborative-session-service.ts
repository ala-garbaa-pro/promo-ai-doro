import { db } from "@/lib/server/db";
import {
  collaborativeSessions,
  sessionParticipants,
  sessionMessages,
  users,
} from "@/lib/server/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

/**
 * Get a collaborative session by ID with participants and messages
 */
export async function getCollaborativeSessionById(sessionId: string) {
  try {
    const session = await db.query.collaborativeSessions.findFirst({
      where: eq(collaborativeSessions.id, sessionId),
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
          where: isNull(sessionParticipants.leftAt),
        },
      },
    });

    if (!session) {
      return null;
    }

    // Get recent messages
    const messages = await db
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
      .where(eq(sessionMessages.sessionId, sessionId))
      .orderBy(desc(sessionMessages.createdAt))
      .limit(50);

    return {
      ...session,
      messages: messages.reverse(), // Return in chronological order
    };
  } catch (error) {
    console.error("Error getting collaborative session:", error);
    throw error;
  }
}

/**
 * Get all active participants in a session
 */
export async function getSessionParticipants(sessionId: string) {
  try {
    const participants = await db.query.sessionParticipants.findMany({
      where: and(
        eq(sessionParticipants.sessionId, sessionId),
        isNull(sessionParticipants.leftAt)
      ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: (participants, { asc }) => [asc(participants.joinedAt)],
    });

    return participants;
  } catch (error) {
    console.error("Error getting session participants:", error);
    throw error;
  }
}

/**
 * Check if a user is a participant in a session
 */
export async function isUserParticipant(sessionId: string, userId: string) {
  try {
    const participant = await db.query.sessionParticipants.findFirst({
      where: and(
        eq(sessionParticipants.sessionId, sessionId),
        eq(sessionParticipants.userId, userId),
        isNull(sessionParticipants.leftAt)
      ),
    });

    return !!participant;
  } catch (error) {
    console.error("Error checking if user is participant:", error);
    throw error;
  }
}

/**
 * Add a user as a participant to a session
 */
export async function addParticipant(sessionId: string, userId: string) {
  try {
    // Check if the user is already a participant
    const existingParticipant = await db.query.sessionParticipants.findFirst({
      where: and(
        eq(sessionParticipants.sessionId, sessionId),
        eq(sessionParticipants.userId, userId),
        isNull(sessionParticipants.leftAt)
      ),
    });

    if (existingParticipant) {
      return existingParticipant;
    }

    // Add the user as a participant
    const [participant] = await db
      .insert(sessionParticipants)
      .values({
        sessionId,
        userId,
        status: "joined",
      })
      .returning();

    // Add a system message
    await db.insert(sessionMessages).values({
      sessionId,
      userId,
      message: "joined the session",
      type: "system",
    });

    return participant;
  } catch (error) {
    console.error("Error adding participant:", error);
    throw error;
  }
}

/**
 * Remove a user as a participant from a session
 */
export async function removeParticipant(sessionId: string, userId: string) {
  try {
    // Check if the user is a participant
    const participant = await db.query.sessionParticipants.findFirst({
      where: and(
        eq(sessionParticipants.sessionId, sessionId),
        eq(sessionParticipants.userId, userId),
        isNull(sessionParticipants.leftAt)
      ),
    });

    if (!participant) {
      return null;
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
      sessionId,
      userId,
      message: "left the session",
      type: "system",
    });

    return updatedParticipant;
  } catch (error) {
    console.error("Error removing participant:", error);
    throw error;
  }
}

/**
 * Update a session's status
 */
export async function updateSessionStatus(sessionId: string, status: string) {
  try {
    const [updatedSession] = await db
      .update(collaborativeSessions)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(collaborativeSessions.id, sessionId))
      .returning();

    return updatedSession;
  } catch (error) {
    console.error("Error updating session status:", error);
    throw error;
  }
}

/**
 * Add a message to a session
 */
export async function addSessionMessage(
  sessionId: string,
  userId: string,
  message: string,
  type: string = "chat"
) {
  try {
    const [newMessage] = await db
      .insert(sessionMessages)
      .values({
        sessionId,
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

    return {
      ...newMessage,
      user,
    };
  } catch (error) {
    console.error("Error adding session message:", error);
    throw error;
  }
}

/**
 * Get recent messages for a session
 */
export async function getSessionMessages(
  sessionId: string,
  limit: number = 50,
  before?: Date
) {
  try {
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
      .where(eq(sessionMessages.sessionId, sessionId));

    // Add before filter if provided
    if (before) {
      query = query.where(
        and(
          eq(sessionMessages.sessionId, sessionId),
          sessionMessages.createdAt < before
        )
      );
    }

    const messages = await query
      .orderBy(desc(sessionMessages.createdAt))
      .limit(limit);

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error("Error getting session messages:", error);
    throw error;
  }
}

/**
 * Update a participant's status
 */
export async function updateParticipantStatus(
  sessionId: string,
  userId: string,
  status: string
) {
  try {
    // Check if the user is a participant
    const participant = await db.query.sessionParticipants.findFirst({
      where: and(
        eq(sessionParticipants.sessionId, sessionId),
        eq(sessionParticipants.userId, userId),
        isNull(sessionParticipants.leftAt)
      ),
    });

    if (!participant) {
      return null;
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

    return updatedParticipant;
  } catch (error) {
    console.error("Error updating participant status:", error);
    throw error;
  }
}

/**
 * Get all active collaborative sessions
 */
export async function getActiveCollaborativeSessions(
  isPublic: boolean = true,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const sessions = await db
      .select({
        session: collaborativeSessions,
        creator: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
        participantCount: db.fn
          .count(sessionParticipants.id)
          .as("participant_count"),
      })
      .from(collaborativeSessions)
      .leftJoin(
        sessionParticipants,
        eq(collaborativeSessions.id, sessionParticipants.sessionId)
      )
      .leftJoin(users, eq(collaborativeSessions.creatorId, users.id))
      .where(
        and(
          isPublic ? eq(collaborativeSessions.isPublic, true) : undefined,
          eq(collaborativeSessions.status, "active")
        )
      )
      .groupBy(collaborativeSessions.id, users.id, users.name, users.image)
      .orderBy(desc(collaborativeSessions.createdAt))
      .limit(limit)
      .offset(offset);

    return sessions;
  } catch (error) {
    console.error("Error getting active collaborative sessions:", error);
    throw error;
  }
}
