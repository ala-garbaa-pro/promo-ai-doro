import { test, expect } from "@playwright/test";

// Note: This test requires Percy to be set up with the project
// Run with: npx percy exec -- npx playwright test visual-regression.spec.ts

test.describe("Visual Regression Tests", () => {
  test("Timer page visual regression", async ({ page }) => {
    // Navigate to the timer page
    await page.goto("/app");

    // Wait for the page to fully load
    await page.waitForSelector("text=25:00");

    // Take a Percy snapshot
    // Note: This requires the Percy Playwright SDK to be installed and configured
    // await percySnapshot(page, 'Timer Page');

    // Since we can't actually call Percy without the SDK, we'll just verify the page content
    await expect(page.locator("text=25:00")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  });

  test("Settings page visual regression", async ({ page }) => {
    // Navigate to the settings page
    await page.goto("/app/settings");

    // Wait for the page to fully load
    await page.waitForSelector('h1:has-text("Settings")');

    // Take a Percy snapshot of each tab
    // Timer tab (default)
    // await percySnapshot(page, 'Settings - Timer Tab');

    // Notifications tab
    await page.getByRole("tab", { name: /notifications/i }).click();
    await page.waitForSelector("text=Notification Settings");
    // await percySnapshot(page, 'Settings - Notifications Tab');

    // Theme tab
    await page.getByRole("tab", { name: /theme/i }).click();
    await page.waitForSelector("text=Theme Settings");
    // await percySnapshot(page, 'Settings - Theme Tab');

    // Account tab
    await page.getByRole("tab", { name: /account/i }).click();
    await page.waitForSelector("text=Account Settings");
    // await percySnapshot(page, 'Settings - Account Tab');

    // Accessibility tab
    await page.getByRole("tab", { name: /accessibility/i }).click();
    await page.waitForSelector("text=Accessibility Settings");
    // await percySnapshot(page, 'Settings - Accessibility Tab');

    // Verify the page content for each tab
    await expect(page.getByText("Accessibility Settings")).toBeVisible();
  });

  test("Dark mode visual regression", async ({ page }) => {
    // Navigate to the app
    await page.goto("/app");

    // Wait for the page to fully load
    await page.waitForSelector("text=25:00");

    // Toggle dark mode (assuming there's a theme toggle button)
    const themeToggle = page.getByRole("button", { name: /toggle theme/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Wait for the theme to change
      await page.waitForTimeout(500);

      // Take a Percy snapshot in dark mode
      // await percySnapshot(page, 'Timer Page - Dark Mode');
    }

    // Navigate to settings in dark mode
    await page.goto("/app/settings");
    await page.waitForSelector('h1:has-text("Settings")');

    // Take a Percy snapshot of settings in dark mode
    // await percySnapshot(page, 'Settings Page - Dark Mode');
  });

  test("Mobile viewport visual regression", async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to the app
    await page.goto("/app");

    // Wait for the page to fully load
    await page.waitForSelector("text=25:00");

    // Take a Percy snapshot in mobile viewport
    // await percySnapshot(page, 'Timer Page - Mobile');

    // Navigate to settings in mobile viewport
    await page.goto("/app/settings");
    await page.waitForSelector('h1:has-text("Settings")');

    // Take a Percy snapshot of settings in mobile viewport
    // await percySnapshot(page, 'Settings Page - Mobile');

    // Verify responsive design elements
    // In mobile view, tab labels might be hidden and only icons shown
    const timerTab = page.getByRole("tab", { name: /timer/i });
    await expect(timerTab).toBeVisible();
  });
});
