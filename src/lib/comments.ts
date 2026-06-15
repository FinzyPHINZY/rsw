import { z } from "zod";
import { db } from "@/lib/db";

export class ForbiddenError extends Error {}

export type CommentView = {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; username: string };
  likesCount: number;
  likedByMe: boolean;
  canDelete: boolean;
  replies: CommentView[];
};

const contentSchema = z.string().trim().min(1, "Comment cannot be empty").max(2000);

export async function createComment(input: {
  articleId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
}): Promise<{ id: string }> {
  const content = contentSchema.parse(input.content);

  let parentCommentId: string | null = null;
  if (input.parentCommentId) {
    const parent = await db.comment.findUniqueOrThrow({
      where: { id: input.parentCommentId },
      select: { id: true, parentCommentId: true },
    });
    // single-level: a reply to a reply re-parents to the top-level ancestor
    parentCommentId = parent.parentCommentId ?? parent.id;
  }

  const comment = await db.comment.create({
    data: { articleId: input.articleId, userId: input.userId, content, parentCommentId },
  });
  return { id: comment.id };
}

type CurrentUser = { id: string; role: string };

export async function getCommentsForArticle(
  articleId: string,
  current?: CurrentUser
): Promise<CommentView[]> {
  const tops = await db.comment.findMany({
    where: { articleId, parentCommentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, username: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, username: true } } },
      },
    },
  });

  const allIds = tops.flatMap((t) => [t.id, ...t.replies.map((r) => r.id)]);
  const likedSet = new Set<string>();
  if (current && allIds.length > 0) {
    const likes = await db.commentLike.findMany({
      where: { userId: current.id, commentId: { in: allIds } },
      select: { commentId: true },
    });
    likes.forEach((l) => likedSet.add(l.commentId));
  }

  const canDelete = (authorId: string) =>
    !!current && (current.role === "ADMIN" || current.id === authorId);

  type Row = (typeof tops)[number];
  type ReplyRow = Row["replies"][number];

  const view = (c: Row | ReplyRow, replies: CommentView[]): CommentView => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    author: c.user,
    likesCount: c.likesCount,
    likedByMe: likedSet.has(c.id),
    canDelete: canDelete(c.user.id),
    replies,
  });

  return tops.map((t) => view(t, t.replies.map((r) => view(r, []))));
}

export async function deleteComment(
  commentId: string,
  actor: CurrentUser
): Promise<void> {
  const comment = await db.comment.findUniqueOrThrow({
    where: { id: commentId },
    select: { id: true, userId: true },
  });
  if (actor.role !== "ADMIN" && actor.id !== comment.userId) {
    throw new ForbiddenError("You can only delete your own comments");
  }

  const replies = await db.comment.findMany({
    where: { parentCommentId: commentId },
    select: { id: true },
  });
  const ids = [commentId, ...replies.map((r) => r.id)];

  await db.$transaction([
    db.commentLike.deleteMany({ where: { commentId: { in: ids } } }),
    db.comment.deleteMany({ where: { parentCommentId: commentId } }),
    db.comment.delete({ where: { id: commentId } }),
  ]);
}

export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<{ liked: boolean; count: number }> {
  const existing = await db.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });

  if (existing) {
    const [, updated] = await db.$transaction([
      db.commentLike.delete({ where: { id: existing.id } }),
      db.comment.update({ where: { id: commentId }, data: { likesCount: { decrement: 1 } }, select: { likesCount: true } }),
    ]);
    return { liked: false, count: updated.likesCount };
  }

  const [, updated] = await db.$transaction([
    db.commentLike.create({ data: { userId, commentId } }),
    db.comment.update({ where: { id: commentId }, data: { likesCount: { increment: 1 } }, select: { likesCount: true } }),
  ]);
  return { liked: true, count: updated.likesCount };
}

export async function getRecentComments(limit: number): Promise<
  { id: string; content: string; createdAt: Date; author: { username: string }; article: { title: string; slug: string } }[]
> {
  const rows = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { username: true } },
      article: { select: { title: true, slug: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    createdAt: r.createdAt,
    author: r.user,
    article: r.article,
  }));
}
