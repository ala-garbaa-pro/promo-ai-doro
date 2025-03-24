// Mock the auth module
const mockGetSession = jest.fn();
jest.mock("@/lib/auth/better-auth", () => ({
  auth: {
    api: {
      getSession: () => mockGetSession(),
    },
  },
}));

// Mock the database
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/lib/server/db", () => ({
  db: {
    select: () => mockSelect(),
    insert: () => mockInsert(),
    update: () => mockUpdate(),
    delete: () => mockDelete(),
  },
}));

// Mock the schema
jest.mock("@/lib/server/db/schema", () => ({
  tasks: {
    id: "id",
    userId: "userId",
    title: "title",
    description: "description",
    status: "status",
    priority: "priority",
    estimatedPomodoros: "estimatedPomodoros",
    actualPomodoros: "actualPomodoros",
    dueDate: "dueDate",
    category: "category",
    tags: "tags",
    order: "order",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
}));

// Mock drizzle-orm
jest.mock("drizzle-orm", () => ({
  eq: jest.fn((field, value) => ({ field, value, operator: "eq" })),
  and: jest.fn((...conditions) => ({ conditions, operator: "and" })),
  desc: jest.fn((field) => ({ field, direction: "desc" })),
  asc: jest.fn((field) => ({ field, direction: "asc" })),
}));

// Mock NextRequest and NextResponse
jest.mock("next/server", () => {
  const originalModule = jest.requireActual("next/server");
  return {
    ...originalModule,
    NextRequest: function MockNextRequest(
      input: RequestInfo | URL,
      init?: RequestInit
    ) {
      return {
        url: typeof input === "string" ? input : input.toString(),
        method: init?.method || "GET",
        headers: new Headers(init?.headers),
        json: async () => {
          return init?.body ? JSON.parse(init.body.toString()) : {};
        },
        nextUrl: {
          searchParams: new URLSearchParams(
            typeof input === "string" ? input.split("?")[1] || "" : ""
          ),
        },
      };
    },
    NextResponse: {
      json: (body: any, init?: ResponseInit) => {
        return {
          status: init?.status || 200,
          json: async () => body,
        };
      },
    },
  };
});

// Now import the route handlers
import { GET, POST } from "@/app/api/tasks/route";
import { GET as GET_TASK, PATCH, DELETE } from "@/app/api/tasks/[id]/route";

// Create a mock NextRequest
class MockNextRequest {
  url: string;
  method: string;
  body: any;
  headers: Headers;
  nextUrl: URL;

  constructor(
    url: string,
    options: { method?: string; body?: any; headers?: Headers } = {}
  ) {
    this.url = url;
    this.method = options.method || "GET";
    this.body = options.body;
    this.headers = options.headers || new Headers();
    this.nextUrl = new URL(url);
  }

  async json() {
    return this.body;
  }
}

// Create a mock NextResponse
class MockNextResponse {
  status: number;
  body: any;

  constructor(body: any, options: { status?: number } = {}) {
    this.body = body;
    this.status = options.status || 200;
  }

  static json(body: any, options: { status?: number } = {}) {
    return new MockNextResponse(body, options);
  }

  async json() {
    return this.body;
  }
}

describe("Tasks API - Simple Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/tasks", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      mockGetSession.mockResolvedValue(null);

      const request = new MockNextRequest("http://localhost:3000/api/tasks");
      const response = await GET(request as any);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns tasks when user is authenticated", async () => {
      // Mock auth to return a session
      mockGetSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock db to return some tasks
      const mockTasks = [
        { id: "task-1", title: "Task 1" },
        { id: "task-2", title: "Task 2" },
      ];

      const mockOrderBy = jest.fn().mockResolvedValue(mockTasks);
      const mockWhere = jest.fn(() => ({ orderBy: mockOrderBy }));
      const mockFrom = jest.fn(() => ({ where: mockWhere }));

      mockSelect.mockReturnValue({ from: mockFrom });

      const request = new MockNextRequest("http://localhost:3000/api/tasks");
      const response = await GET(request as any);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockTasks);
    });
  });

  describe("POST /api/tasks", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      mockGetSession.mockResolvedValue(null);

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
      mockGetSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      const request = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Title is required");
    });

    it("creates a task successfully", async () => {
      // Mock auth to return a session
      mockGetSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock task creation
      const newTask = {
        id: "task-1",
        title: "New Task",
        priority: "medium",
        status: "pending",
      };

      const mockReturning = jest.fn().mockResolvedValue([newTask]);
      const mockValues = jest.fn(() => ({ returning: mockReturning }));

      mockInsert.mockReturnValue({ values: mockValues });

      const request = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "New Task",
          description: "Task description",
          priority: "medium",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(newTask);
    });
  });

  describe("GET /api/tasks/[id]", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Mock auth to return no session
      mockGetSession.mockResolvedValue(null);

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1"
      );
      const params = { id: "task-1" };

      const response = await GET_TASK(request as any, { params } as any);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 404 when task is not found", async () => {
      // Mock auth to return a session
      mockGetSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock db to return no task
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn(() => ({ where: mockWhere }));

      mockSelect.mockReturnValue({ from: mockFrom });

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1"
      );
      const params = { id: "task-1" };

      const response = await GET_TASK(request as any, { params } as any);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Task not found");
    });

    it("returns task when found", async () => {
      // Mock auth to return a session
      mockGetSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      // Mock db to return a task
      const mockTask = { id: "task-1", title: "Task 1" };
      const mockWhere = jest.fn().mockResolvedValue([mockTask]);
      const mockFrom = jest.fn(() => ({ where: mockWhere }));

      mockSelect.mockReturnValue({ from: mockFrom });

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1"
      );
      const params = { id: "task-1" };

      const response = await GET_TASK(request as any, { params } as any);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockTask);
    });
  });
});
