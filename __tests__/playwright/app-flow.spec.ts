import { test, expect } from "@playwright/test";

test.describe("Pomo AI-doro App Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app page
    await page.goto("/app");

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Pomo AI-doro")');
  });

  test("should display the timer component", async ({ page }) => {
    // Check if timer is visible
    await expect(page.locator("text=25:00")).toBeVisible();

    // Check if timer controls are visible
    await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();

    // Check if timer mode buttons are visible
    await expect(page.getByRole("button", { name: "Focus" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Short Break" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Long Break" })
    ).toBeVisible();
  });

  test("should start and pause the timer", async ({ page }) => {
    // Start the timer
    await page.getByRole("button", { name: "Start" }).click();

    // Check if the button text changed to "Pause"
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

    // Wait for 2 seconds to let the timer run
    await page.waitForTimeout(2000);

    // Check if the timer has decreased
    const timerText = await page.locator("text=/\\d{2}:\\d{2}/").textContent();
    expect(timerText).not.toBe("25:00");

    // Pause the timer
    await page.getByRole("button", { name: "Pause" }).click();

    // Check if the button text changed back to "Start"
    await expect(page.getByRole("button", { name: "Start" })).toBeVisible();

    // Store the current timer value
    const pausedTimerText = await page
      .locator("text=/\\d{2}:\\d{2}/")
      .textContent();

    // Wait for 2 seconds to ensure timer is paused
    await page.waitForTimeout(2000);

    // Check if the timer value hasn't changed
    const currentTimerText = await page
      .locator("text=/\\d{2}:\\d{2}/")
      .textContent();
    expect(currentTimerText).toBe(pausedTimerText);
  });

  test("should reset the timer", async ({ page }) => {
    // Start the timer
    await page.getByRole("button", { name: "Start" }).click();

    // Wait for 2 seconds to let the timer run
    await page.waitForTimeout(2000);

    // Reset the timer
    await page.getByRole("button", { name: "Reset" }).click();

    // Check if the timer has been reset to 25:00
    await expect(page.locator("text=25:00")).toBeVisible();

    // Check if the button text is "Start"
    await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
  });

  test("should switch between timer modes", async ({ page }) => {
    // Initially in Pomodoro mode (25:00)
    await expect(page.locator("text=25:00")).toBeVisible();

    // Switch to Short Break mode
    await page.getByRole("button", { name: "Short Break" }).click();

    // Check if timer shows 5:00
    await expect(page.locator("text=05:00")).toBeVisible();

    // Switch to Long Break mode
    await page.getByRole("button", { name: "Long Break" }).click();

    // Check if timer shows 15:00
    await expect(page.locator("text=15:00")).toBeVisible();

    // Switch back to Pomodoro mode
    await page.getByRole("button", { name: "Focus" }).click();

    // Check if timer shows 25:00 again
    await expect(page.locator("text=25:00")).toBeVisible();
  });
});
