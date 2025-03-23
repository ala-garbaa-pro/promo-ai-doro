import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AdaptiveSessionsService } from "@/lib/server/services/adaptive-sessions-service";
import { db } from "@/lib/server/db";

// Mock the database
jest.mock("@/lib/server/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  },
}));

describe("AdaptiveSessionsService", () => {
  const userId = "test-user-id";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSessionRecommendations", () => {
    it("should return default recommendations when no sessions exist", async () => {
      // Mock the database to return empty array
      jest.mocked(db.where).mockResolvedValueOnce([]);

      const result = await AdaptiveSessionsService.getSessionRecommendations(
        userId
      );

      expect(result).toEqual({
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
      });
    });

    it("should return recommendations with low confidence when few sessions exist", async () => {
      // Mock the database to return a few sessions
      const mockSessions = [
        {
          id: "1",
          duration: 25,
          startedAt: new Date("2023-01-01T09:00:00"),
          completedAt: new Date("2023-01-01T09:25:00"),
          isCompleted: true,
          wasInterrupted: false,
          interruptionCount: 0,
        },
        {
          id: "2",
          duration: 25,
          startedAt: new Date("2023-01-02T10:00:00"),
          completedAt: new Date("2023-01-02T10:25:00"),
          isCompleted: true,
          wasInterrupted: false,
          interruptionCount: 1,
        },
      ];

      jest.mocked(db.where).mockResolvedValueOnce(mockSessions);

      const result = await AdaptiveSessionsService.getSessionRecommendations(
        userId
      );

      expect(result.confidence).toBeLessThan(50);
      expect(result.basedOn.totalSessions).toBe(2);
      expect(result.basedOn.completedSessions).toBe(2);
    });

    it("should handle errors gracefully", async () => {
      // Mock the database to throw an error
      jest.mocked(db.where).mockRejectedValueOnce(new Error("Database error"));

      const result = await AdaptiveSessionsService.getSessionRecommendations(
        userId
      );

      // Should return default recommendations on error
      expect(result).toEqual({
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
      });
    });
  });

  describe("getUserFocusPattern", () => {
    it("should return default focus pattern when no sessions exist", async () => {
      // Mock the database to return empty array
      jest.mocked(db.where).mockResolvedValueOnce([]);

      const result = await AdaptiveSessionsService.getUserFocusPattern(userId);

      expect(result).toEqual({
        optimalTimeOfDay: null,
        optimalDuration: null,
        averageInterruptions: 0,
        completionRate: 0,
        mostProductiveDay: null,
        focusScore: 0,
      });
    });

    it("should calculate focus patterns correctly", async () => {
      // Mock the database to return sessions
      const mockSessions = [
        {
          id: "1",
          duration: 25,
          startedAt: new Date("2023-01-01T09:00:00"), // Sunday
          completedAt: new Date("2023-01-01T09:25:00"),
          isCompleted: true,
          wasInterrupted: false,
          interruptionCount: 0,
        },
        {
          id: "2",
          duration: 25,
          startedAt: new Date("2023-01-02T10:00:00"), // Monday
          completedAt: new Date("2023-01-02T10:25:00"),
          isCompleted: true,
          wasInterrupted: false,
          interruptionCount: 1,
        },
        {
          id: "3",
          duration: 30,
          startedAt: new Date("2023-01-02T14:00:00"), // Monday
          completedAt: null,
          isCompleted: false,
          wasInterrupted: true,
          interruptionCount: 2,
        },
      ];

      jest.mocked(db.where).mockResolvedValueOnce(mockSessions);

      const result = await AdaptiveSessionsService.getUserFocusPattern(userId);

      expect(result.completionRate).toBeCloseTo(66.67, 1);
      expect(result.averageInterruptions).toBeCloseTo(1, 1);
      expect(result.focusScore).toBeGreaterThan(0);
    });

    it("should handle errors gracefully", async () => {
      // Mock the database to throw an error
      jest.mocked(db.where).mockRejectedValueOnce(new Error("Database error"));

      const result = await AdaptiveSessionsService.getUserFocusPattern(userId);

      // Should return default focus pattern on error
      expect(result).toEqual({
        optimalTimeOfDay: null,
        optimalDuration: null,
        averageInterruptions: 0,
        completionRate: 0,
        mostProductiveDay: null,
        focusScore: 0,
      });
    });
  });
});
