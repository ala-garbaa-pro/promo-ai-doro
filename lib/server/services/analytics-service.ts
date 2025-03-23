import { db } from "@/lib/server/db";
import { analytics, sessions, tasks } from "@/lib/server/db/schema";
import { eq, and, gte, lte, desc, sql, count, sum } from "drizzle-orm";
import { getSessionStats } from "./session-service";

export interface DailyAnalytics {
  date: Date;
  totalWorkSessions: number;
  completedWorkSessions: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  focusScore: number;
  completedTasks: number;
}

export interface WeeklyAnalytics {
  startDate: Date;
  endDate: Date;
  totalWorkSessions: number;
  completedWorkSessions: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  averageFocusScore: number;
  completedTasks: number;
  dailyAnalytics: DailyAnalytics[];
}

export interface MonthlyAnalytics {
  month: number;
  year: number;
  totalWorkSessions: number;
  completedWorkSessions: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  averageFocusScore: number;
  completedTasks: number;
  weeklyAnalytics: WeeklyAnalytics[];
}

export interface ProductivityByHour {
  hour: number;
  completedSessions: number;
  totalMinutes: number;
}

/**
 * Generate or update daily analytics for a user
 */
export async function generateDailyAnalytics(userId: string, date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get session stats for the day
    const sessionStats = await getSessionStats(userId, startOfDay, endOfDay);

    // Get completed tasks for the day
    const completedTasksResult = await db
      .select({
        count: count(tasks.id),
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.status, "completed"),
          gte(tasks.updatedAt, startOfDay),
          lte(tasks.updatedAt, endOfDay)
        )
      );

    const completedTasks = Number(completedTasksResult[0]?.count) || 0;

    // Calculate focus score (0-100)
    // Formula: (completed sessions / total sessions) * (1 - interruptions/sessions) * 100
    const interruptionsResult = await db
      .select({
        count: sum(sessions.interruptionCount),
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.type, "work"),
          gte(sessions.startedAt, startOfDay),
          lte(sessions.startedAt, endOfDay)
        )
      );

    const interruptions = Number(interruptionsResult[0]?.count) || 0;

    let focusScore = 0;
    if (sessionStats.totalSessions > 0) {
      const completionRatio =
        sessionStats.completedSessions / sessionStats.totalSessions;
      const interruptionRatio = Math.min(
        1,
        interruptions / sessionStats.totalSessions
      );
      focusScore = Math.round(completionRatio * (1 - interruptionRatio) * 100);
    }

    // Check if analytics entry already exists for this day
    const existingAnalytics = await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.userId, userId),
          gte(analytics.date, startOfDay),
          lte(analytics.date, endOfDay)
        )
      );

    if (existingAnalytics.length > 0) {
      // Update existing entry
      const [updatedAnalytics] = await db
        .update(analytics)
        .set({
          totalWorkSessions: sessionStats.totalSessions,
          completedWorkSessions: sessionStats.completedSessions,
          totalWorkMinutes: sessionStats.totalWorkMinutes,
          totalBreakMinutes: sessionStats.totalBreakMinutes,
          focusScore,
          completedTasks,
          updatedAt: new Date(),
        })
        .where(eq(analytics.id, existingAnalytics[0].id))
        .returning();

      return updatedAnalytics;
    } else {
      // Create new entry
      const [newAnalytics] = await db
        .insert(analytics)
        .values({
          userId,
          date: startOfDay,
          totalWorkSessions: sessionStats.totalSessions,
          completedWorkSessions: sessionStats.completedSessions,
          totalWorkMinutes: sessionStats.totalWorkMinutes,
          totalBreakMinutes: sessionStats.totalBreakMinutes,
          focusScore,
          completedTasks,
        })
        .returning();

      return newAnalytics;
    }
  } catch (error) {
    console.error("Error generating daily analytics:", error);
    throw error;
  }
}

/**
 * Get daily analytics for a user
 */
export async function getDailyAnalytics(
  userId: string,
  date: Date
): Promise<DailyAnalytics | null> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if analytics exist for this day
    const existingAnalytics = await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.userId, userId),
          gte(analytics.date, startOfDay),
          lte(analytics.date, endOfDay)
        )
      );

    if (existingAnalytics.length > 0) {
      const data = existingAnalytics[0];
      return {
        date: data.date,
        totalWorkSessions: data.totalWorkSessions,
        completedWorkSessions: data.completedWorkSessions,
        totalWorkMinutes: data.totalWorkMinutes,
        totalBreakMinutes: data.totalBreakMinutes,
        focusScore: data.focusScore || 0,
        completedTasks: data.completedTasks,
      };
    }

    // Generate analytics if they don't exist
    const generatedAnalytics = await generateDailyAnalytics(userId, date);

    return {
      date: generatedAnalytics.date,
      totalWorkSessions: generatedAnalytics.totalWorkSessions,
      completedWorkSessions: generatedAnalytics.completedWorkSessions,
      totalWorkMinutes: generatedAnalytics.totalWorkMinutes,
      totalBreakMinutes: generatedAnalytics.totalBreakMinutes,
      focusScore: generatedAnalytics.focusScore || 0,
      completedTasks: generatedAnalytics.completedTasks,
    };
  } catch (error) {
    console.error("Error getting daily analytics:", error);
    throw error;
  }
}

/**
 * Get weekly analytics for a user
 */
export async function getWeeklyAnalytics(
  userId: string,
  date: Date
): Promise<WeeklyAnalytics> {
  try {
    // Calculate start and end of week (Sunday to Saturday)
    const day = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get daily analytics for each day of the week
    const dailyAnalytics: DailyAnalytics[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);

      const dayAnalytics = await getDailyAnalytics(userId, currentDate);
      if (dayAnalytics) {
        dailyAnalytics.push(dayAnalytics);
      }
    }

    // Calculate weekly totals
    const totalWorkSessions = dailyAnalytics.reduce(
      (sum, day) => sum + day.totalWorkSessions,
      0
    );

    const completedWorkSessions = dailyAnalytics.reduce(
      (sum, day) => sum + day.completedWorkSessions,
      0
    );

    const totalWorkMinutes = dailyAnalytics.reduce(
      (sum, day) => sum + day.totalWorkMinutes,
      0
    );

    const totalBreakMinutes = dailyAnalytics.reduce(
      (sum, day) => sum + day.totalBreakMinutes,
      0
    );

    const completedTasks = dailyAnalytics.reduce(
      (sum, day) => sum + day.completedTasks,
      0
    );

    // Calculate average focus score
    const totalFocusScore = dailyAnalytics.reduce(
      (sum, day) => sum + day.focusScore,
      0
    );

    const averageFocusScore =
      dailyAnalytics.length > 0
        ? Math.round(totalFocusScore / dailyAnalytics.length)
        : 0;

    return {
      startDate: startOfWeek,
      endDate: endOfWeek,
      totalWorkSessions,
      completedWorkSessions,
      totalWorkMinutes,
      totalBreakMinutes,
      averageFocusScore,
      completedTasks,
      dailyAnalytics,
    };
  } catch (error) {
    console.error("Error getting weekly analytics:", error);
    throw error;
  }
}

/**
 * Get monthly analytics for a user
 */
export async function getMonthlyAnalytics(
  userId: string,
  month: number,
  year: number
): Promise<MonthlyAnalytics> {
  try {
    // Calculate start and end of month
    const startOfMonth = new Date(year, month - 1, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(year, month, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Get weekly analytics for each week of the month
    const weeklyAnalytics: WeeklyAnalytics[] = [];

    // Start from the first Sunday of the month or before
    const firstSunday = new Date(startOfMonth);
    const dayOfWeek = firstSunday.getDay();
    firstSunday.setDate(firstSunday.getDate() - dayOfWeek);

    // Get weekly analytics until we pass the end of the month
    let currentDate = new Date(firstSunday);

    while (currentDate <= endOfMonth) {
      const weekAnalytics = await getWeeklyAnalytics(userId, currentDate);
      weeklyAnalytics.push(weekAnalytics);

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Calculate monthly totals
    const totalWorkSessions = weeklyAnalytics.reduce(
      (sum, week) => sum + week.totalWorkSessions,
      0
    );

    const completedWorkSessions = weeklyAnalytics.reduce(
      (sum, week) => sum + week.completedWorkSessions,
      0
    );

    const totalWorkMinutes = weeklyAnalytics.reduce(
      (sum, week) => sum + week.totalWorkMinutes,
      0
    );

    const totalBreakMinutes = weeklyAnalytics.reduce(
      (sum, week) => sum + week.totalBreakMinutes,
      0
    );

    const completedTasks = weeklyAnalytics.reduce(
      (sum, week) => sum + week.completedTasks,
      0
    );

    // Calculate average focus score
    const totalFocusScore = weeklyAnalytics.reduce(
      (sum, week) => sum + week.averageFocusScore,
      0
    );

    const averageFocusScore =
      weeklyAnalytics.length > 0
        ? Math.round(totalFocusScore / weeklyAnalytics.length)
        : 0;

    return {
      month,
      year,
      totalWorkSessions,
      completedWorkSessions,
      totalWorkMinutes,
      totalBreakMinutes,
      averageFocusScore,
      completedTasks,
      weeklyAnalytics,
    };
  } catch (error) {
    console.error("Error getting monthly analytics:", error);
    throw error;
  }
}

/**
 * Get productivity by hour for a user
 */
export async function getProductivityByHour(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ProductivityByHour[]> {
  try {
    // Default to last 30 days if no dates provided
    const end = endDate || new Date();
    const start = startDate || new Date(end);
    if (!startDate) {
      start.setDate(end.getDate() - 30);
    }

    // Query to get completed sessions grouped by hour
    const results = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${sessions.startedAt})`,
        completedSessions: count(sessions.id),
        totalMinutes: sum(sessions.duration),
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.type, "work"),
          eq(sessions.isCompleted, true),
          gte(sessions.startedAt, start),
          lte(sessions.startedAt, end)
        )
      )
      .groupBy(sql`EXTRACT(HOUR FROM ${sessions.startedAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${sessions.startedAt})`);

    // Format results
    return results.map((row) => ({
      hour: Number(row.hour),
      completedSessions: Number(row.completedSessions) || 0,
      totalMinutes: Number(row.totalMinutes) || 0,
    }));
  } catch (error) {
    console.error("Error getting productivity by hour:", error);
    throw error;
  }
}
