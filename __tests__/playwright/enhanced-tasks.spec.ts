import { test, expect } from "@playwright/test";

test.describe("Enhanced Tasks Page", () => {
  test("should display the enhanced tasks page", async ({ page }) => {
    // Navigate to the enhanced tasks page
    await page.goto("/app/tasks/enhanced");

    // Check if the page title is displayed
    await expect(
      page.getByRole("heading", { name: "Task Management" })
    ).toBeVisible();

    // Check if the categories section is displayed
    await expect(page.getByText("Categories")).toBeVisible();

    // Check if the task input is displayed
    await expect(page.getByPlaceholderText(/Add a new task/)).toBeVisible();

    // Check if the view mode buttons are displayed
    await expect(page.getByRole("button", { name: /list/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /grid/i })).toBeVisible();

    // Check if the tabs are displayed
    await expect(page.getByRole("tab", { name: /all/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /pending/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /in progress/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /completed/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /cancelled/i })).toBeVisible();
  });

  test("should switch between list and grid views", async ({ page }) => {
    // Navigate to the enhanced tasks page
    await page.goto("/app/tasks/enhanced");

    // Default view should be list
    await expect(page.locator('[data-testid="task-list"]')).toBeVisible();

    // Click the grid view button
    await page.getByRole("button", { name: /grid/i }).click();

    // Grid view should be displayed
    await expect(page.locator('[data-testid="task-grid"]')).toBeVisible();

    // Click the list view button
    await page.getByRole("button", { name: /list/i }).click();

    // List view should be displayed again
    await expect(page.locator('[data-testid="task-list"]')).toBeVisible();
  });

  test("should switch between tabs", async ({ page }) => {
    // Navigate to the enhanced tasks page
    await page.goto("/app/tasks/enhanced");

    // Default tab should be "all"
    await expect(
      page.getByRole("tab", { name: /all/i, selected: true })
    ).toBeVisible();

    // Click the "pending" tab
    await page.getByRole("tab", { name: /pending/i }).click();

    // "pending" tab should be selected
    await expect(
      page.getByRole("tab", { name: /pending/i, selected: true })
    ).toBeVisible();

    // Click the "completed" tab
    await page.getByRole("tab", { name: /completed/i }).click();

    // "completed" tab should be selected
    await expect(
      page.getByRole("tab", { name: /completed/i, selected: true })
    ).toBeVisible();
  });

  test("should filter tasks using search", async ({ page }) => {
    // Navigate to the enhanced tasks page
    await page.goto("/app/tasks/enhanced");

    // Enter search term
    await page.getByPlaceholderText("Search tasks...").fill("important");

    // Check if the search filter badge is displayed
    await expect(page.getByText("important")).toBeVisible();

    // Clear search
    await page.getByRole("button", { name: /clear search/i }).click();

    // Search filter badge should not be visible
    await expect(page.getByText("important")).not.toBeVisible();
  });

  test("should create a new task", async ({ page }) => {
    // Navigate to the enhanced tasks page
    await page.goto("/app/tasks/enhanced");

    // Enter task details
    const taskInput = page.getByPlaceholderText(/Add a new task/);
    await taskInput.fill("New test task #important @work");
    await taskInput.press("Enter");

    // Check if success message is displayed
    await expect(page.getByText("Task Created")).toBeVisible();

    // Check if the new task is displayed in the list
    await expect(page.getByText("New test task")).toBeVisible();
  });
});
