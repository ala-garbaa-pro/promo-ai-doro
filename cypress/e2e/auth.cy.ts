describe("Authentication", () => {
  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should redirect to login page when accessing protected routes", () => {
    cy.visit("/app");
    cy.url().should("include", "/auth/login");
  });

  it("should show validation errors on login form", () => {
    cy.visit("/auth/login");

    // Submit without filling in fields
    cy.get('button[type="submit"]').click();

    // Check for validation errors
    cy.findByText(/email is required/i).should("exist");
    cy.findByText(/password is required/i).should("exist");
  });

  it("should show validation errors on register form", () => {
    cy.visit("/auth/register");

    // Submit without filling in fields
    cy.get('button[type="submit"]').click();

    // Check for validation errors
    cy.findByText(/name is required/i).should("exist");
    cy.findByText(/email is required/i).should("exist");
    cy.findByText(/password is required/i).should("exist");
  });

  it("should navigate between login and register pages", () => {
    cy.visit("/auth/login");

    // Navigate to register page
    cy.findByText(/create an account/i).click();
    cy.url().should("include", "/auth/register");

    // Navigate back to login page
    cy.findByText(/already have an account/i).click();
    cy.url().should("include", "/auth/login");
  });

  // This test would require a mock server or a test user
  it.skip("should login successfully with valid credentials", () => {
    cy.visit("/auth/login");

    // Fill in login form
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Check if redirected to app
    cy.url().should("include", "/app");

    // Check if user is logged in
    cy.get("header").should("contain", "test@example.com");
  });
});
