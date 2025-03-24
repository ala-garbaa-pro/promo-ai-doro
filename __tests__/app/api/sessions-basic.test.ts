import { NextRequest, NextResponse } from "next/server";

// Mock the auth module
const mockGetSession = jest.fn();
jest.mock("@/lib/auth/better-auth", () => ({
  auth: {
    api: {
      getSession: () => mockGetSession(),
    },
  },
}));

// Mock the session service
const mockCreateSession = jest.fn();
const mockGetSessions = jest.fn();
const mockCompleteSession = jest.fn();
const mockGetSessionById = jest.fn();
jest.mock("@/lib/server/services/session-service", () => ({
  createSession: (...args: any[]) => mockCreateSession(...args),
  getSessions: (...args: any[]) => mockGetSessions(...args),
  completeSession: (...args: any[]) => mockCompleteSession(...args),
  getSessionById: (...args: any[]) => mockGetSessionById(...args),
}));

// Mock the analytics service
const mockGenerateDailyAnalytics = jest.fn();
jest.mock("@/lib/server/services/analytics-service", () => ({
  generateDailyAnalytics: (...args: any[]) =>
    mockGenerateDailyAnalytics(...args),
}));

// Mock the headers function
jest.mock("next/headers", () => ({
  headers: () => new Headers(),
}));

// Import the API handlers
import { GET, POST } from "@/app/api/sessions/route";
import { PATCH } from "@/app/api/sessions/[id]/route";

describe("Sessions API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/sessions", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      mockGetSession.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/sessions");
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns sessions when user is authenticated", async () => {
      // Mock auth to return a session
      mockGetSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock getSessions to return some data
      const mockSessions = [
        { id: "session-1", type: "work", duration: 25 },
        { id: "session-2", type: "short_break", duration: 5 },
      ];
      mockGetSessions.mockResolvedValue(mockSessions);

      const request = new NextRequest("http://localhost:3000/api/sessions");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockSessions);
      expect(mockGetSessions).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-123" })
      );
    });
  });

  describe("POST /api/sessions", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      mockGetSession.mockResolvedValue(null);

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
      mockGetSession.mockResolvedValue({
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
      mockGetSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock createSession to return a new session
      const newSession = {
        id: "session-new",
        type: "work",
        duration: 25,
        userId: "user-123",
      };
      mockCreateSession.mockResolvedValue(newSession);

      const request = new NextRequest("http://localhost:3000/api/sessions", {
        method: "POST",
        body: JSON.stringify({ type: "work", duration: 25 }),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(newSession);
      expect(mockCreateSession).toHaveBeenCalledWith({
        userId: "user-123",
        type: "work",
        duration: 25,
      });
    });
  });

  describe("PATCH /api/sessions/[id]", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      mockGetSession.mockResolvedValue(null);

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
      mockGetSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock getSessionById to return null (session not found)
      mockGetSessionById.mockResolvedValue(null);

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
      mockGetSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock getSessionById to return a session belonging to another user
      mockGetSessionById.mockResolvedValue({
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
      mockGetSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock getSessionById to return a valid session
      mockGetSessionById.mockResolvedValue({
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
      mockCompleteSession.mockResolvedValue(updatedSession);

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
      expect(mockCompleteSession).toHaveBeenCalledWith({
        sessionId: "session-1",
        wasInterrupted: false,
        interruptionCount: 0,
        notes: "Completed successfully",
      });
      expect(mockGenerateDailyAnalytics).toHaveBeenCalledWith(
        "user-123",
        expect.any(Date)
      );
    });
  });
});
