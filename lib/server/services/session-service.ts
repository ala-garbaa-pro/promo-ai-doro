import { db } from "@/lib/server/db";
import { sessions, sessionTypeEnum } from "@/lib/server/db/schema";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";

export type SessionType = "work" | "short_break" | "long_break";
export type SessionStatus = "completed" | "interrupted" | "in_progress";

export interface CreateSessionParams {
  userId: string;
  type: SessionType;
  duration: number; // in minutes
  templateId?: string;
}

export interface CompleteSessionParams {
  sessionId: string;
  wasInterrupted?: boolean;
  interruptionCount?: number;
  notes?: string;
}

export interface GetSessionsParams {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  type?: SessionType;
  isCompleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  completionRate: number;
}

/**
 * Create a new session
 */
export async function createSession(params: CreateSessionParams) {
  try {
    const { userId, type, duration, templateId } = params;

    const [newSession] = await db
      .insert(sessions)
      .values({
        userId,
        type: type as any, // Cast to the enum type
        duration,
        templateId,
        startedAt: new Date(),
        isCompleted: false,
      })
      .returning();

    return newSession;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

/**
 * Complete a session
 */
export async function completeSession(params: CompleteSessionParams) {
  try {
    const { sessionId, wasInterrupted, interruptionCount, notes } = params;

    const [updatedSession] = await db
      .update(sessions)
      .set({
        completedAt: new Date(),
        isCompleted: true,
        wasInterrupted: wasInterrupted || false,
        interruptionCount: interruptionCount || 0,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, sessionId))
      .returning();

    return updatedSession;
  } catch (error) {
    console.error("Error completing session:", error);
    throw error;
  }
}

/**
 * Get sessions for a user
 */
export async function getSessions(params: GetSessionsParams) {
  try {
    const {
      userId,
      startDate,
      endDate,
      type,
      isCompleted,
      limit = 10,
      offset = 0,
    } = params;

    let query = db.select().from(sessions).where(eq(sessions.userId, userId));

    if (startDate) {
      query = query.where(gte(sessions.startedAt, startDate));
    }

    if (endDate) {
      query = query.where(lte(sessions.startedAt, endDate));
    }

    if (type) {
      query = query.where(eq(sessions.type, type as any));
    }

    if (isCompleted !== undefined) {
      query = query.where(eq(sessions.isCompleted, isCompleted));
    }

    const results = await query
      .orderBy(desc(sessions.startedAt))
      .limit(limit)
      .offset(offset);

    return results;
  } catch (error) {
    console.error("Error getting sessions:", error);
    throw error;
  }
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string) {
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));

    return session;
  } catch (error) {
    console.error("Error getting session by ID:", error);
    throw error;
  }
}

/**
 * Get session stats for a user
 */
export async function getSessionStats(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<SessionStats> {
  try {
    let query = db
      .select({
        totalSessions: count(sessions.id),
        completedSessions: count(
          and(
            eq(sessions.isCompleted, true),
            eq(sessions.wasInterrupted, false)
          )
        ),
        totalWorkMinutes: sql<number>`SUM(CASE WHEN ${sessions.type} = 'work' AND ${sessions.isCompleted} = true THEN ${sessions.duration} ELSE 0 END)`,
        totalBreakMinutes: sql<number>`SUM(CASE WHEN (${sessions.type} = 'short_break' OR ${sessions.type} = 'long_break') AND ${sessions.isCompleted} = true THEN ${sessions.duration} ELSE 0 END)`,
      })
      .from(sessions)
      .where(eq(sessions.userId, userId));

    if (startDate) {
      query = query.where(gte(sessions.startedAt, startDate));
    }

    if (endDate) {
      query = query.where(lte(sessions.startedAt, endDate));
    }

    const [result] = await query;

    const totalSessions = Number(result.totalSessions) || 0;
    const completedSessions = Number(result.completedSessions) || 0;
    const totalWorkMinutes = Number(result.totalWorkMinutes) || 0;
    const totalBreakMinutes = Number(result.totalBreakMinutes) || 0;

    return {
      totalSessions,
      completedSessions,
      totalWorkMinutes,
      totalBreakMinutes,
      completionRate:
        totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    };
  } catch (error) {
    console.error("Error getting session stats:", error);
    throw error;
  }
}

/**
 * Get daily completed pomodoros for a user
 */
export async function getDailyCompletedPomodoros(userId: string, date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db
      .select({
        count: count(sessions.id),
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.type, "work"),
          eq(sessions.isCompleted, true),
          gte(sessions.startedAt, startOfDay),
          lte(sessions.startedAt, endOfDay)
        )
      );

    return Number(result[0]?.count) || 0;
  } catch (error) {
    console.error("Error getting daily completed pomodoros:", error);
    throw error;
  }
}

/**
 * Get current streak (consecutive days with completed pomodoros)
 */
export async function getCurrentStreak(userId: string) {
  try {
    // Get all completed work sessions
    const completedSessions = await db
      .select({
        date: sql<string>`DATE(${sessions.startedAt})`,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.type, "work"),
          eq(sessions.isCompleted, true)
        )
      )
      .orderBy(desc(sessions.startedAt));

    if (completedSessions.length === 0) {
      return 0;
    }

    // Get unique dates
    const uniqueDates = Array.from(
      new Set(completedSessions.map((session) => session.date))
    );

    // Check for streak
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(uniqueDates[0]);

    // If the most recent date is not today or yesterday, streak is broken
    const dayDiff = Math.floor(
      (today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff > 1) {
      return 0;
    }

    // Count consecutive days
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);

      const diffTime = prevDate.getTime() - currDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("Error getting current streak:", error);
    throw error;
  }
}
