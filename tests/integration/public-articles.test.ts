import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  getPublishedArticles,
  getArticleBySlug,
  getTrendingArticles,
  incrementViews,
} from "@/lib/public-articles";

const ids: string[] = [];
let catA: string;
let catB: string;
let authorId: string;
const body = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "body text here" }] }] };

beforeAll(async () => {
  const cats = await db.category.findMany({ take: 2, orderBy: { name: "asc" } });
  catA = cats[0].id;
  catB = cats[1].id;
  authorId = (await db.user.findFirstOrThrow({ where: { role: "ADMIN" } })).id;

  async function make(title: string, slug: string, categoryId: string, status: "DRAFT" | "PUBLISHED", views: number) {
    const a = await db.article.create({
      data: { title, slug, content: body, categoryId, authorId, status, views,
        publishedAt: status === "PUBLISHED" ? new Date() : null },
    });
    ids.push(a.id);
    return a;
  }

  await make("Zlatan Special Report", "s2-zlatan", catA, "PUBLISHED", 50);
  await make("Arsenal Tactics Deep Dive", "s2-arsenal", catA, "PUBLISHED", 10);
  await make("La Liga Roundup", "s2-laliga", catB, "PUBLISHED", 5);
  await make("Hidden Draft Article", "s2-draft", catA, "DRAFT", 999);
});

afterAll(async () => {
  await db.article.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
});

describe("public-articles", () => {
  it("returns only published articles", async () => {
    const { items } = await getPublishedArticles({ perPage: 100 });
    const slugs = items.map((i) => i.slug);
    expect(slugs).toContain("s2-zlatan");
    expect(slugs).not.toContain("s2-draft");
  });

  it("filters by category slug", async () => {
    const catBSlug = (await db.category.findUniqueOrThrow({ where: { id: catB } })).slug;
    const { items } = await getPublishedArticles({ categorySlug: catBSlug, perPage: 100 });
    // Robust to other published articles in this category (e.g. seeded data):
    // every returned item must belong to the filtered category, and our fixture
    // must be present.
    expect(items.every((i) => i.category.slug === catBSlug)).toBe(true);
    expect(items.map((i) => i.slug)).toContain("s2-laliga");
  });

  it("searches title case-insensitively", async () => {
    const { items } = await getPublishedArticles({ q: "zlatan", perPage: 100 });
    expect(items.map((i) => i.slug)).toContain("s2-zlatan");
    const none = await getPublishedArticles({ q: "zzzznomatch", perPage: 100 });
    expect(none.items.length).toBe(0);
  });

  it("paginates", async () => {
    const p1 = await getPublishedArticles({ page: 1, perPage: 2 });
    expect(p1.items.length).toBe(2);
    expect(p1.totalPages).toBeGreaterThanOrEqual(2);
    const p2 = await getPublishedArticles({ page: 2, perPage: 2 });
    expect(p2.items[0]?.id).not.toBe(p1.items[0]?.id);
  });

  it("includes a computed readingTime on cards", async () => {
    const { items } = await getPublishedArticles({ q: "zlatan", perPage: 1 });
    expect(items[0].readingTime).toBeGreaterThanOrEqual(1);
  });

  it("getArticleBySlug returns null for a draft", async () => {
    expect(await getArticleBySlug("s2-draft")).toBeNull();
    const pub = await getArticleBySlug("s2-zlatan");
    expect(pub?.title).toBe("Zlatan Special Report");
  });

  it("getTrendingArticles orders by views desc", async () => {
    // Fetch enough to include our fixtures regardless of seeded data, then check
    // relative order: s2-zlatan (50 views) must rank above s2-arsenal (10 views).
    const trending = await getTrendingArticles(100);
    const idx = trending.map((t) => t.slug);
    expect(idx.indexOf("s2-zlatan")).toBeGreaterThanOrEqual(0);
    expect(idx.indexOf("s2-arsenal")).toBeGreaterThanOrEqual(0);
    expect(idx.indexOf("s2-zlatan")).toBeLessThan(idx.indexOf("s2-arsenal"));
  });

  it("incrementViews bumps by exactly 1", async () => {
    const before = await db.article.findFirstOrThrow({ where: { slug: "s2-laliga" } });
    await incrementViews(before.id);
    const after = await db.article.findUniqueOrThrow({ where: { id: before.id } });
    expect(after.views).toBe(before.views + 1);
  });
});
