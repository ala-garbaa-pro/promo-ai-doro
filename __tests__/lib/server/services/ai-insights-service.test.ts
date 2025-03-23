import {
  analyzeProductivityPatterns,
  generateAIInsights,
} from "@/lib/server/services/ai-insights-service";
import {
  DailyAnalytics,
  ProductivityByHour,
} from "@/lib/server/services/analytics-service";

describe("AI Insights Service", () => {
  // Sample test data
  const mockDailyAnalytics: DailyAnalytics[] = [
    {
      date: new Date("2023-01-01"),
      totalWorkSessions: 5,
      completedWorkSessions: 4,
      totalWorkMinutes: 100,
      totalBreakMinutes: 20,
      focusScore: 80,
      completedTasks: 3,
    },
    {
      date: new Date("2023-01-02"),
      totalWorkSessions: 6,
      completedWorkSessions: 5,
      totalWorkMinutes: 125,
      totalBreakMinutes: 25,
      focusScore: 85,
      completedTasks: 4,
    },
    {
      date: new Date("2023-01-03"),
      totalWorkSessions: 4,
      completedWorkSessions: 3,
      totalWorkMinutes: 75,
      totalBreakMinutes: 15,
      focusScore: 75,
      completedTasks: 2,
    },
  ];

  const mockProductivityByHour: ProductivityByHour[] = [
    {
      hour: 9,
      completedSessions: 5,
      totalMinutes: 125,
    },
    {
      hour: 10,
      completedSessions: 7,
      totalMinutes: 175,
    },
    {
      hour: 14,
      completedSessions: 4,
      totalMinutes: 100,
    },
    {
      hour: 15,
      completedSessions: 3,
      totalMinutes: 75,
    },
  ];

  describe("analyzeProductivityPatterns", () => {
    it("should analyze productivity patterns correctly", () => {
      const patterns = analyzeProductivityPatterns(
        mockDailyAnalytics,
        mockProductivityByHour
      );

      // Check most productive hours
      expect(patterns.mostProductiveHours).toContain(10); // Hour with most minutes

      // Check average session length
      const expectedAvgLength = Math.round(
        mockDailyAnalytics.reduce((sum, day) => sum + day.totalWorkMinutes, 0) /
          mockDailyAnalytics.reduce(
            (sum, day) => sum + day.completedWorkSessions,
            0
          )
      );
      expect(patterns.averageSessionLength).toBe(expectedAvgLength);

      // Check task completion rate
      const totalSessions = mockDailyAnalytics.reduce(
        (sum, day) => sum + day.completedWorkSessions,
        0
      );
      const totalTasks = mockDailyAnalytics.reduce(
        (sum, day) => sum + day.completedTasks,
        0
      );
      const expectedTaskRate = Math.min(
        100,
        Math.round((totalTasks / totalSessions) * 100)
      );
      expect(patterns.taskCompletionRate).toBe(expectedTaskRate);

      // Check consistency score
      const daysWithSessions = mockDailyAnalytics.filter(
        (day) => day.completedWorkSessions > 0
      ).length;
      const expectedConsistency = Math.round(
        (daysWithSessions / mockDailyAnalytics.length) * 100
      );
      expect(patterns.consistencyScore).toBe(expectedConsistency);
    });

    it("should handle empty data", () => {
      const patterns = analyzeProductivityPatterns([], []);

      expect(patterns.mostProductiveHours).toEqual([]);
      expect(patterns.mostProductiveDays).toEqual([1, 2, 3, 4, 5]); // Default to weekdays
      expect(patterns.averageSessionLength).toBe(25); // Default
      expect(patterns.optimalSessionLength).toBe(25); // Default
      expect(patterns.focusScoreTrend).toBe("stable"); // Default
      expect(patterns.taskCompletionRate).toBe(0);
      expect(patterns.consistencyScore).toBe(0);
      expect(patterns.interruptionRate).toBe(0);
    });
  });

  describe("generateAIInsights", () => {
    it("should generate insights based on patterns", () => {
      const patterns = analyzeProductivityPatterns(
        mockDailyAnalytics,
        mockProductivityByHour
      );
      const insights = generateAIInsights(patterns, mockDailyAnalytics);

      // Check that insights were generated
      expect(insights.length).toBeGreaterThan(0);

      // Check that insights have the correct structure
      insights.forEach((insight) => {
        expect(insight).toHaveProperty("type");
        expect(insight).toHaveProperty("title");
        expect(insight).toHaveProperty("description");
        expect(insight).toHaveProperty("priority");
        expect(insight).toHaveProperty("category");
        expect(insight).toHaveProperty("actionable");
      });

      // Check for specific insights based on our test data
      const productiveHoursInsight = insights.find(
        (i) => i.title === "Peak Productivity Hours"
      );
      expect(productiveHoursInsight).toBeDefined();

      // Check for the "Building Your Profile" tip for small datasets
      const buildingProfileInsight = insights.find(
        (i) => i.title === "Building Your Profile"
      );
      expect(buildingProfileInsight).toBeDefined();
    });

    it("should prioritize insights correctly", () => {
      const patterns = {
        mostProductiveHours: [9, 10, 11],
        mostProductiveDays: [1, 2, 3],
        averageSessionLength: 25,
        optimalSessionLength: 30,
        focusScoreTrend: "decreasing" as const,
        taskCompletionRate: 40,
        consistencyScore: 30,
        interruptionRate: 40,
      };

      const insights = generateAIInsights(patterns, mockDailyAnalytics);

      // High priority insights should come first
      expect(insights[0].priority).toBe("high");

      // Check for specific high-priority insights based on our patterns
      const focusDeclineInsight = insights.find(
        (i) => i.title === "Focus Decline"
      );
      expect(focusDeclineInsight).toBeDefined();
      expect(focusDeclineInsight?.priority).toBe("high");

      const consistencyInsight = insights.find(
        (i) => i.title === "Improve Consistency"
      );
      expect(consistencyInsight).toBeDefined();
      expect(consistencyInsight?.priority).toBe("high");
    });
  });
});
