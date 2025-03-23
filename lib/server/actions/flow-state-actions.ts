"use server";

import { auth } from "@/lib/auth";
import { FlowStateService } from "@/lib/server/services/flow-state-service";
import {
  FlowStateLevel,
  FlowStateTrigger,
} from "@/lib/cognitive-enhancement/flow-state-detection";
import { revalidatePath } from "next/cache";

/**
 * Start a new flow state session
 */
export async function startFlowStateSession({
  sessionId,
  flowStateLevel,
  focusScore,
}: {
  sessionId?: string;
  flowStateLevel: FlowStateLevel;
  focusScore: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const newSession = await FlowStateService.createFlowStateSession({
      userId: session.user.id,
      sessionId,
      startTime: new Date(),
      flowStateLevel,
      focusScore,
    });

    revalidatePath("/app/flow-state");
    return { success: true, data: newSession };
  } catch (error) {
    console.error("Error starting flow state session:", error);
    return { success: false, error: "Failed to start flow state session" };
  }
}

/**
 * End a flow state session
 */
export async function endFlowStateSession({
  id,
  duration,
  maxFocusScore,
  avgFocusScore,
  flowStateLevel,
  interruptionCount,
  notes,
}: {
  id: string;
  duration: number;
  maxFocusScore: number;
  avgFocusScore: number;
  flowStateLevel: FlowStateLevel;
  interruptionCount?: number;
  notes?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const updatedSession = await FlowStateService.updateFlowStateSession({
      id,
      endTime: new Date(),
      duration,
      maxFocusScore,
      avgFocusScore,
      flowStateLevel,
      interruptionCount,
      notes,
    });

    revalidatePath("/app/flow-state");
    return { success: true, data: updatedSession };
  } catch (error) {
    console.error("Error ending flow state session:", error);
    return { success: false, error: "Failed to end flow state session" };
  }
}

/**
 * Add a metric record for a flow state session
 */
export async function addFlowStateMetric({
  flowSessionId,
  focusScore,
  flowStateLevel,
  interactionRate,
  distractionCount,
  confidenceScore,
}: {
  flowSessionId: string;
  focusScore: number;
  flowStateLevel: FlowStateLevel;
  interactionRate: number;
  distractionCount: number;
  confidenceScore: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const newMetric = await FlowStateService.addFlowStateMetric({
      flowSessionId,
      timestamp: new Date(),
      focusScore,
      flowStateLevel,
      interactionRate,
      distractionCount,
      confidenceScore,
    });

    return { success: true, data: newMetric };
  } catch (error) {
    console.error("Error adding flow state metric:", error);
    return { success: false, error: "Failed to add flow state metric" };
  }
}

/**
 * Create or update a flow state trigger
 */
export async function createOrUpdateFlowStateTrigger({
  type,
  name,
  effectiveness,
}: {
  type: "environment" | "activity" | "time" | "ritual";
  name: string;
  effectiveness: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const trigger = await FlowStateService.createOrUpdateFlowStateTrigger({
      userId: session.user.id,
      type,
      name,
      effectiveness,
    });

    revalidatePath("/app/flow-state");
    return { success: true, data: trigger };
  } catch (error) {
    console.error("Error creating or updating flow state trigger:", error);
    return {
      success: false,
      error: "Failed to create or update flow state trigger",
    };
  }
}

/**
 * Get flow state triggers for the current user
 */
export async function getFlowStateTriggersForCurrentUser() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const triggers = await FlowStateService.getFlowStateTriggersForUser(
      session.user.id
    );
    return { success: true, data: triggers };
  } catch (error) {
    console.error("Error getting flow state triggers:", error);
    return { success: false, error: "Failed to get flow state triggers" };
  }
}

/**
 * Get flow state sessions for the current user
 */
export async function getFlowStateSessionsForCurrentUser(limit = 10) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const sessions = await FlowStateService.getFlowStateSessionsForUser(
      session.user.id,
      limit
    );
    return { success: true, data: sessions };
  } catch (error) {
    console.error("Error getting flow state sessions:", error);
    return { success: false, error: "Failed to get flow state sessions" };
  }
}

/**
 * Get flow state statistics for the current user
 */
export async function getFlowStateStatisticsForCurrentUser() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const statistics = await FlowStateService.getFlowStateStatisticsForUser(
      session.user.id
    );
    return { success: true, data: statistics };
  } catch (error) {
    console.error("Error getting flow state statistics:", error);
    return { success: false, error: "Failed to get flow state statistics" };
  }
}
