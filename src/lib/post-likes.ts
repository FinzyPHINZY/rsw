import { db } from "@/lib/db";

export async function getPostLikeState(
  articleId: string,
  currentUserId?: string
): Promise<{ count: number; likedByMe: boolean }> {
  const [count, mine] = await Promise.all([
    db.postLike.count({ where: { articleId } }),
    currentUserId
      ? db.postLike.findUnique({ where: { userId_articleId: { userId: currentUserId, articleId } } })
      : Promise.resolve(null),
  ]);
  return { count, likedByMe: !!mine };
}

export async function togglePostLike(
  articleId: string,
  userId: string
): Promise<{ liked: boolean; count: number }> {
  const existing = await db.postLike.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });
  if (existing) {
    await db.postLike.delete({ where: { id: existing.id } });
  } else {
    await db.postLike.create({ data: { userId, articleId } });
  }
  const count = await db.postLike.count({ where: { articleId } });
  return { liked: !existing, count };
}
