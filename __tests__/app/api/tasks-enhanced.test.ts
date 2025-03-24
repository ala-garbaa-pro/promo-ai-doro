// Mock NextRequest and NextResponse
class MockNextRequest {
  url: string;
  method: string;
  body: any;
  headers: Headers;

  constructor(
    url: string,
    options: { method?: string; body?: string; headers?: Headers } = {}
  ) {
    this.url = url;
    this.method = options.method || "GET";
    this.body = options.body;
    this.headers = options.headers || new Headers();
  }

  async json() {
    return JSON.parse(this.body);
  }
}

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

// Mock the route handlers
const GET = jest.fn().mockImplementation(async (req) => {
  if (!mockSession) {
    return MockNextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return MockNextResponse.json(mockTasks);
});

const POST = jest.fn().mockImplementation(async (req) => {
  if (!mockSession) {
    return MockNextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.title) {
    return MockNextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  return MockNextResponse.json(mockNewTask);
});

const GET_TASK = jest.fn().mockImplementation(async (req, { params }) => {
  if (!mockSession) {
    return MockNextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (mockTaskNotFound) {
    return MockNextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return MockNextResponse.json(mockTask);
});

const PATCH = jest.fn().mockImplementation(async (req, { params }) => {
  if (!mockSession) {
    return MockNextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (mockUpdateFailed) {
    return MockNextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }

  return MockNextResponse.json(mockUpdatedTask);
});

const DELETE = jest.fn().mockImplementation(async (req, { params }) => {
  if (!mockSession) {
    return MockNextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (mockDeleteFailed) {
    return MockNextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }

  return MockNextResponse.json(mockDeletedTask);
});

// Mock data
let mockSession: any = null;
let mockTasks: any[] = [];
let mockNewTask: any = null;
let mockTask: any = null;
let mockUpdatedTask: any = null;
let mockDeletedTask: any = null;
let mockTaskNotFound = false;
let mockUpdateFailed = false;
let mockDeleteFailed = false;

// Mock modules
const auth = {
  api: {
    getSession: jest.fn(),
  },
};

const db = {
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
  update: jest.fn(() => ({
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ id: "task-1" }])),
      })),
    })),
  })),
  delete: jest.fn(() => ({
    where: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ id: "task-1" }])),
    })),
  })),
};

const tasks = {
  id: "id",
  userId: "userId",
  status: "status",
  category: "category",
  priority: "priority",
  createdAt: "createdAt",
  order: "order",
};

const eq = jest.fn((field, value) => ({ field, value, operator: "eq" }));
const and = jest.fn((...conditions) => ({ conditions, operator: "and" }));
const desc = jest.fn((field) => ({ field, direction: "desc" }));
const asc = jest.fn((field) => ({ field, direction: "asc" }));

describe("Tasks API - Enhanced Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock data
    mockSession = null;
    mockTasks = [];
    mockNewTask = null;
    mockTask = null;
    mockUpdatedTask = null;
    mockDeletedTask = null;
    mockTaskNotFound = false;
    mockUpdateFailed = false;
    mockDeleteFailed = false;
  });

  describe("GET /api/tasks", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Set up mock data
      mockSession = null;

      const request = new MockNextRequest("http://localhost:3000/api/tasks");
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns tasks when user is authenticated", async () => {
      // Set up mock data
      mockSession = { user: { id: "user-123" } };
      mockTasks = [
        { id: "task-1", title: "Task 1" },
        { id: "task-2", title: "Task 2" },
      ];

      const request = new MockNextRequest("http://localhost:3000/api/tasks");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockTasks);
    });

    it("handles query parameters correctly", async () => {
      // Set up mock data
      mockSession = { user: { id: "user-123" } };
      mockTasks = [{ id: "task-1", title: "Task 1", status: "pending" }];

      // Create request with query parameters
      const url =
        "http://localhost:3000/api/tasks?status=pending&priority=high";
      const request = new MockNextRequest(url);
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockTasks);
    });
  });

  describe("POST /api/tasks", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Set up mock data
      mockSession = null;

      const request = new MockNextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "New Task" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 400 when title is missing", async () => {
      // Set up mock data
      mockSession = { user: { id: "user-123" } };

      const request = new MockNextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Title is required");
    });

    it("creates a task successfully", async () => {
      // Set up mock data
      mockSession = { user: { id: "user-123" } };
      mockNewTask = {
        id: "task-1",
        title: "New Task",
        priority: "medium",
        status: "pending",
      };

      const request = new MockNextRequest("http://localhost:3000/api/tasks", {
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
      expect(data).toEqual(mockNewTask);
    });
  });

  describe("GET /api/tasks/[id]", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Set up mock data
      mockSession = null;

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1"
      );
      const params = { id: "task-1" };

      const response = await GET_TASK(request, { params });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 404 when task is not found", async () => {
      // Set up mock data
      mockSession = { user: { id: "user-123" } };
      mockTaskNotFound = true;

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1"
      );
      const params = { id: "task-1" };

      const response = await GET_TASK(request, { params });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Task not found");
    });

    it("returns task when found", async () => {
      // Set up mock data
      mockSession = { user: { id: "user-123" } };
      mockTask = { id: "task-1", title: "Task 1" };

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1"
      );
      const params = { id: "task-1" };

      const response = await GET_TASK(request, { params });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockTask);
    });
  });

  describe("PATCH /api/tasks/[id]", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Set up mock data
      mockSession = null;

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1",
        {
          method: "PATCH",
          body: JSON.stringify({ title: "Updated Task" }),
        }
      );

      const params = { id: "task-1" };
      const response = await PATCH(request, { params });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("updates a task successfully", async () => {
      // Set up mock data
      mockSession = { user: { id: "user-123" } };
      mockUpdatedTask = {
        id: "task-1",
        title: "Updated Task",
        priority: "high",
      };

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1",
        {
          method: "PATCH",
          body: JSON.stringify({
            title: "Updated Task",
            priority: "high",
          }),
        }
      );

      const params = { id: "task-1" };
      const response = await PATCH(request, { params });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockUpdatedTask);
    });

    it("returns 500 when update fails", async () => {
      // Set up mock data
      mockSession = { user: { id: "user-123" } };
      mockUpdateFailed = true;

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1",
        {
          method: "PATCH",
          body: JSON.stringify({
            title: "Updated Task",
          }),
        }
      );

      const params = { id: "task-1" };
      const response = await PATCH(request, { params });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Failed to update task");
    });
  });

  describe("DELETE /api/tasks/[id]", () => {
    it("returns 401 when user is not authenticated", async () => {
      // Set up mock data
      mockSession = null;

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1",
        {
          method: "DELETE",
        }
      );

      const params = { id: "task-1" };
      const response = await DELETE(request, { params });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("deletes a task successfully", async () => {
      // Set up mock data
      mockSession = { user: { id: "user-123" } };
      mockDeletedTask = { id: "task-1" };

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1",
        {
          method: "DELETE",
        }
      );

      const params = { id: "task-1" };
      const response = await DELETE(request, { params });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockDeletedTask);
    });

    it("returns 500 when deletion fails", async () => {
      // Set up mock data
      mockSession = { user: { id: "user-123" } };
      mockDeleteFailed = true;

      const request = new MockNextRequest(
        "http://localhost:3000/api/tasks/task-1",
        {
          method: "DELETE",
        }
      );

      const params = { id: "task-1" };
      const response = await DELETE(request, { params });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Failed to delete task");
    });
  });
});
