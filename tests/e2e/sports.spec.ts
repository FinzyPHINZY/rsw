import { test, expect } from "@playwright/test";

test("standings, scores, league switching, and homepage widgets", async ({ page }) => {
  // standings (default Premier League fixture)
  await page.goto("/standings");
  await expect(page.getByRole("heading", { name: /Premier League Table/i })).toBeVisible();
  await expect(page.getByText("Arsenal")).toBeVisible();

  // switch league
  await page.getByRole("link", { name: "La Liga" }).click();
  await expect(page).toHaveURL(/league=la-liga/);
  await expect(page.getByText("Real Madrid")).toBeVisible();

  // scores
  await page.goto("/scores");
  await expect(page.getByRole("heading", { name: "Live Scores" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Live", exact: true })).toBeVisible();
  await expect(page.getByText("Chelsea")).toBeVisible(); // live fixture m1

  // homepage widgets
  await page.goto("/");
  await expect(page.getByText("Full table")).toBeVisible();
  await expect(page.getByText("All scores")).toBeVisible();
});
