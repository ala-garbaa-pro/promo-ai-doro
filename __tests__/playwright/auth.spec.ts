import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/auth/login");

    // Check if login form is visible
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

    // Check if there's a link to register page
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("should display register page", async ({ page }) => {
    await page.goto("/auth/register");

    // Check if register form is visible
    await expect(page.getByRole("heading", { name: "Register" })).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();

    // Check if there's a link to login page
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("should show validation errors on login form", async ({ page }) => {
    await page.goto("/auth/login");

    // Submit empty form
    await page.getByRole("button", { name: "Sign In" }).click();

    // Check for validation errors
    await expect(page.locator("text=Email is required")).toBeVisible();
    await expect(page.locator("text=Password is required")).toBeVisible();

    // Fill in invalid email
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Check for email validation error
    await expect(page.locator("text=Please enter a valid email")).toBeVisible();
  });

  test("should show validation errors on register form", async ({ page }) => {
    await page.goto("/auth/register");

    // Submit empty form
    await page.getByRole("button", { name: "Sign Up" }).click();

    // Check for validation errors
    await expect(page.locator("text=Name is required")).toBeVisible();
    await expect(page.locator("text=Email is required")).toBeVisible();
    await expect(page.locator("text=Password is required")).toBeVisible();

    // Fill in invalid email
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByRole("button", { name: "Sign Up" }).click();

    // Check for email validation error
    await expect(page.locator("text=Please enter a valid email")).toBeVisible();

    // Fill in short password
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Sign Up" }).click();

    // Check for password validation error
    await expect(
      page.locator("text=Password must be at least 8 characters")
    ).toBeVisible();
  });

  // This test is skipped as it requires a test user
  test.skip("should login successfully with valid credentials", async ({
    page,
  }) => {
    await page.goto("/auth/login");

    // Fill in valid credentials
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");

    // Submit form
    await page.getByRole("button", { name: "Sign In" }).click();

    // Check if redirected to app
    await expect(page).toHaveURL("/app");

    // Check if user is logged in
    await expect(page.locator("text=test@example.com")).toBeVisible();
  });

  // This test is skipped as it requires registration to be enabled
  test.skip("should register successfully with valid information", async ({
    page,
  }) => {
    await page.goto("/auth/register");

    // Generate a unique email
    const uniqueEmail = `test-${Date.now()}@example.com`;

    // Fill in valid information
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("password123");

    // Submit form
    await page.getByRole("button", { name: "Sign Up" }).click();

    // Check if redirected to app
    await expect(page).toHaveURL("/app");

    // Check if user is logged in
    await expect(page.locator("text=Test User")).toBeVisible();
  });
});
