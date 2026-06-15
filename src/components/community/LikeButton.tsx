"use client";
import { useOptimistic, useTransition } from "react";

type ToggleResult = { ok: true; liked: boolean; count: number } | { ok: false; error: string };

export function LikeButton({
  initialLiked,
  initialCount,
  canLike,
  onToggle,
}: {
  initialLiked: boolean;
  initialCount: number;
  canLike: boolean;
  onToggle: () => Promise<ToggleResult>;
}) {
  const [state, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (_cur, next: { liked: boolean; count: number }) => next
  );
  const [, startTransition] = useTransition();

  function handle() {
    if (!canLike) return;
    startTransition(async () => {
      setOptimistic({ liked: !state.liked, count: state.count + (state.liked ? -1 : 1) });
      const res = await onToggle();
      if (res.ok) setOptimistic({ liked: res.liked, count: res.count });
    });
  }

  return (
    <button
      onClick={handle}
      disabled={!canLike}
      title={canLike ? undefined : "Sign in to like"}
      className={`inline-flex items-center gap-1 text-sm ${state.liked ? "text-danger" : "text-gray-500"} ${canLike ? "hover:text-danger" : "cursor-not-allowed opacity-70"}`}
      aria-pressed={state.liked}
    >
      <span aria-hidden>{state.liked ? "♥" : "♡"}</span>
      <span>{state.count}</span>
    </button>
  );
}
