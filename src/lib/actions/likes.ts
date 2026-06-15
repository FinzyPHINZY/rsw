"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { togglePostLike } from "@/lib/post-likes";

type LikeResult = { ok: true; liked: boolean; count: number } | { ok: false; error: string };

export async function likePostAction(input: {
  slug: string;
  articleId: string;
}): Promise<LikeResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Please sign in to participate." };
  const state = await togglePostLike(input.articleId, session.user.id);
  revalidatePath(`/news/${input.slug}`);
  return { ok: true, ...state };
}
