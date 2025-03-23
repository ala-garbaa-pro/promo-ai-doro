import { db } from "@/lib/server/db";
import { sessions, tasks, analytics } from "@/lib/server/db/schema";
import {
  eq,
  and,
  count,
  sum,
  avg,
  gte,
  desc,
  sql,
  lt,
  between,
} from "drizzle-orm";

interface SessionRecommendation {
  recommendedWorkDuration: number;
  recommendedShortBreakDuration: number;
  recommendedLongBreakDuration: number;
  confidence: number; // 0-100 scale indicating confidence in recommendation
  basedOn: {
    totalSessions: number;
    completedSessions: number;
    averageInterruptions: number;
    timeOfDay: string | null;
  };
}

interface UserFocusPattern {
  optimalTimeOfDay: string | null; // e.g., "morning", "afternoon", "evening"
  optimalDuration: number | null; // in minutes
  averageInterruptions: number;
  completionRate: number; // 0-100 scale
  mostProductiveDay: string | null; // e.g., "Monday", "Tuesday", etc.
  focusScore: number; // 0-100 scale
}

export class AdaptiveSessionsService {
  /**
   * Analyzes user's past sessions and generates personalized session duration recommendations
   */
  static async getSessionRecommendations(
    userId: string
  ): Promise<SessionRecommendation> {
    // Default recommendations (fallback)
    const defaultRecommendation: SessionRecommendation = {
      recommendedWorkDuration: 25,
      recommendedShortBreakDuration: 5,
      recommendedLongBreakDuration: 15,
      confidence: 0,
      basedOn: {
        totalSessions: 0,
        completedSessions: 0,
        averageInterruptions: 0,
        timeOfDay: null,
      },
    };

    try {
      // Get user's completed work sessions from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const userSessions = await db
        .select({
          id: sessions.id,
          duration: sessions.duration,
          startedAt: sessions.startedAt,
          completedAt: sessions.completedAt,
          isCompleted: sessions.isCompleted,
          wasInterrupted: sessions.wasInterrupted,
          interruptionCount: sessions.interruptionCount,
        })
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, userId),
            eq(sessions.type, "work"),
            gte(sessions.startedAt, thirtyDaysAgo)
          )
        );

      // If not enough data, return default recommendations
      if (userSessions.length < 5) {
        return {
          ...defaultRecommendation,
          confidence: Math.min(userSessions.length * 5, 25), // Max 25% confidence with limited data
          basedOn: {
            totalSessions: userSessions.length,
            completedSessions: userSessions.filter((s) => s.isCompleted).length,
            averageInterruptions:
              userSessions.reduce(
                (sum, s) => sum + (s.interruptionCount || 0),
                0
              ) / Math.max(userSessions.length, 1),
            timeOfDay: null,
          },
        };
      }

      // Calculate completion rate
      const completedSessions = userSessions.filter((s) => s.isCompleted);
      const completionRate =
        (completedSessions.length / userSessions.length) * 100;

      // Calculate average interruptions
      const averageInterruptions =
        userSessions.reduce((sum, s) => sum + (s.interruptionCount || 0), 0) /
        userSessions.length;

      // Analyze session durations for completed sessions
      const completedSessionDurations = completedSessions.map(
        (s) => s.duration
      );

      // Find the most common successful duration
      const durationCounts: Record<number, number> = {};
      completedSessionDurations.forEach((duration) => {
        durationCounts[duration] = (durationCounts[duration] || 0) + 1;
      });

      // Sort durations by frequency
      const sortedDurations = Object.entries(durationCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([duration, count]) => ({
          duration: parseInt(duration),
          count,
        }));

      // Determine optimal time of day
      const morningCount = userSessions.filter(
        (s) =>
          new Date(s.startedAt).getHours() >= 5 &&
          new Date(s.startedAt).getHours() < 12
      ).length;
      const afternoonCount = userSessions.filter(
        (s) =>
          new Date(s.startedAt).getHours() >= 12 &&
          new Date(s.startedAt).getHours() < 17
      ).length;
      const eveningCount = userSessions.filter(
        (s) =>
          new Date(s.startedAt).getHours() >= 17 &&
          new Date(s.startedAt).getHours() < 22
      ).length;
      const nightCount = userSessions.filter(
        (s) =>
          new Date(s.startedAt).getHours() >= 22 ||
          new Date(s.startedAt).getHours() < 5
      ).length;

      const timeOfDayCounts = [
        { time: "morning", count: morningCount },
        { time: "afternoon", count: afternoonCount },
        { time: "evening", count: eveningCount },
        { time: "night", count: nightCount },
      ].sort((a, b) => b.count - a.count);

      const optimalTimeOfDay =
        timeOfDayCounts[0].count > 0 ? timeOfDayCounts[0].time : null;

      // Calculate recommended durations
      let recommendedWorkDuration = 25; // Default

      // If we have enough data, use the most successful duration
      if (sortedDurations.length > 0 && sortedDurations[0].count >= 3) {
        recommendedWorkDuration = sortedDurations[0].duration;
      } else {
        // Otherwise, use average of completed sessions with some constraints
        const avgDuration =
          completedSessionDurations.reduce((sum, d) => sum + d, 0) /
          Math.max(completedSessionDurations.length, 1);

        // Round to nearest 5 minutes and constrain between 15-45 minutes
        recommendedWorkDuration = Math.min(
          45,
          Math.max(15, Math.round(avgDuration / 5) * 5)
        );
      }

      // Calculate break durations based on work duration
      const recommendedShortBreakDuration = Math.max(
        3,
        Math.round(recommendedWorkDuration / 5)
      );
      const recommendedLongBreakDuration = Math.max(
        10,
        Math.round(recommendedWorkDuration / 2)
      );

      // Calculate confidence based on data quality
      const confidence = Math.min(
        Math.round(
          (completedSessions.length / 10) * 30 + // Up to 30% for number of sessions
            (completionRate / 100) * 40 + // Up to 40% for completion rate
            (1 - Math.min(averageInterruptions, 5) / 5) * 30 // Up to 30% for low interruptions
        ),
        100
      );

      return {
        recommendedWorkDuration,
        recommendedShortBreakDuration,
        recommendedLongBreakDuration,
        confidence,
        basedOn: {
          totalSessions: userSessions.length,
          completedSessions: completedSessions.length,
          averageInterruptions,
          timeOfDay: optimalTimeOfDay,
        },
      };
    } catch (error) {
      console.error("Error generating session recommendations:", error);
      return defaultRecommendation;
    }
  }

  /**
   * Analyzes user's focus patterns to provide insights
   */
  static async getUserFocusPattern(userId: string): Promise<UserFocusPattern> {
    try {
      // Get user's sessions from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const userSessions = await db
        .select({
          id: sessions.id,
          duration: sessions.duration,
          startedAt: sessions.startedAt,
          completedAt: sessions.completedAt,
          isCompleted: sessions.isCompleted,
          wasInterrupted: sessions.wasInterrupted,
          interruptionCount: sessions.interruptionCount,
        })
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, userId),
            eq(sessions.type, "work"),
            gte(sessions.startedAt, thirtyDaysAgo)
          )
        );

      if (userSessions.length === 0) {
        return {
          optimalTimeOfDay: null,
          optimalDuration: null,
          averageInterruptions: 0,
          completionRate: 0,
          mostProductiveDay: null,
          focusScore: 0,
        };
      }

      // Calculate completion rate
      const completedSessions = userSessions.filter((s) => s.isCompleted);
      const completionRate =
        (completedSessions.length / userSessions.length) * 100;

      // Calculate average interruptions
      const averageInterruptions =
        userSessions.reduce((sum, s) => sum + (s.interruptionCount || 0), 0) /
        userSessions.length;

      // Determine optimal time of day
      const timeSlots = [
        { name: "early morning", start: 5, end: 9, count: 0, completed: 0 },
        { name: "morning", start: 9, end: 12, count: 0, completed: 0 },
        { name: "afternoon", start: 12, end: 17, count: 0, completed: 0 },
        { name: "evening", start: 17, end: 22, count: 0, completed: 0 },
        { name: "night", start: 22, end: 5, count: 0, completed: 0 },
      ];

      userSessions.forEach((session) => {
        const hour = new Date(session.startedAt).getHours();

        for (const slot of timeSlots) {
          if (slot.start <= slot.end) {
            // Normal time range (e.g., 9-12)
            if (hour >= slot.start && hour < slot.end) {
              slot.count++;
              if (session.isCompleted) slot.completed++;
              break;
            }
          } else {
            // Overnight time range (e.g., 22-5)
            if (hour >= slot.start || hour < slot.end) {
              slot.count++;
              if (session.isCompleted) slot.completed++;
              break;
            }
          }
        }
      });

      // Find the time slot with the highest completion rate
      const productiveTimeSlots = timeSlots
        .filter((slot) => slot.count >= 3) // Need at least 3 sessions to be meaningful
        .map((slot) => ({
          ...slot,
          completionRate:
            slot.count > 0 ? (slot.completed / slot.count) * 100 : 0,
        }))
        .sort((a, b) => b.completionRate - a.completionRate);

      const optimalTimeOfDay =
        productiveTimeSlots.length > 0 ? productiveTimeSlots[0].name : null;

      // Determine most productive day of the week
      const dayStats: Record<string, { count: number; completed: number }> = {
        Sunday: { count: 0, completed: 0 },
        Monday: { count: 0, completed: 0 },
        Tuesday: { count: 0, completed: 0 },
        Wednesday: { count: 0, completed: 0 },
        Thursday: { count: 0, completed: 0 },
        Friday: { count: 0, completed: 0 },
        Saturday: { count: 0, completed: 0 },
      };

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      userSessions.forEach((session) => {
        const day = dayNames[new Date(session.startedAt).getDay()];
        dayStats[day].count++;
        if (session.isCompleted) dayStats[day].completed++;
      });

      const productiveDays = Object.entries(dayStats)
        .filter(([_, stats]) => stats.count >= 2) // Need at least 2 sessions to be meaningful
        .map(([day, stats]) => ({
          day,
          completionRate:
            stats.count > 0 ? (stats.completed / stats.count) * 100 : 0,
          count: stats.count,
        }))
        .sort((a, b) => b.completionRate - a.completionRate);

      const mostProductiveDay =
        productiveDays.length > 0 ? productiveDays[0].day : null;

      // Find optimal duration based on completed sessions
      let optimalDuration = null;
      if (completedSessions.length >= 3) {
        const durationCounts: Record<number, number> = {};
        completedSessions.forEach((s) => {
          durationCounts[s.duration] = (durationCounts[s.duration] || 0) + 1;
        });

        const mostCommonDuration = Object.entries(durationCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([duration, count]) => ({
            duration: parseInt(duration),
            count,
          }))[0];

        if (mostCommonDuration && mostCommonDuration.count >= 2) {
          optimalDuration = mostCommonDuration.duration;
        }
      }

      // Calculate focus score (0-100)
      const focusScore = Math.round(
        completionRate * 0.5 + // 50% weight to completion rate
          (1 - Math.min(averageInterruptions, 5) / 5) * 30 + // 30% weight to low interruptions
          Math.min(userSessions.length / 20, 1) * 20 // 20% weight to consistency (number of sessions)
      );

      return {
        optimalTimeOfDay,
        optimalDuration,
        averageInterruptions,
        completionRate,
        mostProductiveDay,
        focusScore,
      };
    } catch (error) {
      console.error("Error analyzing user focus patterns:", error);
      return {
        optimalTimeOfDay: null,
        optimalDuration: null,
        averageInterruptions: 0,
        completionRate: 0,
        mostProductiveDay: null,
        focusScore: 0,
      };
    }
  }
}
