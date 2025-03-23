describe("Tasks Page", () => {
  beforeEach(() => {
    // Mock the authentication
    cy.intercept("GET", "/api/auth/session", {
      statusCode: 200,
      body: {
        user: {
          id: "test-user-id",
          name: "Test User",
          email: "test@example.com",
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    }).as("getSession");

    // Mock the tasks API
    cy.intercept("GET", "/api/tasks", {
      statusCode: 200,
      body: [
        {
          id: "1",
          title: "Test Task 1",
          description: "This is a test task",
          priority: "medium",
          status: "pending",
          estimatedPomodoros: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "test-user-id",
        },
        {
          id: "2",
          title: "Test Task 2",
          description: "This is another test task",
          priority: "high",
          status: "in_progress",
          estimatedPomodoros: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "test-user-id",
        },
      ],
    }).as("getTasks");

    // Visit the tasks page
    cy.visit("/app/tasks");
    cy.wait("@getSession");
    cy.wait("@getTasks");
  });

  it("should display tasks", () => {
    cy.findByText("Test Task 1").should("exist");
    cy.findByText("Test Task 2").should("exist");
  });

  it("should filter tasks by status", () => {
    // Click on the In Progress tab
    cy.findByRole("tab", { name: /in progress/i }).click();

    // Only in progress tasks should be visible
    cy.findByText("Test Task 2").should("exist");
    cy.findByText("Test Task 1").should("not.exist");
  });

  it("should search for tasks", () => {
    // Type in search box
    cy.get('input[type="search"]').type("Task 1");

    // Only Task 1 should be visible
    cy.findByText("Test Task 1").should("exist");
    cy.findByText("Test Task 2").should("not.exist");
  });

  it("should open task details when clicking on edit", () => {
    // Click on the more menu
    cy.get("li")
      .contains("Test Task 1")
      .within(() => {
        cy.get("button").find("svg").last().click();
      });

    // Click on Edit Task
    cy.findByText("Edit Task").click();

    // Task details dialog should be open
    cy.findByRole("dialog").should("exist");
    cy.findByText("Edit Task").should("exist");
  });

  it("should add a new task", () => {
    // Mock the POST request
    cy.intercept("POST", "/api/tasks", {
      statusCode: 200,
      body: {
        id: "3",
        title: "New Test Task",
        priority: "medium",
        status: "pending",
        estimatedPomodoros: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "test-user-id",
      },
    }).as("createTask");

    // Type in new task input
    cy.get('input[placeholder="Add a new task..."]').type("New Test Task");

    // Click Add button
    cy.findByRole("button", { name: /add/i }).click();

    // Wait for the request to complete
    cy.wait("@createTask");

    // Mock the updated tasks list
    cy.intercept("GET", "/api/tasks", {
      statusCode: 200,
      body: [
        {
          id: "1",
          title: "Test Task 1",
          description: "This is a test task",
          priority: "medium",
          status: "pending",
          estimatedPomodoros: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "test-user-id",
        },
        {
          id: "2",
          title: "Test Task 2",
          description: "This is another test task",
          priority: "high",
          status: "in_progress",
          estimatedPomodoros: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "test-user-id",
        },
        {
          id: "3",
          title: "New Test Task",
          priority: "medium",
          status: "pending",
          estimatedPomodoros: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "test-user-id",
        },
      ],
    }).as("getUpdatedTasks");

    // Refresh tasks
    cy.findByRole("tab", { name: /all/i }).click();
    cy.wait("@getUpdatedTasks");

    // New task should be visible
    cy.findByText("New Test Task").should("exist");
  });
});
