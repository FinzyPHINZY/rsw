import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  createArticle,
  listArticles,
  updateArticle,
  deleteArticle,
} from "@/lib/articles";

let categoryId: string;
let authorId: string;
const createdIds: string[] = [];

beforeAll(async () => {
  const cat = await db.category.findFirstOrThrow();
  categoryId = cat.id;
  const admin = await db.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  authorId = admin.id;
});

afterAll(async () => {
  await db.article.deleteMany({ where: { id: { in: createdIds } } });
  await db.$disconnect();
});

describe("article service", () => {
  it("creates an article with a unique slug", async () => {
    const a = await createArticle(
      { title: "Test Match Report", content: { type: "doc", content: [] }, categoryId, status: "DRAFT" },
      authorId
    );
    createdIds.push(a.id);
    expect(a.slug).toBe("test-match-report");

    const b = await createArticle(
      { title: "Test Match Report", content: { type: "doc", content: [] }, categoryId, status: "DRAFT" },
      authorId
    );
    createdIds.push(b.id);
    expect(b.slug).toBe("test-match-report-2");
  });

  it("lists articles newest first", async () => {
    const list = await listArticles();
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it("updates an article", async () => {
    const updated = await updateArticle(createdIds[0], { title: "Updated Title" });
    expect(updated.title).toBe("Updated Title");
  });

  it("deletes an article", async () => {
    const id = createdIds.pop()!;
    await deleteArticle(id);
    const found = await db.article.findUnique({ where: { id } });
    expect(found).toBeNull();
  });
});
