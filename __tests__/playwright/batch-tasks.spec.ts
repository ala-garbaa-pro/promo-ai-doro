import { test, expect } from "@playwright/test";

test.describe("Batch Tasks Operations", () => {
  test("should select and complete multiple tasks", async ({ page }) => {
    // Navigate to the enhanced tasks page
    await page.goto("/app/tasks/enhanced");

    // Create a few test tasks
    const taskInput = page.getByPlaceholderText(/Add a new task/);

    await taskInput.fill("Batch test task 1");
    await taskInput.press("Enter");

    await taskInput.fill("Batch test task 2");
    await taskInput.press("Enter");

    await taskInput.fill("Batch test task 3");
    await taskInput.press("Enter");

    // Open batch actions menu
    await page.getByRole("button", { name: /batch actions/i }).click();

    // Select all tasks
    await page.getByText("Select All Tasks").click();

    // Check if the batch actions badge shows the correct count
    await expect(page.locator(".badge").filter({ hasText: "3" })).toBeVisible();

    // Click the "Mark Selected as Complete" option
    await page.getByText("Mark Selected as Complete").click();

    // Check if success message is displayed
    await expect(page.getByText("Tasks Completed")).toBeVisible();

    // Switch to completed tab to see the tasks
    await page.getByRole("tab", { name: /completed/i }).click();

    // Check if all tasks are now in the completed tab
    await expect(page.getByText("Batch test task 1")).toBeVisible();
    await expect(page.getByText("Batch test task 2")).toBeVisible();
    await expect(page.getByText("Batch test task 3")).toBeVisible();
  });

  test("should select and delete multiple tasks", async ({ page }) => {
    // Navigate to the enhanced tasks page
    await page.goto("/app/tasks/enhanced");

    // Create a few test tasks
    const taskInput = page.getByPlaceholderText(/Add a new task/);

    await taskInput.fill("Delete test task 1");
    await taskInput.press("Enter");

    await taskInput.fill("Delete test task 2");
    await taskInput.press("Enter");

    // Open batch actions menu
    await page.getByRole("button", { name: /batch actions/i }).click();

    // Select all tasks
    await page.getByText("Select All Tasks").click();

    // Click the "Delete Selected Tasks" option
    await page.getByText("Delete Selected Tasks").click();

    // Check if success message is displayed
    await expect(page.getByText("Tasks Deleted")).toBeVisible();

    // Check if tasks are no longer visible
    await expect(page.getByText("Delete test task 1")).not.toBeVisible();
    await expect(page.getByText("Delete test task 2")).not.toBeVisible();
  });

  test("should filter tasks by priority", async ({ page }) => {
    // Navigate to the enhanced tasks page
    await page.goto("/app/tasks/enhanced");

    // Create tasks with different priorities
    const taskInput = page.getByPlaceholderText(/Add a new task/);

    await taskInput.fill("High priority task #high");
    await taskInput.press("Enter");

    await taskInput.fill("Medium priority task #medium");
    await taskInput.press("Enter");

    await taskInput.fill("Low priority task #low");
    await taskInput.press("Enter");

    // Open filter menu
    await page.getByRole("button", { name: /filter/i }).click();

    // Select high priority filter
    await page.getByText("High").click();

    // Check if only high priority task is visible
    await expect(page.getByText("High priority task")).toBeVisible();
    await expect(page.getByText("Medium priority task")).not.toBeVisible();
    await expect(page.getByText("Low priority task")).not.toBeVisible();

    // Clear filters
    await page.getByText("Clear All Filters").click();

    // All tasks should be visible again
    await expect(page.getByText("High priority task")).toBeVisible();
    await expect(page.getByText("Medium priority task")).toBeVisible();
    await expect(page.getByText("Low priority task")).toBeVisible();
  });

  test("should sort tasks by different criteria", async ({ page }) => {
    // Navigate to the enhanced tasks page
    await page.goto("/app/tasks/enhanced");

    // Create tasks with different attributes
    const taskInput = page.getByPlaceholderText(/Add a new task/);

    await taskInput.fill("A - First alphabetically");
    await taskInput.press("Enter");

    await taskInput.fill("C - Third alphabetically");
    await taskInput.press("Enter");

    await taskInput.fill("B - Second alphabetically");
    await taskInput.press("Enter");

    // Open filter menu
    await page.getByRole("button", { name: /filter/i }).click();

    // Sort by title
    await page.getByText("Title").click();

    // Check if tasks are sorted alphabetically
    const taskElements = page.locator(".task-title").all();
    const taskTitles = await Promise.all(
      (await taskElements).map((el) => el.textContent())
    );

    // Verify alphabetical order
    expect(taskTitles[0]).toContain("A");
    expect(taskTitles[1]).toContain("B");
    expect(taskTitles[2]).toContain("C");
  });
});
