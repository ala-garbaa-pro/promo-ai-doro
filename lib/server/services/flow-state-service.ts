import { db } from "@/lib/server/db";
import {
  flowStateSessions,
  flowStateMetrics,
  flowStateTriggers,
  flowSessionTriggers,
} from "@/lib/server/db/schema";
import { eq, and, desc, avg, max, count } from "drizzle-orm";
import {
  FlowStateLevel,
  FlowStateTrigger,
} from "@/lib/cognitive-enhancement/flow-state-detection";

/**
 * Service for managing flow state data
 */
export class FlowStateService {
  /**
   * Create a new flow state session
   */
  static async createFlowStateSession({
    userId,
    sessionId,
    startTime,
    flowStateLevel,
    focusScore,
  }: {
    userId: string;
    sessionId?: string;
    startTime: Date;
    flowStateLevel: FlowStateLevel;
    focusScore: number;
  }) {
    try {
      const [newSession] = await db
        .insert(flowStateSessions)
        .values({
          userId,
          sessionId,
          startTime,
          maxFocusScore: focusScore,
          avgFocusScore: focusScore,
          flowStateLevel,
        })
        .returning();

      return newSession;
    } catch (error) {
      console.error("Error creating flow state session:", error);
      throw error;
    }
  }

  /**
   * Update an existing flow state session
   */
  static async updateFlowStateSession({
    id,
    endTime,
    duration,
    maxFocusScore,
    avgFocusScore,
    flowStateLevel,
    interruptionCount,
    notes,
  }: {
    id: string;
    endTime?: Date;
    duration?: number;
    maxFocusScore?: number;
    avgFocusScore?: number;
    flowStateLevel?: FlowStateLevel;
    interruptionCount?: number;
    notes?: string;
  }) {
    try {
      const [updatedSession] = await db
        .update(flowStateSessions)
        .set({
          endTime,
          duration,
          maxFocusScore,
          avgFocusScore,
          flowStateLevel,
          interruptionCount,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(flowStateSessions.id, id))
        .returning();

      return updatedSession;
    } catch (error) {
      console.error("Error updating flow state session:", error);
      throw error;
    }
  }

  /**
   * Add a metric record for a flow state session
   */
  static async addFlowStateMetric({
    flowSessionId,
    timestamp,
    focusScore,
    flowStateLevel,
    interactionRate,
    distractionCount,
    confidenceScore,
  }: {
    flowSessionId: string;
    timestamp: Date;
    focusScore: number;
    flowStateLevel: FlowStateLevel;
    interactionRate: number;
    distractionCount: number;
    confidenceScore: number;
  }) {
    try {
      const [newMetric] = await db
        .insert(flowStateMetrics)
        .values({
          flowSessionId,
          timestamp,
          focusScore,
          flowStateLevel,
          interactionRate,
          distractionCount,
          confidenceScore,
        })
        .returning();

      // Update the session with the latest metrics
      const metrics = await db
        .select({
          maxFocusScore: max(flowStateMetrics.focusScore),
          avgFocusScore: avg(flowStateMetrics.focusScore),
        })
        .from(flowStateMetrics)
        .where(eq(flowStateMetrics.flowSessionId, flowSessionId));

      if (
        metrics.length > 0 &&
        metrics[0].maxFocusScore &&
        metrics[0].avgFocusScore
      ) {
        await db
          .update(flowStateSessions)
          .set({
            maxFocusScore: metrics[0].maxFocusScore,
            avgFocusScore: Math.round(metrics[0].avgFocusScore),
            updatedAt: new Date(),
          })
          .where(eq(flowStateSessions.id, flowSessionId));
      }

      return newMetric;
    } catch (error) {
      console.error("Error adding flow state metric:", error);
      throw error;
    }
  }

  /**
   * Create or update a flow state trigger
   */
  static async createOrUpdateFlowStateTrigger({
    userId,
    type,
    name,
    effectiveness,
  }: {
    userId: string;
    type: "environment" | "activity" | "time" | "ritual";
    name: string;
    effectiveness: number;
  }) {
    try {
      // Check if the trigger already exists
      const existingTrigger = await db
        .select()
        .from(flowStateTriggers)
        .where(
          and(
            eq(flowStateTriggers.userId, userId),
            eq(flowStateTriggers.type, type),
            eq(flowStateTriggers.name, name)
          )
        )
        .limit(1);

      if (existingTrigger.length > 0) {
        // Update existing trigger
        const [updatedTrigger] = await db
          .update(flowStateTriggers)
          .set({
            effectiveness: Math.round(
              (existingTrigger[0].effectiveness + effectiveness) / 2
            ),
            frequency: existingTrigger[0].frequency + 1,
            updatedAt: new Date(),
          })
          .where(eq(flowStateTriggers.id, existingTrigger[0].id))
          .returning();

        return updatedTrigger;
      } else {
        // Create new trigger
        const [newTrigger] = await db
          .insert(flowStateTriggers)
          .values({
            userId,
            type,
            name,
            effectiveness,
            frequency: 1,
          })
          .returning();

        return newTrigger;
      }
    } catch (error) {
      console.error("Error creating or updating flow state trigger:", error);
      throw error;
    }
  }

  /**
   * Associate triggers with a flow state session
   */
  static async addTriggersToSession({
    flowSessionId,
    triggerIds,
    effectiveness,
  }: {
    flowSessionId: string;
    triggerIds: string[];
    effectiveness?: number;
  }) {
    try {
      const values = triggerIds.map((triggerId) => ({
        flowSessionId,
        triggerId,
        effectiveness,
      }));

      const result = await db
        .insert(flowSessionTriggers)
        .values(values)
        .returning();

      return result;
    } catch (error) {
      console.error("Error adding triggers to session:", error);
      throw error;
    }
  }

  /**
   * Get flow state triggers for a user
   */
  static async getFlowStateTriggersForUser(userId: string) {
    try {
      const triggers = await db
        .select()
        .from(flowStateTriggers)
        .where(eq(flowStateTriggers.userId, userId))
        .orderBy(desc(flowStateTriggers.effectiveness));

      return triggers;
    } catch (error) {
      console.error("Error getting flow state triggers for user:", error);
      throw error;
    }
  }

  /**
   * Get flow state sessions for a user
   */
  static async getFlowStateSessionsForUser(userId: string, limit = 10) {
    try {
      const sessions = await db
        .select()
        .from(flowStateSessions)
        .where(eq(flowStateSessions.userId, userId))
        .orderBy(desc(flowStateSessions.startTime))
        .limit(limit);

      return sessions;
    } catch (error) {
      console.error("Error getting flow state sessions for user:", error);
      throw error;
    }
  }

  /**
   * Get metrics for a flow state session
   */
  static async getMetricsForFlowStateSession(flowSessionId: string) {
    try {
      const metrics = await db
        .select()
        .from(flowStateMetrics)
        .where(eq(flowStateMetrics.flowSessionId, flowSessionId))
        .orderBy(desc(flowStateMetrics.timestamp));

      return metrics;
    } catch (error) {
      console.error("Error getting metrics for flow state session:", error);
      throw error;
    }
  }

  /**
   * Get flow state statistics for a user
   */
  static async getFlowStateStatisticsForUser(userId: string) {
    try {
      const sessions = await db
        .select()
        .from(flowStateSessions)
        .where(eq(flowStateSessions.userId, userId));

      // Calculate statistics
      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce(
        (sum, session) => sum + (session.duration || 0),
        0
      );
      const avgDuration =
        totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
      const avgFocusScore =
        totalSessions > 0
          ? Math.round(
              sessions.reduce(
                (sum, session) => sum + session.avgFocusScore,
                0
              ) / totalSessions
            )
          : 0;
      const maxFocusScore = sessions.reduce(
        (max, session) => Math.max(max, session.maxFocusScore),
        0
      );

      // Count sessions by flow state level
      const sessionsByLevel = {
        light: sessions.filter((s) => s.flowStateLevel === "light").length,
        deep: sessions.filter((s) => s.flowStateLevel === "deep").length,
      };

      return {
        totalSessions,
        totalDuration,
        avgDuration,
        avgFocusScore,
        maxFocusScore,
        sessionsByLevel,
      };
    } catch (error) {
      console.error("Error getting flow state statistics for user:", error);
      throw error;
    }
  }
}
