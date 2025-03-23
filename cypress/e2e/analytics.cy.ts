describe("Analytics Page", () => {
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

    // Mock the analytics API
    cy.intercept("GET", "/api/analytics/monthly*", {
      statusCode: 200,
      body: {
        totalWorkSessions: 10,
        completedWorkSessions: 8,
        totalWorkMinutes: 240,
        totalBreakMinutes: 60,
        avgFocusScore: 85,
        completedTasks: 12,
        dailyAnalytics: [
          {
            date: "2023-05-01",
            totalWorkMinutes: 120,
            completedWorkSessions: 4,
            completedTasks: 5,
          },
          {
            date: "2023-05-02",
            totalWorkMinutes: 120,
            completedWorkSessions: 4,
            completedTasks: 7,
          },
        ],
        productivityByHour: [
          { hour: 9, completedSessions: 3, totalMinutes: 75 },
          { hour: 10, completedSessions: 2, totalMinutes: 50 },
          { hour: 11, completedSessions: 1, totalMinutes: 25 },
          { hour: 12, completedSessions: 0, totalMinutes: 0 },
          { hour: 13, completedSessions: 4, totalMinutes: 100 },
          { hour: 14, completedSessions: 2, totalMinutes: 50 },
        ],
      },
    }).as("getMonthlyAnalytics");

    // Mock the weekly analytics API
    cy.intercept("GET", "/api/analytics/weekly*", {
      statusCode: 200,
      body: {
        totalWorkSessions: 5,
        completedWorkSessions: 4,
        totalWorkMinutes: 120,
        totalBreakMinutes: 30,
        avgFocusScore: 80,
        completedTasks: 6,
        dailyAnalytics: [
          {
            date: "2023-05-01",
            totalWorkMinutes: 60,
            completedWorkSessions: 2,
            completedTasks: 3,
          },
          {
            date: "2023-05-02",
            totalWorkMinutes: 60,
            completedWorkSessions: 2,
            completedTasks: 3,
          },
        ],
        productivityByHour: [
          { hour: 9, completedSessions: 1, totalMinutes: 25 },
          { hour: 10, completedSessions: 1, totalMinutes: 25 },
          { hour: 11, completedSessions: 0, totalMinutes: 0 },
          { hour: 12, completedSessions: 0, totalMinutes: 0 },
          { hour: 13, completedSessions: 2, totalMinutes: 50 },
          { hour: 14, completedSessions: 1, totalMinutes: 25 },
        ],
      },
    }).as("getWeeklyAnalytics");

    // Visit the analytics page
    cy.visit("/app/analytics");
    cy.wait("@getSession");
    cy.wait("@getMonthlyAnalytics");
  });

  it("should display analytics data", () => {
    // Check metric cards
    cy.findByText("4h 0m").should("exist"); // 240 minutes = 4h 0m
    cy.findByText("8").should("exist"); // 8 completed sessions
    cy.findByText("12").should("exist"); // 12 completed tasks
    cy.findByText("85").should("exist"); // 85 avg focus score

    // Check charts
    cy.get('[data-testid="responsive-container"]').should("exist");
  });

  it("should switch between time ranges", () => {
    // Click on Week tab
    cy.findByRole("tab", { name: /week/i }).click();

    // Wait for the weekly analytics request
    cy.wait("@getWeeklyAnalytics");

    // Check if data is updated
    cy.findByText("2h 0m").should("exist"); // 120 minutes = 2h 0m
    cy.findByText("4").should("exist"); // 4 completed sessions
    cy.findByText("6").should("exist"); // 6 completed tasks
    cy.findByText("80").should("exist"); // 80 avg focus score
  });

  it("should switch between overview tabs", () => {
    // Default should be overview
    cy.findByRole("tab", { name: /overview/i }).should(
      "have.attr",
      "aria-selected",
      "true"
    );

    // Switch to focus tab
    cy.findByRole("tab", { name: /focus/i }).click();

    // Focus tab should now be selected
    cy.findByRole("tab", { name: /focus/i }).should(
      "have.attr",
      "aria-selected",
      "true"
    );

    // Focus content should be visible
    cy.findByText(/focus insights/i).should("exist");

    // Switch to tasks tab
    cy.findByRole("tab", { name: /tasks/i }).click();

    // Tasks tab should now be selected
    cy.findByRole("tab", { name: /tasks/i }).should(
      "have.attr",
      "aria-selected",
      "true"
    );

    // Tasks content should be visible
    cy.findByText(/task completion rate/i).should("exist");
  });

  it("should handle error state", () => {
    // Mock the analytics API to return an error
    cy.intercept("GET", "/api/analytics/monthly*", {
      statusCode: 500,
      body: {
        error: "Failed to fetch analytics data",
      },
    }).as("getMonthlyAnalyticsError");

    // Refresh the page
    cy.visit("/app/analytics");
    cy.wait("@getSession");
    cy.wait("@getMonthlyAnalyticsError");

    // Error message should be visible
    cy.findByText(/failed to load analytics data/i).should("exist");
  });
});
