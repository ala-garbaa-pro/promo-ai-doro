import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/tasks/route";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/server/db";
import { tasks } from "@/lib/server/db/schema";

// Mock the auth module
jest.mock("@/lib/auth/better-auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

// Mock the database
jest.mock("@/lib/server/db", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            orderBy: jest.fn(() => Promise.resolve([])),
          })),
          orderBy: jest.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ id: "task-1" }])),
      })),
    })),
  },
}));

// Mock the schema
jest.mock("@/lib/server/db/schema", () => ({
  tasks: {
    userId: "userId",
    status: "status",
    category: "category",
    priority: "priority",
    createdAt: "createdAt",
  },
}));

// Mock the headers function
jest.mock("next/headers", () => ({
  headers: jest.fn(() => new Headers()),
}));

// Mock drizzle-orm
jest.mock("drizzle-orm", () => ({
  eq: jest.fn((field, value) => ({ field, value })),
}));

describe("Tasks API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/tasks", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/tasks");
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns tasks when user is authenticated", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock db to return some tasks
      const mockTasks = [
        { id: "task-1", title: "Task 1" },
        { id: "task-2", title: "Task 2" },
      ];

      // Override the mock for this specific test
      const orderByMock = jest.fn().mockResolvedValue(mockTasks);
      const whereMock = jest.fn(() => ({ orderBy: orderByMock }));
      const fromMock = jest.fn(() => ({ where: whereMock }));
      const selectMock = jest.fn(() => ({ from: fromMock }));

      (db.select as jest.Mock).mockReturnValue({ from: fromMock });

      const request = new NextRequest("http://localhost:3000/api/tasks");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockTasks);
      expect(selectMock).toHaveBeenCalled;
      expect(fromMock).toHaveBeenCalledWith(tasks);
      expect(whereMock).toHaveBeenCalled;
    });

    it("applies filters correctly", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      // Create a URL with query parameters
      const url = new URL("http://localhost:3000/api/tasks");
      url.searchParams.set("status", "pending");
      url.searchParams.set("category", "work");
      url.searchParams.set("priority", "high");

      // Setup mock chain
      const orderByMock = jest.fn().mockResolvedValue([]);
      const whereMock3 = jest.fn(() => ({ orderBy: orderByMock }));
      const whereMock2 = jest.fn(() => ({ where: whereMock3 }));
      const whereMock1 = jest.fn(() => ({ where: whereMock2 }));
      const fromMock = jest.fn(() => ({ where: whereMock1 }));

      (db.select as jest.Mock).mockReturnValue({ from: fromMock });

      const request = new NextRequest(url);
      await GET(request);

      // Verify that all filters were applied
      expect(fromMock).toHaveBeenCalledWith(tasks);
      expect(whereMock1).toHaveBeenCalled();
      expect(whereMock2).toHaveBeenCalled();
      expect(whereMock3).toHaveBeenCalled();
      expect(orderByMock).toHaveBeenCalledWith(tasks.createdAt);
    });
  });

  describe("POST /api/tasks", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "New Task" }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 400 when title is missing", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      const request = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({}), // Missing title
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Title is required");
    });

    it("creates a task successfully", async () => {
      // Mock auth to return a session
      (auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock db to return a new task
      const newTask = {
        id: "task-new",
        title: "New Task",
        priority: "medium",
        status: "pending",
        userId: "user-123",
      };

      const returningMock = jest.fn().mockResolvedValue([newTask]);
      const valuesMock = jest.fn(() => ({ returning: returningMock }));

      (db.insert as jest.Mock).mockReturnValue({ values: valuesMock });

      const request = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "New Task",
          description: "Task description",
          priority: "medium",
          status: "pending",
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(newTask);
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          title: "New Task",
          description: "Task description",
          priority: "medium",
          status: "pending",
        })
      );
    });
  });
});
