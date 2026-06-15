import { test, expect } from "@playwright/test";

// Relies on seeded sample published articles (prisma db seed).
test("reader can browse home, read an article, search and filter", async ({ page }) => {
  // Homepage shows seeded content
  await page.goto("/");
  await expect(page.getByText("Latest News")).toBeVisible();

  // Go to listing and search
  await page.goto("/news?q=arsenal");
  const card = page.getByRole("heading", { name: /Arsenal Edge Past Chelsea/i });
  await expect(card).toBeVisible();

  // Open the article
  await card.getByRole("link").click();
  await expect(page).toHaveURL(/\/news\/arsenal-edge-past-chelsea/);
  await expect(page.getByRole("heading", { level: 1, name: /Arsenal Edge Past Chelsea/i })).toBeVisible();
  await expect(page.locator(".prose")).toContainText("Arsenal Edge Past Chelsea");

  // Category filter narrows results
  await page.goto("/news?category=la-liga");
  await expect(page.getByRole("heading", { name: /La Liga Title Race Heats Up/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Arsenal Edge Past Chelsea/i })).toHaveCount(0);

  // No-match empty state
  await page.goto("/news?q=zzzznomatch");
  await expect(page.getByText("No articles found")).toBeVisible();
});
