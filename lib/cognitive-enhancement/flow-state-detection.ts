/**
 * Flow State Detection Service
 *
 * This service provides functionality to detect when a user is entering or leaving a flow state
 * based on interaction patterns, focus duration, and other metrics.
 */

import { useEffect, useState, useRef } from "react";
import { useSettings } from "@/lib/contexts/settings-context";
import {
  startFlowStateSession,
  endFlowStateSession,
  addFlowStateMetric,
  createOrUpdateFlowStateTrigger,
  getFlowStateTriggersForCurrentUser,
} from "@/lib/server/actions/flow-state-actions";

// Types
export interface FlowStateMetrics {
  focusScore: number; // 0-100 score indicating current focus level
  flowState: FlowStateLevel; // Current flow state level
  focusDuration: number; // Duration of current focus period in seconds
  interactionRate: number; // Rate of user interactions (clicks, keystrokes) per minute
  distractionCount: number; // Number of detected distractions
  confidenceScore: number; // 0-100 score indicating confidence in the flow state detection
}

export type FlowStateLevel = "none" | "entering" | "light" | "deep" | "exiting";

export interface FlowStateTrigger {
  type: "environment" | "activity" | "time" | "ritual";
  name: string;
  effectiveness: number; // 0-100 score
  frequency: number; // How often this trigger is used
}

// Constants
const FLOW_THRESHOLD_LIGHT = 65; // Minimum focus score to be considered in light flow
const FLOW_THRESHOLD_DEEP = 85; // Minimum focus score to be considered in deep flow
const MIN_FLOW_DURATION = 300; // Minimum duration (in seconds) to be considered in flow state
const INTERACTION_SAMPLE_PERIOD = 60; // Period (in seconds) to sample interaction rate

/**
 * Hook for detecting and managing flow state
 */
export function useFlowStateDetection() {
  const { settings } = useSettings();
  const [metrics, setMetrics] = useState<FlowStateMetrics>({
    focusScore: 0,
    flowState: "none",
    focusDuration: 0,
    interactionRate: 0,
    distractionCount: 0,
    confidenceScore: 0,
  });

  // References for tracking interactions
  const interactionsRef = useRef<number[]>([]);
  const lastInteractionTimeRef = useRef<number>(Date.now());
  const focusStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Flow state triggers identified for this user
  const [flowTriggers, setFlowTriggers] = useState<FlowStateTrigger[]>([]);

  // Current flow session ID
  const [currentFlowSessionId, setCurrentFlowSessionId] = useState<
    string | null
  >(null);
  const [isLoadingTriggers, setIsLoadingTriggers] = useState(false);

  /**
   * Track user interactions (mouse movements, clicks, keystrokes)
   */
  useEffect(() => {
    const trackInteraction = () => {
      const now = Date.now();
      interactionsRef.current.push(now);
      lastInteractionTimeRef.current = now;

      // Keep only interactions within the sample period
      const cutoff = now - INTERACTION_SAMPLE_PERIOD * 1000;
      interactionsRef.current = interactionsRef.current.filter(
        (time) => time >= cutoff
      );
    };

    // Set up event listeners for user interactions
    window.addEventListener("mousemove", trackInteraction);
    window.addEventListener("click", trackInteraction);
    window.addEventListener("keydown", trackInteraction);

    return () => {
      window.removeEventListener("mousemove", trackInteraction);
      window.removeEventListener("click", trackInteraction);
      window.removeEventListener("keydown", trackInteraction);
    };
  }, []);

  /**
   * Update flow state metrics periodically
   */
  useEffect(() => {
    const updateMetrics = () => {
      const now = Date.now();

      // Calculate interaction rate (interactions per minute)
      const interactionRate =
        interactionsRef.current.length / (INTERACTION_SAMPLE_PERIOD / 60);

      // Calculate time since last interaction (in seconds)
      const timeSinceLastInteraction =
        (now - lastInteractionTimeRef.current) / 1000;

      // Calculate focus duration
      let focusDuration = 0;
      if (focusStartTimeRef.current) {
        focusDuration = (now - focusStartTimeRef.current) / 1000;
      }

      // Calculate focus score based on interaction patterns
      // This is a simplified algorithm and would be more sophisticated in a real implementation
      let focusScore = 0;

      // If interaction rate is moderate (not too high or too low), increase focus score
      if (interactionRate > 2 && interactionRate < 20) {
        focusScore += 40;
      }

      // If user has been focused for a while, increase focus score
      if (focusDuration > MIN_FLOW_DURATION) {
        focusScore += Math.min(40, (focusDuration / 60) * 2);
      }

      // If user hasn't been distracted recently, increase focus score
      if (timeSinceLastInteraction < 30) {
        focusScore += 20;
      }

      // Determine flow state based on focus score and duration
      let flowState: FlowStateLevel = "none";

      if (
        focusScore >= FLOW_THRESHOLD_DEEP &&
        focusDuration >= MIN_FLOW_DURATION
      ) {
        flowState = "deep";
      } else if (
        focusScore >= FLOW_THRESHOLD_LIGHT &&
        focusDuration >= MIN_FLOW_DURATION
      ) {
        flowState = "light";
      } else if (
        focusScore >= FLOW_THRESHOLD_LIGHT &&
        focusDuration < MIN_FLOW_DURATION
      ) {
        flowState = "entering";
      } else if (
        (metrics.flowState === "light" || metrics.flowState === "deep") &&
        focusScore < FLOW_THRESHOLD_LIGHT
      ) {
        flowState = "exiting";
      }

      // If we're entering flow state and we don't have a start time, set it
      if (flowState === "entering" && !focusStartTimeRef.current) {
        focusStartTimeRef.current = now;
      }

      // If we've exited flow state, reset the start time
      if (flowState === "none" && focusStartTimeRef.current) {
        focusStartTimeRef.current = null;
      }

      // Calculate confidence score based on available data
      const confidenceScore = Math.min(
        100,
        interactionsRef.current.length / 10 + (focusDuration / 60) * 5
      );

      // Check if flow state has changed
      const flowStateChanged = flowState !== metrics.flowState;

      // Update metrics
      setMetrics({
        focusScore,
        flowState,
        focusDuration,
        interactionRate,
        distractionCount: 0, // This would be tracked in a real implementation
        confidenceScore,
      });

      // Persist flow state data when state changes
      if (flowStateChanged) {
        handleFlowStateChange(
          flowState,
          focusScore,
          interactionRate,
          confidenceScore,
          focusDuration
        );
      } else if (
        currentFlowSessionId &&
        (flowState === "light" || flowState === "deep")
      ) {
        // Periodically add metrics for ongoing flow sessions
        addFlowStateMetric({
          flowSessionId: currentFlowSessionId,
          focusScore,
          flowStateLevel: flowState,
          interactionRate,
          distractionCount: 0,
          confidenceScore,
        });
      }
    };

    // Update metrics every 5 seconds
    timerRef.current = setInterval(updateMetrics, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [metrics]);

  /**
   * Identify potential flow triggers based on user patterns
   * This is a placeholder for a more sophisticated algorithm
   */
  const identifyFlowTriggers = () => {
    // In a real implementation, this would analyze patterns of when the user enters flow state
    // For now, we'll return some example triggers
    return [
      {
        type: "environment",
        name: "Quiet workspace",
        effectiveness: 85,
        frequency: 12,
      },
      {
        type: "activity",
        name: "Starting with a simple task",
        effectiveness: 75,
        frequency: 8,
      },
      {
        type: "time",
        name: "Morning work (9-11 AM)",
        effectiveness: 90,
        frequency: 15,
      },
      {
        type: "ritual",
        name: "Coffee before deep work",
        effectiveness: 80,
        frequency: 10,
      },
    ];
  };

  /**
   * Get recommendations for entering flow state
   */
  const getFlowStateRecommendations = () => {
    // Sort triggers by effectiveness
    const sortedTriggers = [...flowTriggers].sort(
      (a, b) => b.effectiveness - a.effectiveness
    );

    // Return top 3 most effective triggers
    return sortedTriggers.slice(0, 3);
  };

  /**
   * Get recommendations for recovery after flow state
   */
  const getPostFlowRecoveryRecommendations = () => {
    return [
      "Take a 5-minute walk to reset your mental state",
      "Hydrate and have a small snack to replenish energy",
      "Do a quick stretching routine to reduce physical tension",
      "Practice 2 minutes of deep breathing to reset your nervous system",
      "Write down any insights or ideas from your flow session",
    ];
  };

  /**
   * Load flow triggers from the server
   */
  const loadFlowTriggers = async () => {
    try {
      setIsLoadingTriggers(true);
      const result = await getFlowStateTriggersForCurrentUser();
      if (result.success && result.data) {
        setFlowTriggers(result.data);
      } else {
        // If no triggers are found, use the default ones
        setFlowTriggers(identifyFlowTriggers());
      }
    } catch (error) {
      console.error("Error loading flow triggers:", error);
      setFlowTriggers(identifyFlowTriggers());
    } finally {
      setIsLoadingTriggers(false);
    }
  };

  // Initialize flow triggers
  useEffect(() => {
    loadFlowTriggers();
  }, []);

  /**
   * Handle flow state changes and persist data
   */
  const handleFlowStateChange = async (
    newFlowState: FlowStateLevel,
    focusScore: number,
    interactionRate: number,
    confidenceScore: number,
    focusDuration: number
  ) => {
    try {
      // Starting a new flow session
      if (
        (newFlowState === "entering" ||
          newFlowState === "light" ||
          newFlowState === "deep") &&
        (metrics.flowState === "none" || metrics.flowState === "exiting")
      ) {
        const result = await startFlowStateSession({
          flowStateLevel: newFlowState,
          focusScore,
        });

        if (result.success && result.data) {
          setCurrentFlowSessionId(result.data.id);

          // Add initial metric
          await addFlowStateMetric({
            flowSessionId: result.data.id,
            focusScore,
            flowStateLevel: newFlowState,
            interactionRate,
            distractionCount: 0,
            confidenceScore,
          });
        }
      }
      // Ending a flow session
      else if (
        (newFlowState === "exiting" || newFlowState === "none") &&
        (metrics.flowState === "light" || metrics.flowState === "deep") &&
        currentFlowSessionId
      ) {
        await endFlowStateSession({
          id: currentFlowSessionId,
          duration: focusDuration,
          maxFocusScore: focusScore,
          avgFocusScore: focusScore,
          flowStateLevel: newFlowState,
        });

        // Save flow triggers if we had a good flow session
        if (
          focusDuration > MIN_FLOW_DURATION * 2 &&
          focusScore > FLOW_THRESHOLD_LIGHT
        ) {
          // Get the current time to identify time-based triggers
          const now = new Date();
          const hour = now.getHours();

          // Save time-based trigger
          let timeRange = "";
          if (hour >= 5 && hour < 12) {
            timeRange = "Morning (5-12 AM)";
          } else if (hour >= 12 && hour < 17) {
            timeRange = "Afternoon (12-5 PM)";
          } else if (hour >= 17 && hour < 21) {
            timeRange = "Evening (5-9 PM)";
          } else {
            timeRange = "Night (9 PM-5 AM)";
          }

          await createOrUpdateFlowStateTrigger({
            type: "time",
            name: timeRange,
            effectiveness: focusScore,
          });
        }

        setCurrentFlowSessionId(null);
      }
      // Transitioning between flow states
      else if (
        currentFlowSessionId &&
        (newFlowState === "light" || newFlowState === "deep")
      ) {
        // Add a new metric for the current session
        await addFlowStateMetric({
          flowSessionId: currentFlowSessionId,
          focusScore,
          flowStateLevel: newFlowState,
          interactionRate,
          distractionCount: 0,
          confidenceScore,
        });
      }
    } catch (error) {
      console.error("Error handling flow state change:", error);
    }
  };

  return {
    metrics,
    flowTriggers,
    getFlowStateRecommendations,
    getPostFlowRecoveryRecommendations,
    loadFlowTriggers,
    currentFlowSessionId,
  };
}
