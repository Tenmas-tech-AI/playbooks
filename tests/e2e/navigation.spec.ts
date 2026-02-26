import { test, expect } from "@playwright/test";

test.describe("Navegación del sitio", () => {
  test("sidebar muestra las secciones principales", async ({ page }) => {
    await page.goto("/docs/semana-1-2/resumen");
    // Docusaurus renderiza las categorías del sidebar como botones
    await expect(
      page.getByRole("button", { name: "Introducción" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Semanas 1–2" })
    ).toBeVisible();
  });

  test("Día 1 es accesible desde el sidebar", async ({ page }) => {
    await page.goto("/docs/semana-1-2/resumen");
    await page.getByRole("link", { name: /Día 1/ }).first().click();
    await expect(page).toHaveURL(/dia-01-cursor-coderabbit/);
    await expect(page.locator("h1")).toContainText("Día 1");
  });

  test("Día 2 es accesible desde el sidebar", async ({ page }) => {
    await page.goto("/docs/semana-1-2/resumen");
    await page.getByRole("link", { name: /Día 2/ }).first().click();
    await expect(page).toHaveURL(/dia-02-github-security-promptlayer/);
    await expect(page.locator("h1")).toContainText("Día 2");
  });

  test("Día 3 es accesible desde el sidebar", async ({ page }) => {
    await page.goto("/docs/semana-1-2/resumen");
    await page.getByRole("link", { name: /Día 3/ }).first().click();
    await expect(page).toHaveURL(/dia-03-n8n-playwright/);
    await expect(page.locator("h1")).toContainText("Día 3");
  });

  test("navegación Día 2 → Día 3 funciona con el link del documento", async ({
    page,
  }) => {
    await page.goto("/docs/semana-1-2/dia-02-github-security-promptlayer");
    await page.getByRole("link", { name: /Día 3/ }).first().click();
    await expect(page).toHaveURL(/dia-03-n8n-playwright/);
  });

  test("página de inicio tiene link a la documentación", async ({ page }) => {
    await page.goto("/");
    // El home de Docusaurus tiene un CTA que lleva a /docs
    const docsLink = page.getByRole("link", { name: /docs|documentación|playbooks/i }).first();
    await expect(docsLink).toBeVisible();
  });
});
