import { DailyAnalytics, ProductivityByHour } from "./analytics-service";

export interface AIInsight {
  type: "tip" | "observation" | "recommendation" | "achievement";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  category: "focus" | "tasks" | "habits" | "time" | "general";
  actionable: boolean;
  action?: string;
}

export interface ProductivityPatterns {
  mostProductiveHours: number[];
  mostProductiveDays: number[];
  averageSessionLength: number;
  optimalSessionLength: number;
  focusScoreTrend: "increasing" | "decreasing" | "stable";
  taskCompletionRate: number;
  consistencyScore: number;
  interruptionRate: number;
}

/**
 * Analyze productivity data to identify patterns
 */
export function analyzeProductivityPatterns(
  dailyAnalytics: DailyAnalytics[],
  productivityByHour: ProductivityByHour[]
): ProductivityPatterns {
  // Default values
  const patterns: ProductivityPatterns = {
    mostProductiveHours: [],
    mostProductiveDays: [1, 2, 3, 4, 5], // Default to weekdays
    averageSessionLength: 25,
    optimalSessionLength: 25,
    focusScoreTrend: "stable",
    taskCompletionRate: 0,
    consistencyScore: 0,
    interruptionRate: 0,
  };

  if (!dailyAnalytics || dailyAnalytics.length === 0) {
    return patterns;
  }

  // Calculate most productive hours
  if (productivityByHour && productivityByHour.length > 0) {
    // Sort by total minutes in descending order
    const sortedHours = [...productivityByHour].sort(
      (a, b) => b.totalMinutes - a.totalMinutes
    );

    // Take top 3 most productive hours
    patterns.mostProductiveHours = sortedHours
      .slice(0, 3)
      .map((hour) => hour.hour);
  }

  // Calculate most productive days
  const productivityByDay = Array(7).fill(0);
  const sessionsPerDay = Array(7).fill(0);

  dailyAnalytics.forEach((day) => {
    const dayOfWeek = new Date(day.date).getDay();
    productivityByDay[dayOfWeek] += day.totalWorkMinutes;
    sessionsPerDay[dayOfWeek] += day.completedWorkSessions;
  });

  // Find the most productive days
  const dayProductivity = productivityByDay.map((minutes, index) => ({
    day: index,
    minutes,
  }));

  const sortedDays = dayProductivity
    .sort((a, b) => b.minutes - a.minutes)
    .filter((day) => day.minutes > 0);

  if (sortedDays.length > 0) {
    patterns.mostProductiveDays = sortedDays.slice(0, 3).map((day) => day.day);
  }

  // Calculate average session length
  const totalSessions = dailyAnalytics.reduce(
    (sum, day) => sum + day.completedWorkSessions,
    0
  );

  const totalMinutes = dailyAnalytics.reduce(
    (sum, day) => sum + day.totalWorkMinutes,
    0
  );

  if (totalSessions > 0) {
    patterns.averageSessionLength = Math.round(totalMinutes / totalSessions);
  }

  // Calculate optimal session length
  // This is a simplified approach - in a real system, we would analyze which session lengths
  // correlate with the highest focus scores
  const sessionLengthGroups: {
    [key: number]: { count: number; score: number };
  } = {};

  dailyAnalytics.forEach((day) => {
    if (day.completedWorkSessions > 0) {
      const avgSessionLength = Math.round(
        day.totalWorkMinutes / day.completedWorkSessions
      );
      // Round to nearest 5 minutes
      const roundedLength = Math.round(avgSessionLength / 5) * 5;

      if (!sessionLengthGroups[roundedLength]) {
        sessionLengthGroups[roundedLength] = { count: 0, score: 0 };
      }

      sessionLengthGroups[roundedLength].count += 1;
      sessionLengthGroups[roundedLength].score += day.focusScore;
    }
  });

  let bestLength = 25; // Default
  let bestScore = 0;

  Object.entries(sessionLengthGroups).forEach(([length, data]) => {
    const avgScore = data.score / data.count;
    if (avgScore > bestScore && data.count >= 3) {
      // Require at least 3 days with this length
      bestScore = avgScore;
      bestLength = parseInt(length);
    }
  });

  patterns.optimalSessionLength = bestLength;

  // Calculate focus score trend
  if (dailyAnalytics.length >= 7) {
    const recentScores = dailyAnalytics.slice(-7).map((day) => day.focusScore);

    const firstHalf = recentScores.slice(0, 3);
    const secondHalf = recentScores.slice(-3);

    const firstHalfAvg =
      firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

    const difference = secondHalfAvg - firstHalfAvg;

    if (difference > 5) {
      patterns.focusScoreTrend = "increasing";
    } else if (difference < -5) {
      patterns.focusScoreTrend = "decreasing";
    } else {
      patterns.focusScoreTrend = "stable";
    }
  }

  // Calculate task completion rate
  const totalTasks = dailyAnalytics.reduce(
    (sum, day) => sum + day.completedTasks,
    0
  );

  // Assuming each work session has at least one task
  if (totalSessions > 0) {
    patterns.taskCompletionRate = Math.min(
      100,
      Math.round((totalTasks / totalSessions) * 100)
    );
  }

  // Calculate consistency score (0-100)
  // This measures how consistently the user completes sessions day to day
  const daysWithSessions = dailyAnalytics.filter(
    (day) => day.completedWorkSessions > 0
  ).length;

  patterns.consistencyScore = Math.round(
    (daysWithSessions / dailyAnalytics.length) * 100
  );

  // Calculate interruption rate
  // This would require additional data about interruptions during sessions
  // For now, we'll use a placeholder calculation
  const totalWorkSessions = dailyAnalytics.reduce(
    (sum, day) => sum + day.totalWorkSessions,
    0
  );

  const completedWorkSessions = dailyAnalytics.reduce(
    (sum, day) => sum + day.completedWorkSessions,
    0
  );

  if (totalWorkSessions > 0) {
    // Assuming incomplete sessions were interrupted
    patterns.interruptionRate = Math.round(
      ((totalWorkSessions - completedWorkSessions) / totalWorkSessions) * 100
    );
  }

  return patterns;
}

/**
 * Generate AI insights based on productivity patterns
 */
export function generateAIInsights(
  patterns: ProductivityPatterns,
  dailyAnalytics: DailyAnalytics[]
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Focus time insights
  if (patterns.focusScoreTrend === "increasing") {
    insights.push({
      type: "achievement",
      title: "Focus Improvement",
      description:
        "Your focus score is trending upward. Keep up the good work!",
      priority: "medium",
      category: "focus",
      actionable: false,
    });
  } else if (patterns.focusScoreTrend === "decreasing") {
    insights.push({
      type: "observation",
      title: "Focus Decline",
      description:
        "Your focus score has been decreasing recently. Consider reviewing your work environment for potential distractions.",
      priority: "high",
      category: "focus",
      actionable: true,
      action: "Review your work environment and eliminate distractions",
    });
  }

  // Optimal session length insight
  if (patterns.optimalSessionLength !== 25) {
    insights.push({
      type: "recommendation",
      title: "Optimal Session Length",
      description: `Your data suggests that ${patterns.optimalSessionLength}-minute focus sessions are most effective for you. Consider adjusting your timer settings.`,
      priority: "medium",
      category: "focus",
      actionable: true,
      action: `Set your focus timer to ${patterns.optimalSessionLength} minutes`,
    });
  }

  // Most productive time insight
  if (patterns.mostProductiveHours.length > 0) {
    const formatHour = (hour: number) => {
      if (hour === 0) return "12 AM";
      if (hour === 12) return "12 PM";
      return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    };

    const productiveHours = patterns.mostProductiveHours
      .map(formatHour)
      .join(", ");

    insights.push({
      type: "recommendation",
      title: "Peak Productivity Hours",
      description: `You tend to be most productive around ${productiveHours}. Schedule your most important tasks during these times.`,
      priority: "high",
      category: "time",
      actionable: true,
      action: "Schedule important tasks during your peak productivity hours",
    });
  }

  // Consistency insight
  if (patterns.consistencyScore < 50) {
    insights.push({
      type: "recommendation",
      title: "Improve Consistency",
      description:
        "Your focus sessions are inconsistent. Establishing a regular schedule can help build better habits.",
      priority: "high",
      category: "habits",
      actionable: true,
      action: "Set a regular schedule for your focus sessions",
    });
  } else if (patterns.consistencyScore >= 80) {
    insights.push({
      type: "achievement",
      title: "Consistent Habits",
      description:
        "You've established a consistent focus routine. This is excellent for long-term productivity!",
      priority: "low",
      category: "habits",
      actionable: false,
    });
  }

  // Interruption rate insight
  if (patterns.interruptionRate > 30) {
    insights.push({
      type: "recommendation",
      title: "Reduce Interruptions",
      description: `${patterns.interruptionRate}% of your sessions are interrupted. Try using Do Not Disturb mode or finding a quieter workspace.`,
      priority: "high",
      category: "focus",
      actionable: true,
      action: "Enable Do Not Disturb mode during focus sessions",
    });
  }

  // Task completion rate insight
  if (patterns.taskCompletionRate < 50) {
    insights.push({
      type: "recommendation",
      title: "Task Sizing",
      description:
        "Your task completion rate is low. Consider breaking down tasks into smaller, more manageable pieces.",
      priority: "medium",
      category: "tasks",
      actionable: true,
      action: "Break down large tasks into smaller subtasks",
    });
  } else if (patterns.taskCompletionRate > 90) {
    insights.push({
      type: "achievement",
      title: "Excellent Task Completion",
      description:
        "You're completing tasks at an impressive rate. Your task sizing is effective!",
      priority: "low",
      category: "tasks",
      actionable: false,
    });
  }

  // Most productive days insight
  if (patterns.mostProductiveDays.length > 0) {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const productiveDays = patterns.mostProductiveDays
      .map((day) => dayNames[day])
      .join(", ");

    insights.push({
      type: "observation",
      title: "Productive Days",
      description: `You tend to be most productive on ${productiveDays}. Consider scheduling your most important work on these days.`,
      priority: "medium",
      category: "time",
      actionable: true,
      action: `Schedule important work on ${productiveDays}`,
    });
  }

  // General tips based on data volume
  if (dailyAnalytics.length < 14) {
    insights.push({
      type: "tip",
      title: "Building Your Profile",
      description:
        "Keep using the app to get more personalized insights. We need at least 2 weeks of data for the most accurate recommendations.",
      priority: "low",
      category: "general",
      actionable: false,
    });
  }

  // Sort insights by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return insights;
}

/**
 * Get AI insights for a user based on their analytics data
 */
export function getAIInsights(
  dailyAnalytics: DailyAnalytics[],
  productivityByHour: ProductivityByHour[]
): AIInsight[] {
  // Analyze patterns
  const patterns = analyzeProductivityPatterns(
    dailyAnalytics,
    productivityByHour
  );

  // Generate insights
  const insights = generateAIInsights(patterns, dailyAnalytics);

  return insights;
}
