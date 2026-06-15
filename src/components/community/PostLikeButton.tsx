"use client";
import { LikeButton } from "@/components/community/LikeButton";
import { likePostAction } from "@/lib/actions/likes";

export function PostLikeButton({
  slug,
  articleId,
  initialLiked,
  initialCount,
  canLike,
}: {
  slug: string;
  articleId: string;
  initialLiked: boolean;
  initialCount: number;
  canLike: boolean;
}) {
  return (
    <LikeButton
      initialLiked={initialLiked}
      initialCount={initialCount}
      canLike={canLike}
      onToggle={() => likePostAction({ slug, articleId })}
    />
  );
}
