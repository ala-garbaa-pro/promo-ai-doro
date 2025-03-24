"use client";

import { Task, TaskPriority } from "@/hooks/use-tasks";
import { useSettings } from "@/lib/contexts/settings-context";

// Define the energy level types
export type EnergyLevel = "high" | "medium" | "low";

// Define the task complexity types
export type TaskComplexity = "high" | "medium" | "low";

// Define the cognitive load types
export type CognitiveLoadType =
  | "focus"
  | "creativity"
  | "decision-making"
  | "learning"
  | "routine";

// Define the chronotype types
export type ChronoType = "early-bird" | "night-owl" | "intermediate";

// Interface for task with cognitive metadata
export interface CognitiveTask extends Task {
  complexity?: TaskComplexity;
  cognitiveLoadType?: CognitiveLoadType;
  estimatedDuration?: number; // in minutes
  idealEnergyLevel?: EnergyLevel;
}

// Interface for time block with energy level
export interface TimeBlock {
  startTime: Date;
  endTime: Date;
  energyLevel: EnergyLevel;
  available: boolean;
}

// Interface for user cognitive profile
export interface CognitiveProfile {
  chronotype: ChronoType;
  peakHours: number[]; // 0-23 hours when user has highest energy
  productiveHours: number[]; // 0-23 hours when user is generally productive
  lowEnergyHours: number[]; // 0-23 hours when user has lowest energy
  focusSessionDuration: number; // Optimal focus session duration in minutes
  breakDuration: number; // Optimal break duration in minutes
  contextSwitchingCost: number; // 1-10 rating of how difficult context switching is
  distractionSensitivity: number; // 1-10 rating of sensitivity to distractions
}

// Default cognitive profile
const defaultCognitiveProfile: CognitiveProfile = {
  chronotype: "intermediate",
  peakHours: [9, 10, 11, 15, 16],
  productiveHours: [8, 9, 10, 11, 14, 15, 16, 17],
  lowEnergyHours: [12, 13, 21, 22, 23, 0, 1, 2, 3, 4, 5],
  focusSessionDuration: 25,
  breakDuration: 5,
  contextSwitchingCost: 5,
  distractionSensitivity: 5,
};

/**
 * Estimates the complexity of a task based on its description, estimated pomodoros, and other factors
 * @param task The task to analyze
 * @returns The estimated complexity level
 */
export function estimateTaskComplexity(task: Task): TaskComplexity {
  // Start with a base score
  let complexityScore = 0;

  // Factor 1: Estimated pomodoros (if available)
  if (task.estimatedPomodoros) {
    if (task.estimatedPomodoros >= 5) {
      complexityScore += 3;
    } else if (task.estimatedPomodoros >= 3) {
      complexityScore += 2;
    } else {
      complexityScore += 1;
    }
  }

  // Factor 2: Priority
  if (task.priority === "high") {
    complexityScore += 2;
  } else if (task.priority === "medium") {
    complexityScore += 1;
  }

  // Factor 3: Description length (if available)
  if (task.description) {
    const words = task.description.split(/\s+/).length;
    if (words > 100) {
      complexityScore += 2;
    } else if (words > 50) {
      complexityScore += 1;
    }
  }

  // Factor 4: Title keywords that suggest complexity
  const complexityKeywords = [
    "analyze",
    "research",
    "develop",
    "create",
    "design",
    "complex",
    "difficult",
    "challenging",
    "strategic",
    "plan",
    "architecture",
    "framework",
    "system",
    "algorithm",
  ];

  if (task.title) {
    const lowerTitle = task.title.toLowerCase();
    for (const keyword of complexityKeywords) {
      if (lowerTitle.includes(keyword)) {
        complexityScore += 1;
        // Count each keyword match separately
      }
    }
  }

  // Determine complexity level based on score
  if (complexityScore >= 5) {
    return "high";
  } else if (complexityScore >= 3) {
    return "medium";
  } else {
    return "low";
  }
}

/**
 * Determines the cognitive load type of a task based on its title, description, and category
 * @param task The task to analyze
 * @returns The estimated cognitive load type
 */
export function determineCognitiveLoadType(task: Task): CognitiveLoadType {
  // Define keyword sets for different cognitive load types
  const focusKeywords = [
    "analyze",
    "study",
    "review",
    "read",
    "research",
    "concentrate",
    "examine",
    "investigate",
    "debug",
  ];

  const creativityKeywords = [
    "create",
    "design",
    "brainstorm",
    "innovate",
    "develop",
    "imagine",
    "generate",
    "ideate",
    "visualize",
  ];

  const decisionMakingKeywords = [
    "decide",
    "choose",
    "evaluate",
    "assess",
    "select",
    "prioritize",
    "judge",
    "determine",
    "plan",
    "strategy",
  ];

  const learningKeywords = [
    "learn",
    "study",
    "understand",
    "practice",
    "master",
    "comprehend",
    "absorb",
    "grasp",
    "familiarize",
  ];

  const routineKeywords = [
    "update",
    "maintain",
    "check",
    "organize",
    "clean",
    "arrange",
    "file",
    "sort",
    "routine",
    "regular",
  ];

  // Combine title and description for analysis
  const textToAnalyze = `${task.title} ${task.description || ""}`.toLowerCase();

  // Count matches for each category
  let focusCount = 0;
  let creativityCount = 0;
  let decisionCount = 0;
  let learningCount = 0;
  let routineCount = 0;

  // Check for keyword matches
  for (const keyword of focusKeywords) {
    if (textToAnalyze.includes(keyword)) focusCount++;
  }

  for (const keyword of creativityKeywords) {
    if (textToAnalyze.includes(keyword)) creativityCount++;
  }

  for (const keyword of decisionMakingKeywords) {
    if (textToAnalyze.includes(keyword)) decisionCount++;
  }

  for (const keyword of learningKeywords) {
    if (textToAnalyze.includes(keyword)) learningCount++;
  }

  for (const keyword of routineKeywords) {
    if (textToAnalyze.includes(keyword)) routineCount++;
  }

  // Determine the dominant type
  const counts = [
    { type: "focus" as CognitiveLoadType, count: focusCount },
    { type: "creativity" as CognitiveLoadType, count: creativityCount },
    { type: "decision-making" as CognitiveLoadType, count: decisionCount },
    { type: "learning" as CognitiveLoadType, count: learningCount },
    { type: "routine" as CognitiveLoadType, count: routineCount },
  ];

  // Sort by count in descending order
  counts.sort((a, b) => b.count - a.count);

  // If there are no matches or a tie for first place, make a best guess based on other factors
  if (counts[0].count === 0 || counts[0].count === counts[1].count) {
    // Default to routine for short tasks
    if (task.estimatedPomodoros && task.estimatedPomodoros <= 1) {
      return "routine";
    }

    // Default to focus for high priority tasks
    if (task.priority === "high") {
      return "focus";
    }

    // Default to creativity for tasks with certain categories
    if (
      task.category &&
      ["design", "content", "marketing", "creative"].includes(
        task.category.toLowerCase()
      )
    ) {
      return "creativity";
    }

    // Default fallback
    return "focus";
  }

  return counts[0].type;
}

/**
 * Determines the ideal energy level for a task based on its complexity and cognitive load type
 * @param task The cognitive task with complexity and load type
 * @returns The ideal energy level for the task
 */
export function determineIdealEnergyLevel(task: CognitiveTask): EnergyLevel {
  // High complexity tasks generally require high energy
  if (task.complexity === "high") {
    return "high";
  }

  // Medium complexity tasks depend on cognitive load type
  if (task.complexity === "medium") {
    if (
      task.cognitiveLoadType === "focus" ||
      task.cognitiveLoadType === "decision-making" ||
      task.cognitiveLoadType === "learning"
    ) {
      return "high";
    } else {
      return "medium";
    }
  }

  // Low complexity tasks also depend on cognitive load type
  if (task.cognitiveLoadType === "routine") {
    return "low";
  } else if (task.cognitiveLoadType === "creativity") {
    // Creative tasks can sometimes benefit from lower energy states
    return "medium";
  }

  // Default for other low complexity tasks
  return "medium";
}

/**
 * Generates time blocks for a day with estimated energy levels based on user's cognitive profile
 * @param date The date to generate time blocks for
 * @param profile The user's cognitive profile
 * @param existingEvents Existing calendar events to account for
 * @returns Array of time blocks with energy levels
 */
export function generateTimeBlocks(
  date: Date,
  profile: CognitiveProfile = defaultCognitiveProfile,
  existingEvents: { start: Date; end: Date }[] = []
): TimeBlock[] {
  const timeBlocks: TimeBlock[] = [];
  const startHour = 8; // Start at 8 AM
  const endHour = 18; // End at 6 PM

  // Create a new date object for the start of the day
  const dayStart = new Date(date);
  dayStart.setHours(startHour, 0, 0, 0);

  // Create blocks in 30-minute increments
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const blockStart = new Date(dayStart);
      blockStart.setHours(hour, minute, 0, 0);

      const blockEnd = new Date(blockStart);
      blockEnd.setMinutes(blockEnd.getMinutes() + 30);

      // Determine energy level based on user's profile
      let energyLevel: EnergyLevel;
      if (profile.peakHours.includes(hour)) {
        energyLevel = "high";
      } else if (profile.productiveHours.includes(hour)) {
        energyLevel = "medium";
      } else if (profile.lowEnergyHours.includes(hour)) {
        energyLevel = "low";
      } else {
        energyLevel = "medium"; // Default
      }

      // Check if this block overlaps with any existing events
      const isAvailable = !existingEvents.some((event) => {
        return blockStart < event.end && blockEnd > event.start;
      });

      timeBlocks.push({
        startTime: blockStart,
        endTime: blockEnd,
        energyLevel,
        available: isAvailable,
      });
    }
  }

  return timeBlocks;
}

/**
 * Schedules tasks based on their cognitive requirements and available time blocks
 * @param tasks Array of cognitive tasks to schedule
 * @param timeBlocks Available time blocks with energy levels
 * @returns Scheduled tasks with assigned time blocks
 */
export function scheduleTasks(
  tasks: CognitiveTask[],
  timeBlocks: TimeBlock[]
): { task: CognitiveTask; timeBlock: TimeBlock }[] {
  // First, enhance tasks with cognitive metadata if not already present
  const enhancedTasks = tasks.map((task) => {
    const enhancedTask: CognitiveTask = { ...task };

    if (!enhancedTask.complexity) {
      enhancedTask.complexity = estimateTaskComplexity(task);
    }

    if (!enhancedTask.cognitiveLoadType) {
      enhancedTask.cognitiveLoadType = determineCognitiveLoadType(task);
    }

    if (!enhancedTask.idealEnergyLevel) {
      enhancedTask.idealEnergyLevel = determineIdealEnergyLevel(enhancedTask);
    }

    if (!enhancedTask.estimatedDuration && enhancedTask.estimatedPomodoros) {
      // Estimate duration based on pomodoros (25 min per pomodoro)
      enhancedTask.estimatedDuration = enhancedTask.estimatedPomodoros * 25;
    } else if (!enhancedTask.estimatedDuration) {
      // Default duration based on complexity
      switch (enhancedTask.complexity) {
        case "high":
          enhancedTask.estimatedDuration = 60;
          break;
        case "medium":
          enhancedTask.estimatedDuration = 45;
          break;
        case "low":
          enhancedTask.estimatedDuration = 25;
          break;
        default:
          enhancedTask.estimatedDuration = 30;
      }
    }

    return enhancedTask;
  });

  // Sort tasks by priority and then by complexity
  const sortedTasks = [...enhancedTasks].sort((a, b) => {
    // First sort by priority
    const priorityOrder: Record<TaskPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then sort by complexity
    const complexityOrder: Record<TaskComplexity, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return (
      complexityOrder[a.complexity || "medium"] -
      complexityOrder[b.complexity || "medium"]
    );
  });

  // Filter available time blocks
  const availableBlocks = timeBlocks.filter((block) => block.available);

  // Schedule tasks
  const scheduledTasks: { task: CognitiveTask; timeBlock: TimeBlock }[] = [];
  const usedBlocks = new Set<TimeBlock>();

  for (const task of sortedTasks) {
    // Find the best matching time block for this task
    const idealEnergyLevel = task.idealEnergyLevel || "medium";
    const estimatedDuration = task.estimatedDuration || 30;

    // Calculate how many 30-minute blocks we need
    const blocksNeeded = Math.ceil(estimatedDuration / 30);

    // Find consecutive blocks that match the energy level and are available
    let bestMatch: TimeBlock[] = [];
    let bestMatchScore = -1;

    for (let i = 0; i < availableBlocks.length; i++) {
      if (usedBlocks.has(availableBlocks[i])) continue;

      // Check if we can find enough consecutive blocks
      const potentialBlocks: TimeBlock[] = [availableBlocks[i]];

      for (let j = 1; j < blocksNeeded && i + j < availableBlocks.length; j++) {
        const nextBlock = availableBlocks[i + j];

        // Check if the next block is consecutive and available
        if (
          usedBlocks.has(nextBlock) ||
          nextBlock.startTime.getTime() !==
            potentialBlocks[j - 1].endTime.getTime()
        ) {
          break;
        }

        potentialBlocks.push(nextBlock);
      }

      // If we found enough blocks, calculate the match score
      if (potentialBlocks.length === blocksNeeded) {
        let score = 0;

        // Score based on energy level match
        for (const block of potentialBlocks) {
          if (block.energyLevel === idealEnergyLevel) {
            score += 3;
          } else if (
            (idealEnergyLevel === "high" && block.energyLevel === "medium") ||
            (idealEnergyLevel === "medium" &&
              (block.energyLevel === "high" || block.energyLevel === "low")) ||
            (idealEnergyLevel === "low" && block.energyLevel === "medium")
          ) {
            score += 1;
          }
        }

        // If this is the best match so far, update
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatch = potentialBlocks;
        }
      }
    }

    // If we found a match, schedule the task
    if (bestMatch.length > 0) {
      scheduledTasks.push({
        task,
        timeBlock: bestMatch[0], // Assign the first block (we'll handle multi-block tasks in the UI)
      });

      // Mark all blocks as used
      for (const block of bestMatch) {
        usedBlocks.add(block);
      }
    }
  }

  return scheduledTasks;
}

/**
 * Hook for using the adaptive task scheduler
 */
export function useAdaptiveTaskScheduler() {
  const { settings } = useSettings();

  // Create a cognitive profile based on user settings
  const createCognitiveProfile = (): CognitiveProfile => {
    // Default to intermediate chronotype
    let chronotype: ChronoType = "intermediate";

    // Determine chronotype based on settings if available
    if (settings.timer.earlyBirdMode) {
      chronotype = "early-bird";
    } else if (settings.timer.nightOwlMode) {
      chronotype = "night-owl";
    }

    // Create peak hours based on chronotype
    let peakHours: number[] = [];
    let productiveHours: number[] = [];
    let lowEnergyHours: number[] = [];

    switch (chronotype) {
      case "early-bird":
        peakHours = [8, 9, 10, 11];
        productiveHours = [7, 8, 9, 10, 11, 12, 13, 14, 15];
        lowEnergyHours = [16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4];
        break;
      case "night-owl":
        peakHours = [18, 19, 20, 21];
        productiveHours = [15, 16, 17, 18, 19, 20, 21, 22, 23];
        lowEnergyHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        break;
      default:
        peakHours = [9, 10, 11, 15, 16];
        productiveHours = [8, 9, 10, 11, 14, 15, 16, 17];
        lowEnergyHours = [12, 13, 21, 22, 23, 0, 1, 2, 3, 4, 5];
    }

    return {
      chronotype,
      peakHours,
      productiveHours,
      lowEnergyHours,
      focusSessionDuration: settings.timer.pomodoroDuration,
      breakDuration: settings.timer.shortBreakDuration,
      contextSwitchingCost: 5, // Default value
      distractionSensitivity: 5, // Default value
    };
  };

  return {
    estimateTaskComplexity,
    determineCognitiveLoadType,
    determineIdealEnergyLevel,
    generateTimeBlocks: (
      date: Date,
      existingEvents: { start: Date; end: Date }[] = []
    ) => generateTimeBlocks(date, createCognitiveProfile(), existingEvents),
    scheduleTasks,
    createCognitiveProfile,
  };
}
