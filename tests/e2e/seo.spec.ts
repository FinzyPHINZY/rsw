import { test, expect } from "@playwright/test";

test("article page exposes OG + NewsArticle JSON-LD", async ({ page }) => {
  await page.goto("/news/arsenal-edge-past-chelsea");
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(ld).toContain("NewsArticle");
});

test("robots and sitemap are served", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Disallow: /admin");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("/news/");
});
