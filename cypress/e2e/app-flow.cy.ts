describe("Pomo AI-doro App Flow", () => {
  beforeEach(() => {
    // Visit the app page
    cy.visit("/app");

    // If there's a login page, we'll need to handle authentication
    // This is a simplified version assuming we're already logged in or using a mock
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="login-form"]').length > 0) {
        // If login form is present, fill it and submit
        cy.get('input[name="email"]').type("test@example.com");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();
      }
    });
  });

  it("should create a task and start a timer session", () => {
    // Navigate to tasks page if not already there
    cy.get('a[href*="/app/tasks"]').click();
    cy.url().should("include", "/app/tasks");

    // Create a new task
    cy.get('input[placeholder*="Add a task"]').type(
      "Complete E2E test #high ~2{enter}"
    );

    // Verify task was created
    cy.contains("Complete E2E test").should("be.visible");

    // Navigate to timer page
    cy.get('a[href*="/app/timer"]').click();
    cy.url().should("include", "/app/timer");

    // Start the timer
    cy.get("button").contains(/start/i).click();

    // Verify timer is running (button should now say "Pause")
    cy.get("button").contains(/pause/i).should("be.visible");

    // Pause the timer
    cy.get("button").contains(/pause/i).click();

    // Verify timer is paused (button should now say "Resume")
    cy.get("button")
      .contains(/resume/i)
      .should("be.visible");
  });

  it("should navigate through different timer modes", () => {
    // Navigate to timer page
    cy.get('a[href*="/app/timer"]').click();
    cy.url().should("include", "/app/timer");

    // Check if we're in pomodoro mode by default
    cy.get('[role="tablist"]')
      .contains("Focus")
      .should("have.attr", "aria-selected", "true");

    // Switch to short break mode
    cy.get('[role="tablist"]').contains("Short Break").click();
    cy.get('[role="tablist"]')
      .contains("Short Break")
      .should("have.attr", "aria-selected", "true");

    // Verify timer duration changed
    cy.get('[data-testid="timer-display"]').should("contain", "5:00");

    // Switch to long break mode
    cy.get('[role="tablist"]').contains("Long Break").click();
    cy.get('[role="tablist"]')
      .contains("Long Break")
      .should("have.attr", "aria-selected", "true");

    // Verify timer duration changed
    cy.get('[data-testid="timer-display"]').should("contain", "15:00");
  });

  it("should update settings and persist them", () => {
    // Navigate to settings page
    cy.get('a[href*="/app/settings"]').click();
    cy.url().should("include", "/app/settings");

    // Update pomodoro duration
    cy.get('input[name="pomodoroDuration"]').clear().type("30");

    // Save settings
    cy.get("button")
      .contains(/save settings/i)
      .click();

    // Verify toast notification appears
    cy.contains("Settings saved").should("be.visible");

    // Navigate to timer page to verify changes
    cy.get('a[href*="/app/timer"]').click();
    cy.url().should("include", "/app/timer");

    // Verify timer duration updated
    cy.get('[data-testid="timer-display"]').should("contain", "30:00");

    // Reload the page to verify persistence
    cy.reload();

    // Verify timer duration is still updated after reload
    cy.get('[data-testid="timer-display"]').should("contain", "30:00");
  });

  it("should manage tasks (create, complete, delete)", () => {
    // Navigate to tasks page
    cy.get('a[href*="/app/tasks"]').click();
    cy.url().should("include", "/app/tasks");

    // Create a new task
    cy.get('input[placeholder*="Add a task"]').type(
      "Task to be completed {enter}"
    );

    // Verify task was created
    cy.contains("Task to be completed").should("be.visible");

    // Create another task
    cy.get('input[placeholder*="Add a task"]').type(
      "Task to be deleted {enter}"
    );

    // Verify second task was created
    cy.contains("Task to be deleted").should("be.visible");

    // Complete the first task
    cy.contains("Task to be completed")
      .parent()
      .find('button[aria-label="Toggle task status"]')
      .click();

    // Verify task is marked as completed
    cy.contains("Task to be completed")
      .parent()
      .find('svg[data-testid="completed-icon"]')
      .should("be.visible");

    // Delete the second task
    cy.contains("Task to be deleted")
      .parent()
      .find('button[aria-label="Task options"]')
      .click();

    // Click delete in the dropdown
    cy.contains("Delete").click();

    // Verify second task is removed
    cy.contains("Task to be deleted").should("not.exist");
  });
});
