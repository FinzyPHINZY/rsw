"use client";
import { useState, useTransition } from "react";
import type { CommentView } from "@/lib/comments";
import { Avatar } from "@/components/community/Avatar";
import { LikeButton } from "@/components/community/LikeButton";
import { CommentForm } from "@/components/community/CommentForm";
import { likeCommentAction, deleteCommentAction } from "@/lib/actions/comments";

function timeAgo(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CommentItem({
  comment,
  slug,
  articleId,
  canParticipate,
  depth = 0,
}: {
  comment: CommentView;
  slug: string;
  articleId: string;
  canParticipate: boolean;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);
  const [deleting, startDelete] = useTransition();

  function onDelete() {
    startDelete(async () => {
      await deleteCommentAction({ slug, commentId: comment.id });
    });
  }

  return (
    <div className={depth > 0 ? "ml-10 mt-3" : "mt-5"}>
      <div className="flex gap-3">
        <Avatar username={comment.author.username} size={32} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-secondary">{comment.author.username}</span>
            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-secondary">{comment.content}</p>
          <div className="mt-2 flex items-center gap-4">
            <LikeButton
              initialLiked={comment.likedByMe}
              initialCount={comment.likesCount}
              canLike={canParticipate}
              onToggle={() => likeCommentAction({ slug, commentId: comment.id })}
            />
            {depth === 0 && canParticipate && (
              <button onClick={() => setReplying((v) => !v)} className="text-sm text-gray-500 hover:text-primary">
                Reply
              </button>
            )}
            {comment.canDelete && (
              <button onClick={onDelete} disabled={deleting} className="text-sm text-gray-400 hover:text-danger">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <CommentForm
                slug={slug}
                articleId={articleId}
                parentCommentId={comment.id}
                placeholder="Write a reply…"
                onDone={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies.map((r) => (
        <CommentItem
          key={r.id}
          comment={r}
          slug={slug}
          articleId={articleId}
          canParticipate={canParticipate}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
