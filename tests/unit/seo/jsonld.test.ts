import { describe, it, expect } from "vitest";
import { articleJsonLd, websiteJsonLd, organizationJsonLd } from "@/lib/seo/jsonld";

const site = "https://rsw.example";

describe("jsonld builders", () => {
  it("builds a NewsArticle from an article", () => {
    const ld = articleJsonLd(
      {
        title: "Arsenal Win",
        slug: "arsenal-win",
        excerpt: "A late winner.",
        featuredImage: "/uploads/a.png",
        publishedAt: new Date("2026-06-15T10:00:00Z"),
        createdAt: new Date("2026-06-14T10:00:00Z"),
        author: { username: "admin" },
      },
      site
    );
    expect(ld["@type"]).toBe("NewsArticle");
    expect(ld.headline).toBe("Arsenal Win");
    expect(ld.datePublished).toBe("2026-06-15T10:00:00.000Z");
    expect(ld.author.name).toBe("admin");
    expect(ld.publisher.name).toContain("RSW");
    expect(ld.image).toEqual(["https://rsw.example/uploads/a.png"]);
    expect(ld.mainEntityOfPage).toBe("https://rsw.example/news/arsenal-win");
  });

  it("omits image when there is no featured image", () => {
    const ld = articleJsonLd(
      { title: "X", slug: "x", excerpt: null, featuredImage: null, publishedAt: null, createdAt: new Date("2026-06-14T10:00:00Z"), author: { username: "a" } },
      site
    );
    expect(ld.image).toEqual([]);
    expect(ld.datePublished).toBe("2026-06-14T10:00:00.000Z"); // falls back to createdAt
  });

  it("builds WebSite and Organization", () => {
    expect(websiteJsonLd(site)["@type"]).toBe("WebSite");
    expect(websiteJsonLd(site).potentialAction.target).toContain("/news?q=");
    expect(organizationJsonLd(site)["@type"]).toBe("Organization");
    expect(organizationJsonLd(site).url).toBe(site);
  });
});
