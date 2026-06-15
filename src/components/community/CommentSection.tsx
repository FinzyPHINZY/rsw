import { getCommentsForArticle } from "@/lib/comments";
import { auth } from "@/lib/auth";
import { CommentForm } from "@/components/community/CommentForm";
import { CommentItem } from "@/components/community/CommentItem";
import { AuthPrompt } from "@/components/community/AuthPrompt";

export async function CommentSection({ articleId, slug }: { articleId: string; slug: string }) {
  const session = await auth();
  const current = session?.user ? { id: session.user.id, role: session.user.role } : undefined;
  const comments = await getCommentsForArticle(articleId, current);
  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <section className="mt-16">
      <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-bold text-secondary">
        Comments ({total})
      </h2>

      {current ? (
        <CommentForm slug={slug} articleId={articleId} />
      ) : (
        <AuthPrompt action="comment" />
      )}

      <div className="mt-4">
        {comments.length === 0 ? (
          <p className="py-6 text-sm text-gray-400">Be the first to comment.</p>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              slug={slug}
              articleId={articleId}
              canParticipate={!!current}
            />
          ))
        )}
      </div>
    </section>
  );
}
