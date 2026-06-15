"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createComment,
  deleteComment,
  toggleCommentLike,
  ForbiddenError,
} from "@/lib/comments";

type Result = { ok: true } | { ok: false; error: string };
type LikeResult = { ok: true; liked: boolean; count: number } | { ok: false; error: string };

const SIGN_IN = "Please sign in to participate.";

export async function addCommentAction(input: {
  slug: string;
  articleId: string;
  content: string;
  parentCommentId?: string;
}): Promise<Result> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: SIGN_IN };
  if (!input.content.trim()) return { ok: false, error: "Comment cannot be empty" };
  try {
    await createComment({
      articleId: input.articleId,
      userId: session.user.id,
      content: input.content,
      parentCommentId: input.parentCommentId,
    });
  } catch {
    return { ok: false, error: "Could not post comment." };
  }
  revalidatePath(`/news/${input.slug}`);
  return { ok: true };
}

export async function deleteCommentAction(input: {
  slug: string;
  commentId: string;
}): Promise<Result> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: SIGN_IN };
  try {
    await deleteComment(input.commentId, { id: session.user.id, role: session.user.role });
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, error: e.message };
    return { ok: false, error: "Could not delete comment." };
  }
  revalidatePath(`/news/${input.slug}`);
  return { ok: true };
}

export async function likeCommentAction(input: {
  slug: string;
  commentId: string;
}): Promise<LikeResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: SIGN_IN };
  const state = await toggleCommentLike(input.commentId, session.user.id);
  revalidatePath(`/news/${input.slug}`);
  return { ok: true, ...state };
}
