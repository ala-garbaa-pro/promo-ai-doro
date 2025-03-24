import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/sessions/route";
import { PATCH } from "@/app/api/sessions/[id]/route";
import { auth } from "@/lib/auth/better-auth";
import {
  createSession,
  getSessions,
  completeSession,
  getSessionById,
} from "@/lib/server/services/session-service";
import { generateDailyAnalytics } from "@/lib/server/services/analytics-service";

// Mock the auth module
jest.mock("@/lib/auth/better-auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

// Mock the session service
jest.mock("@/lib/server/services/session-service", () => ({
  createSession: jest.fn(),
  getSessions: jest.fn(),
  completeSession: jest.fn(),
  getSessionById: jest.fn(),
}));

// Mock the analytics service
jest.mock("@/lib/server/services/analytics-service", () => ({
  generateDailyAnalytics: jest.fn(),
}));

// Mock the headers function
jest.mock("next/headers", () => ({
  headers: jest.fn(() => new Headers()),
}));

describe("Sessions API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/sessions", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/sessions");
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns sessions when user is authenticated", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock getSessions to return some data
      const mockSessions = [
        { id: "session-1", type: "work", duration: 25 },
        { id: "session-2", type: "short_break", duration: 5 },
      ];
      (getSessions as jest.Mock).mockResolvedValue(mockSessions);

      const request = new NextRequest("http://localhost:3000/api/sessions");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockSessions);
      expect(getSessions).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-123" })
      );
    });

    it("handles query parameters correctly", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock getSessions to return some data
      (getSessions as jest.Mock).mockResolvedValue([]);

      const url = new URL("http://localhost:3000/api/sessions");
      url.searchParams.set("startDate", "2023-01-01");
      url.searchParams.set("endDate", "2023-01-31");
      url.searchParams.set("type", "work");
      url.searchParams.set("isCompleted", "true");
      url.searchParams.set("limit", "10");
      url.searchParams.set("offset", "0");

      const request = new NextRequest(url);
      await GET(request);

      expect(getSessions).toHaveBeenCalledWith({
        userId: "user-123",
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        type: "work",
        isCompleted: true,
        limit: 10,
        offset: 0,
      });
    });
  });

  describe("POST /api/sessions", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/sessions", {
        method: "POST",
        body: JSON.stringify({ type: "work", duration: 25 }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 400 when required fields are missing", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      const request = new NextRequest("http://localhost:3000/api/sessions", {
        method: "POST",
        body: JSON.stringify({ type: "work" }), // Missing duration
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Type and duration are required");
    });

    it("creates a session successfully", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock createSession to return a new session
      const newSession = {
        id: "session-new",
        type: "work",
        duration: 25,
        userId: "user-123",
      };
      (createSession as jest.Mock).mockResolvedValue(newSession);

      const request = new NextRequest("http://localhost:3000/api/sessions", {
        method: "POST",
        body: JSON.stringify({ type: "work", duration: 25 }),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(newSession);
      expect(createSession).toHaveBeenCalledWith({
        userId: "user-123",
        type: "work",
        duration: 25,
      });
    });
  });

  describe("PATCH /api/sessions/[id]", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/sessions/session-1",
        {
          method: "PATCH",
          body: JSON.stringify({ wasInterrupted: false }),
        }
      );
      const response = await PATCH(request, { params: { id: "session-1" } });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 404 when session is not found", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock getSessionById to return null (session not found)
      (getSessionById as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/sessions/session-1",
        {
          method: "PATCH",
          body: JSON.stringify({ wasInterrupted: false }),
        }
      );
      const response = await PATCH(request, { params: { id: "session-1" } });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Session not found");
    });

    it("returns 403 when session belongs to another user", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock getSessionById to return a session belonging to another user
      (getSessionById as jest.Mock).mockResolvedValue({
        id: "session-1",
        userId: "another-user",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/sessions/session-1",
        {
          method: "PATCH",
          body: JSON.stringify({ wasInterrupted: false }),
        }
      );
      const response = await PATCH(request, { params: { id: "session-1" } });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("completes a session successfully", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock getSessionById to return a valid session
      (getSessionById as jest.Mock).mockResolvedValue({
        id: "session-1",
        userId: "user-123",
      });

      // Mock completeSession to return the updated session
      const updatedSession = {
        id: "session-1",
        userId: "user-123",
        isCompleted: true,
        wasInterrupted: false,
      };
      (completeSession as jest.Mock).mockResolvedValue(updatedSession);

      const request = new NextRequest(
        "http://localhost:3000/api/sessions/session-1",
        {
          method: "PATCH",
          body: JSON.stringify({
            wasInterrupted: false,
            interruptionCount: 0,
            notes: "Completed successfully",
          }),
        }
      );
      const response = await PATCH(request, { params: { id: "session-1" } });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(updatedSession);
      expect(completeSession).toHaveBeenCalledWith({
        sessionId: "session-1",
        wasInterrupted: false,
        interruptionCount: 0,
        notes: "Completed successfully",
      });
      expect(generateDailyAnalytics).toHaveBeenCalledWith(
        "user-123",
        expect.any(Date)
      );
    });
  });
});
