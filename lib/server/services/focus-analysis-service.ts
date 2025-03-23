import { db } from "@/lib/server/db";
import { sessions, analytics, users, tasks } from "@/lib/server/db/schema";
import { eq, and, gte, lte, count, avg, sum, desc, sql } from "drizzle-orm";

export interface FocusMetrics {
  focusScore: number;
  completedSessions: number;
  totalFocusTime: number; // in minutes
  averageSessionLength: number; // in minutes
  streak: number;
  mostProductiveTime: string;
  completedTasks: number;
  interruptionRate: number; // average interruptions per session
  focusTrend: "improving" | "stable" | "declining";
  recommendedSessionLength: number; // in minutes
  recommendedBreakLength: number; // in minutes
}

export async function calculateFocusScore(userId: string): Promise<number> {
  try {
    // Get user's sessions from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userSessions = await db
      .select({
        totalSessions: count(sessions.id),
        completedSessions: count(
          and(
            eq(sessions.isCompleted, true),
            eq(sessions.wasInterrupted, false)
          )
        ),
        avgInterruptions: avg(sessions.interruptionCount),
        totalFocusTime: sum(sessions.duration),
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.type, "work"),
          gte(sessions.startedAt, thirtyDaysAgo)
        )
      );

    if (!userSessions[0] || userSessions[0].totalSessions === 0) {
      return 0;
    }

    // Get user's completed tasks
    const userTasks = await db
      .select({
        totalTasks: count(tasks.id),
        completedTasks: count(eq(tasks.status, "completed")),
      })
      .from(tasks)
      .where(eq(tasks.userId, userId));

    // Calculate consistency (days with at least one session in the last 30 days)
    const sessionDays = await db
      .select({
        distinctDays: sql<number>`COUNT(DISTINCT DATE(${sessions.startedAt}))`,
      })
      .from(sessions)
      .where(
        and(eq(sessions.userId, userId), gte(sessions.startedAt, thirtyDaysAgo))
      );

    const consistencyScore = sessionDays[0]?.distinctDays
      ? (sessionDays[0].distinctDays / 30) * 100
      : 0;

    // Calculate completion rate
    const completionRate =
      userSessions[0].totalSessions > 0
        ? (userSessions[0].completedSessions / userSessions[0].totalSessions) *
          100
        : 0;

    // Calculate interruption penalty
    const avgInterruptions = userSessions[0].avgInterruptions || 0;
    const interruptionPenalty = Math.min(avgInterruptions * 5, 20); // Max 20% penalty

    // Calculate task completion rate
    const taskCompletionRate =
      userTasks[0].totalTasks > 0
        ? (userTasks[0].completedTasks / userTasks[0].totalTasks) * 100
        : 0;

    // Calculate focus score (weighted average)
    const focusScore = Math.round(
      completionRate * 0.4 + // 40% weight for session completion
        consistencyScore * 0.3 + // 30% weight for consistency
        taskCompletionRate * 0.3 - // 30% weight for task completion
        interruptionPenalty // Penalty for interruptions
    );

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, focusScore));
  } catch (error) {
    console.error("Error calculating focus score:", error);
    return 0;
  }
}

export async function getFocusMetrics(
  userId: string
): Promise<FocusMetrics | null> {
  try {
    // Calculate focus score
    const focusScore = await calculateFocusScore(userId);

    // Get session metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessionMetrics = await db
      .select({
        completedSessions: count(
          and(eq(sessions.isCompleted, true), eq(sessions.type, "work"))
        ),
        totalFocusTime: sum(sessions.duration),
        avgSessionLength: avg(sessions.duration),
        avgInterruptions: avg(sessions.interruptionCount),
      })
      .from(sessions)
      .where(
        and(eq(sessions.userId, userId), gte(sessions.startedAt, thirtyDaysAgo))
      );

    // Get completed tasks count
    const taskMetrics = await db
      .select({
        completedTasks: count(tasks.id),
      })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "completed")));

    // Calculate streak (consecutive days with completed sessions)
    const streak = await calculateStreak(userId);

    // Determine most productive time
    const productiveTime = await determineMostProductiveTime(userId);

    // Calculate focus trend
    const focusTrend = await calculateFocusTrend(userId);

    // Calculate recommended session and break lengths
    const { recommendedSessionLength, recommendedBreakLength } =
      await calculateRecommendedDurations(userId);

    return {
      focusScore,
      completedSessions: sessionMetrics[0]?.completedSessions || 0,
      totalFocusTime: sessionMetrics[0]?.totalFocusTime || 0,
      averageSessionLength: Math.round(
        sessionMetrics[0]?.avgSessionLength || 0
      ),
      streak,
      mostProductiveTime: productiveTime,
      completedTasks: taskMetrics[0]?.completedTasks || 0,
      interruptionRate: sessionMetrics[0]?.avgInterruptions || 0,
      focusTrend,
      recommendedSessionLength,
      recommendedBreakLength,
    };
  } catch (error) {
    console.error("Error getting focus metrics:", error);
    return null;
  }
}

async function calculateStreak(userId: string): Promise<number> {
  try {
    // Get all days with completed sessions, ordered by date
    const sessionDays = await db
      .select({
        date: sql<string>`DATE(${sessions.startedAt})`,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.isCompleted, true),
          eq(sessions.type, "work")
        )
      )
      .groupBy(sql`DATE(${sessions.startedAt})`)
      .orderBy(desc(sql`DATE(${sessions.startedAt})`));

    if (sessionDays.length === 0) {
      return 0;
    }

    // Check if the most recent day is today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentSessionDate = new Date(sessionDays[0].date);
    mostRecentSessionDate.setHours(0, 0, 0, 0);

    const isActiveStreak =
      mostRecentSessionDate.getTime() === today.getTime() ||
      mostRecentSessionDate.getTime() === yesterday.getTime();

    if (!isActiveStreak) {
      return 0;
    }

    // Calculate streak by checking consecutive days
    let streak = 1;
    for (let i = 0; i < sessionDays.length - 1; i++) {
      const currentDate = new Date(sessionDays[i].date);
      const nextDate = new Date(sessionDays[i + 1].date);

      // Check if dates are consecutive
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("Error calculating streak:", error);
    return 0;
  }
}

async function determineMostProductiveTime(userId: string): Promise<string> {
  try {
    // Divide the day into 4-hour blocks and count completed sessions
    const productiveBlocks = await db
      .select({
        timeBlock: sql<string>`
          CASE 
            WHEN EXTRACT(HOUR FROM ${sessions.startedAt}) BETWEEN 5 AND 8 THEN 'early morning (5-9 AM)'
            WHEN EXTRACT(HOUR FROM ${sessions.startedAt}) BETWEEN 9 AND 12 THEN 'morning (9 AM-1 PM)'
            WHEN EXTRACT(HOUR FROM ${sessions.startedAt}) BETWEEN 13 AND 16 THEN 'afternoon (1-5 PM)'
            WHEN EXTRACT(HOUR FROM ${sessions.startedAt}) BETWEEN 17 AND 20 THEN 'evening (5-9 PM)'
            ELSE 'night (9 PM-5 AM)'
          END
        `,
        completedSessions: count(sessions.id),
        avgDuration: avg(sessions.duration),
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.isCompleted, true),
          eq(sessions.type, "work")
        )
      )
      .groupBy(sql`timeBlock`)
      .orderBy(desc(sql`completedSessions`), desc(sql`avgDuration`));

    if (productiveBlocks.length === 0) {
      return "";
    }

    return productiveBlocks[0].timeBlock;
  } catch (error) {
    console.error("Error determining most productive time:", error);
    return "";
  }
}

async function calculateFocusTrend(
  userId: string
): Promise<"improving" | "stable" | "declining"> {
  try {
    // Compare focus scores from last week and the week before
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get metrics for week before last
    const olderWeekMetrics = await db
      .select({
        completionRate: sql<number>`
          SUM(CASE WHEN ${sessions.isCompleted} = true THEN 1 ELSE 0 END) * 100.0 / 
          COUNT(${sessions.id})
        `,
        avgInterruptions: avg(sessions.interruptionCount),
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.type, "work"),
          gte(sessions.startedAt, twoWeeksAgo),
          lte(sessions.startedAt, oneWeekAgo)
        )
      );

    // Get metrics for last week
    const recentWeekMetrics = await db
      .select({
        completionRate: sql<number>`
          SUM(CASE WHEN ${sessions.isCompleted} = true THEN 1 ELSE 0 END) * 100.0 / 
          COUNT(${sessions.id})
        `,
        avgInterruptions: avg(sessions.interruptionCount),
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.type, "work"),
          gte(sessions.startedAt, oneWeekAgo)
        )
      );

    // If no data for either period, return stable
    if (
      !olderWeekMetrics[0]?.completionRate ||
      !recentWeekMetrics[0]?.completionRate
    ) {
      return "stable";
    }

    // Calculate simple score for each week
    const olderScore =
      olderWeekMetrics[0].completionRate -
      (olderWeekMetrics[0].avgInterruptions || 0) * 5;

    const recentScore =
      recentWeekMetrics[0].completionRate -
      (recentWeekMetrics[0].avgInterruptions || 0) * 5;

    // Determine trend
    const difference = recentScore - olderScore;

    if (difference >= 5) {
      return "improving";
    } else if (difference <= -5) {
      return "declining";
    } else {
      return "stable";
    }
  } catch (error) {
    console.error("Error calculating focus trend:", error);
    return "stable";
  }
}

async function calculateRecommendedDurations(userId: string): Promise<{
  recommendedSessionLength: number;
  recommendedBreakLength: number;
}> {
  try {
    // Get user's most successful session durations
    const successfulSessions = await db
      .select({
        duration: sessions.duration,
        interruptionCount: sessions.interruptionCount,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.isCompleted, true),
          eq(sessions.type, "work")
        )
      )
      .orderBy(sessions.interruptionCount);

    // Default recommendations
    let recommendedSessionLength = 25; // Default Pomodoro length
    let recommendedBreakLength = 5; // Default break length

    if (successfulSessions.length >= 5) {
      // Calculate average duration of the most successful sessions (lowest interruptions)
      const topSessions = successfulSessions.slice(
        0,
        Math.ceil(successfulSessions.length * 0.3)
      );

      const avgDuration =
        topSessions.reduce((sum, session) => sum + session.duration, 0) /
        topSessions.length;

      // Round to nearest 5 minutes
      recommendedSessionLength = Math.round(avgDuration / 5) * 5;

      // Ensure it's within reasonable bounds
      recommendedSessionLength = Math.max(
        15,
        Math.min(45, recommendedSessionLength)
      );

      // Calculate recommended break (typically 20-25% of focus time)
      recommendedBreakLength = Math.round(recommendedSessionLength * 0.2);
      recommendedBreakLength = Math.max(
        3,
        Math.min(15, recommendedBreakLength)
      );
    }

    return {
      recommendedSessionLength,
      recommendedBreakLength,
    };
  } catch (error) {
    console.error("Error calculating recommended durations:", error);
    return {
      recommendedSessionLength: 25,
      recommendedBreakLength: 5,
    };
  }
}

// Update analytics with focus metrics
export async function updateFocusAnalytics(userId: string): Promise<void> {
  try {
    const metrics = await getFocusMetrics(userId);

    if (!metrics) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if analytics entry exists for today
    const existingAnalytics = await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.userId, userId),
          sql`DATE(${analytics.date}) = DATE(${today})`
        )
      );

    if (existingAnalytics.length > 0) {
      // Update existing entry
      await db
        .update(analytics)
        .set({
          completedWorkSessions: metrics.completedSessions,
          totalWorkMinutes: metrics.totalFocusTime,
          focusScore: metrics.focusScore,
          completedTasks: metrics.completedTasks,
          updatedAt: new Date(),
        })
        .where(eq(analytics.id, existingAnalytics[0].id));
    } else {
      // Create new entry
      await db.insert(analytics).values({
        userId,
        date: today,
        completedWorkSessions: metrics.completedSessions,
        totalWorkMinutes: metrics.totalFocusTime,
        focusScore: metrics.focusScore,
        completedTasks: metrics.completedTasks,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Error updating focus analytics:", error);
  }
}
