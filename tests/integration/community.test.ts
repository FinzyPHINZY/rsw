import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { registerUser, RegistrationError } from "@/lib/users";
import { verifyPassword } from "@/lib/password";
import {
  createComment,
  getCommentsForArticle,
  deleteComment,
  toggleCommentLike,
  getRecentComments,
  ForbiddenError,
} from "@/lib/comments";

const cleanupUserIds: string[] = [];

afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
  await db.$disconnect();
});

describe("registerUser", () => {
  it("creates a USER with a hashed password", async () => {
    const email = `reg-${Date.now()}@test.local`;
    const username = `reg_${Date.now()}`;
    const { id } = await registerUser({ username, email, password: "password123" });
    cleanupUserIds.push(id);
    const row = await db.user.findUniqueOrThrow({ where: { id } });
    expect(row.role).toBe("USER");
    expect(row.password).not.toBe("password123");
    expect(await verifyPassword("password123", row.password)).toBe(true);
  });

  it("rejects a duplicate email", async () => {
    const email = `dup-${Date.now()}@test.local`;
    const a = await registerUser({ username: `u_${Date.now()}_a`, email, password: "password123" });
    cleanupUserIds.push(a.id);
    await expect(
      registerUser({ username: `u_${Date.now()}_b`, email, password: "password123" })
    ).rejects.toBeInstanceOf(RegistrationError);
  });

  it("rejects a duplicate username", async () => {
    const username = `dupname_${Date.now()}`;
    const a = await registerUser({ username, email: `a-${Date.now()}@test.local`, password: "password123" });
    cleanupUserIds.push(a.id);
    await expect(
      registerUser({ username, email: `b-${Date.now()}@test.local`, password: "password123" })
    ).rejects.toBeInstanceOf(RegistrationError);
  });

  it("rejects invalid input", async () => {
    await expect(
      registerUser({ username: "ab", email: "not-an-email", password: "short" })
    ).rejects.toBeInstanceOf(RegistrationError);
  });
});

describe("comments service", () => {
  let articleId: string;
  let owner: string;
  let other: string;
  let adminId: string;
  const body = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x" }] }] };

  beforeAll(async () => {
    const cat = await db.category.findFirstOrThrow();
    adminId = (await db.user.findFirstOrThrow({ where: { role: "ADMIN" } })).id;
    const o = await registerUser({ username: `owner_${Date.now()}`, email: `owner-${Date.now()}@t.local`, password: "password123" });
    const t = await registerUser({ username: `other_${Date.now()}`, email: `other-${Date.now()}@t.local`, password: "password123" });
    owner = o.id; other = t.id;
    cleanupUserIds.push(owner, other);
    const article = await db.article.create({
      data: { title: `C Test ${Date.now()}`, slug: `c-test-${Date.now()}`, content: body, categoryId: cat.id, authorId: adminId, status: "PUBLISHED", publishedAt: new Date() },
    });
    articleId = article.id;
  });

  afterAll(async () => {
    await db.commentLike.deleteMany({ where: { comment: { articleId } } });
    await db.comment.deleteMany({ where: { articleId } });
    await db.article.delete({ where: { id: articleId } });
  });

  it("creates a top-level comment", async () => {
    const { id } = await createComment({ articleId, userId: owner, content: "Hello world" });
    const row = await db.comment.findUniqueOrThrow({ where: { id } });
    expect(row.parentCommentId).toBeNull();
  });

  it("attaches a reply to its parent and flattens reply-to-reply", async () => {
    const top = await createComment({ articleId, userId: owner, content: "top" });
    const reply = await createComment({ articleId, userId: other, content: "reply", parentCommentId: top.id });
    const replyRow = await db.comment.findUniqueOrThrow({ where: { id: reply.id } });
    expect(replyRow.parentCommentId).toBe(top.id);
    const deep = await createComment({ articleId, userId: owner, content: "deep", parentCommentId: reply.id });
    const deepRow = await db.comment.findUniqueOrThrow({ where: { id: deep.id } });
    expect(deepRow.parentCommentId).toBe(top.id);
  });

  it("returns threaded shape with likedByMe and canDelete", async () => {
    const top = await createComment({ articleId, userId: owner, content: "threaded root" });
    await createComment({ articleId, userId: other, content: "a reply", parentCommentId: top.id });

    const asOwner = await getCommentsForArticle(articleId, { id: owner, role: "USER" });
    const root = asOwner.find((c) => c.id === top.id)!;
    expect(root.replies.length).toBeGreaterThanOrEqual(1);
    expect(root.canDelete).toBe(true);
    expect(root.likedByMe).toBe(false);

    const asOther = await getCommentsForArticle(articleId, { id: other, role: "USER" });
    expect(asOther.find((c) => c.id === top.id)!.canDelete).toBe(false);

    const asAdmin = await getCommentsForArticle(articleId, { id: adminId, role: "ADMIN" });
    expect(asAdmin.find((c) => c.id === top.id)!.canDelete).toBe(true);
  });

  it("toggles a comment like and count", async () => {
    const c = await createComment({ articleId, userId: owner, content: "like me" });
    const liked = await toggleCommentLike(c.id, other);
    expect(liked).toEqual({ liked: true, count: 1 });
    const unliked = await toggleCommentLike(c.id, other);
    expect(unliked).toEqual({ liked: false, count: 0 });
  });

  it("deletes: owner ok, stranger forbidden, admin ok, replies cascade", async () => {
    const top = await createComment({ articleId, userId: owner, content: "to delete" });
    const reply = await createComment({ articleId, userId: other, content: "child", parentCommentId: top.id });
    await toggleCommentLike(reply.id, owner);

    await expect(deleteComment(top.id, { id: other, role: "USER" })).rejects.toBeInstanceOf(ForbiddenError);

    await deleteComment(top.id, { id: owner, role: "USER" });
    expect(await db.comment.findUnique({ where: { id: top.id } })).toBeNull();
    expect(await db.comment.findUnique({ where: { id: reply.id } })).toBeNull();
    expect(await db.commentLike.count({ where: { commentId: reply.id } })).toBe(0);

    const adminTarget = await createComment({ articleId, userId: owner, content: "admin removes" });
    await deleteComment(adminTarget.id, { id: adminId, role: "ADMIN" });
    expect(await db.comment.findUnique({ where: { id: adminTarget.id } })).toBeNull();
  });

  it("getRecentComments returns newest-first with author + article", async () => {
    await createComment({ articleId, userId: owner, content: "recent one" });
    const recent = await getRecentComments(5);
    expect(recent.length).toBeGreaterThanOrEqual(1);
    expect(recent[0]).toHaveProperty("author.username");
    expect(recent[0]).toHaveProperty("article.slug");
  });
});
