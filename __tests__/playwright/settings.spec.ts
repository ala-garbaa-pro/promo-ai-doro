import { test, expect } from "@playwright/test";

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the settings page
    await page.goto("/app/settings");

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Settings")');
  });

  test("should display all settings tabs", async ({ page }) => {
    // Check if all tabs are visible
    await expect(page.getByRole("tab", { name: /timer/i })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /notifications/i })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: /theme/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /account/i })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /accessibility/i })
    ).toBeVisible();
  });

  test("should navigate between settings tabs", async ({ page }) => {
    // Click on Notifications tab
    await page.getByRole("tab", { name: /notifications/i }).click();
    await expect(page.getByText("Notification Settings")).toBeVisible();

    // Click on Theme tab
    await page.getByRole("tab", { name: /theme/i }).click();
    await expect(page.getByText("Theme Settings")).toBeVisible();

    // Click on Account tab
    await page.getByRole("tab", { name: /account/i }).click();
    await expect(page.getByText("Account Settings")).toBeVisible();

    // Click on Accessibility tab
    await page.getByRole("tab", { name: /accessibility/i }).click();
    await expect(page.getByText("Accessibility Settings")).toBeVisible();

    // Click back on Timer tab
    await page.getByRole("tab", { name: /timer/i }).click();
    await expect(page.getByText("Timer Settings")).toBeVisible();
  });

  test("should update timer settings", async ({ page }) => {
    // Make sure we're on the Timer tab
    await page.getByRole("tab", { name: /timer/i }).click();

    // Change pomodoro duration
    const pomodoroDurationInput = page.getByLabel("Pomodoro Duration");
    await pomodoroDurationInput.clear();
    await pomodoroDurationInput.fill("30");

    // Change short break duration
    const shortBreakDurationInput = page.getByLabel("Short Break Duration");
    await shortBreakDurationInput.clear();
    await shortBreakDurationInput.fill("7");

    // Toggle auto-start breaks
    const autoStartBreaksSwitch = page.getByLabel("Auto-start Breaks");
    await autoStartBreaksSwitch.click();

    // Save changes
    await page.getByRole("button", { name: /save changes/i }).click();

    // Check for success toast
    await expect(page.getByText("Settings saved")).toBeVisible();
  });

  test("should update notification settings", async ({ page }) => {
    // Navigate to Notifications tab
    await page.getByRole("tab", { name: /notifications/i }).click();

    // Toggle sound enabled
    const soundEnabledSwitch = page.getByLabel("Sound Enabled");
    await soundEnabledSwitch.click();

    // Change notification sound
    const notificationSoundSelect = page.getByLabel("Notification Sound");
    await notificationSoundSelect.click();
    await page.getByRole("option", { name: "Chime" }).click();

    // Save changes
    await page.getByRole("button", { name: /save changes/i }).click();

    // Check for success toast
    await expect(page.getByText("Settings saved")).toBeVisible();
  });

  test("should update theme settings", async ({ page }) => {
    // Navigate to Theme tab
    await page.getByRole("tab", { name: /theme/i }).click();

    // Change font size
    const fontSizeSelect = page.getByLabel("Font Size");
    await fontSizeSelect.click();
    await page.getByRole("option", { name: "Large" }).click();

    // Change accent color
    const accentColorSelect = page.getByLabel("Accent Color");
    await accentColorSelect.click();
    await page.getByRole("option", { name: "Purple" }).click();

    // Save changes
    await page.getByRole("button", { name: /save changes/i }).click();

    // Check for success toast
    await expect(page.getByText("Settings saved")).toBeVisible();
  });

  test("should update accessibility settings", async ({ page }) => {
    // Navigate to Accessibility tab
    await page.getByRole("tab", { name: /accessibility/i }).click();

    // Toggle high contrast mode
    const highContrastSwitch = page.getByLabel("Toggle high contrast mode");
    await highContrastSwitch.click();

    // Toggle reduced motion
    const reducedMotionSwitch = page.getByLabel("Toggle reduced motion");
    await reducedMotionSwitch.click();

    // Save changes
    await page.getByRole("button", { name: /save changes/i }).click();

    // Check for success toast
    await expect(page.getByText("Settings saved")).toBeVisible();
  });

  test("should reset settings to defaults", async ({ page }) => {
    // Click reset button
    await page.getByRole("button", { name: /reset/i }).click();

    // Check for success toast
    await expect(page.getByText("Settings reset")).toBeVisible();

    // Verify default values are restored (check a few key settings)
    await expect(page.getByLabel("Pomodoro Duration")).toHaveValue("25");
    await expect(page.getByLabel("Short Break Duration")).toHaveValue("5");
    await expect(page.getByLabel("Long Break Duration")).toHaveValue("15");
  });

  test("should export and import settings", async ({ page }) => {
    // Navigate to Account tab where export/import is located
    await page.getByRole("tab", { name: /account/i }).click();

    // Click export button
    const exportButton = page.getByRole("button", { name: /export settings/i });
    await expect(exportButton).toBeVisible();

    // Note: We can't fully test the export as it triggers a download
    // But we can check if the import functionality is visible
    const importButton = page.getByRole("button", { name: /import settings/i });
    await expect(importButton).toBeVisible();
  });
});
