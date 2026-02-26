import { test, expect } from "@playwright/test";

test("home carga correctamente", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Tenmás AI Playbooks/);
  await expect(page.locator("body")).toBeVisible();
});
