"use client";
import { useState, useTransition } from "react";
import { addCommentAction } from "@/lib/actions/comments";
import { Button } from "@/components/ui/Button";

export function CommentForm({
  slug,
  articleId,
  parentCommentId,
  placeholder = "Add a comment…",
  onDone,
}: {
  slug: string;
  articleId: string;
  parentCommentId?: string;
  placeholder?: string;
  onDone?: () => void;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    startTransition(async () => {
      const res = await addCommentAction({ slug, articleId, content, parentCommentId });
      if (res.ok) {
        setContent("");
        setError("");
        onDone?.();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={parentCommentId ? 2 : 3}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={pending || !content.trim()}>
        {pending ? "Posting…" : parentCommentId ? "Reply" : "Comment"}
      </Button>
    </form>
  );
}
