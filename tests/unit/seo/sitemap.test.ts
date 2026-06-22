import { describe, it, expect } from "vitest";
import { buildSitemapEntries } from "@/lib/seo/sitemap-entries";

const site = "https://rsw.example";

describe("buildSitemapEntries", () => {
  it("includes static routes and one entry per article", () => {
    const updated = new Date("2026-06-15T10:00:00Z");
    const entries = buildSitemapEntries(site, ["/", "/news"], [{ slug: "a", updatedAt: updated }]);
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://rsw.example");
    expect(urls).toContain("https://rsw.example/news");
    expect(urls).toContain("https://rsw.example/news/a");
    const articleEntry = entries.find((e) => e.url.endsWith("/news/a"))!;
    expect(articleEntry.lastModified).toBe(updated);
  });

  it("normalizes the root route to the bare site url", () => {
    const entries = buildSitemapEntries(site, ["/"], []);
    expect(entries[0].url).toBe("https://rsw.example");
  });
});
