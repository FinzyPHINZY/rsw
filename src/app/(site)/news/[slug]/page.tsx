import { notFound } from "next/navigation";
import { CategoryTag } from "@/components/site/CategoryTag";
import { ArticleCard } from "@/components/site/ArticleCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { renderTiptap } from "@/lib/tiptap-render";
import {
  getArticleBySlug,
  getRelatedArticles,
  incrementViews,
} from "@/lib/public-articles";
import { auth } from "@/lib/auth";
import { getPostLikeState } from "@/lib/post-likes";
import { PostLikeButton } from "@/components/community/PostLikeButton";
import { CommentSection } from "@/components/community/CommentSection";

export const dynamic = "force-dynamic";

function formatDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  await incrementViews(article.id);
  const related = await getRelatedArticles(article.id, article.categoryId, 3);
  const html = renderTiptap(article.content);
  const session = await auth();
  const likeState = await getPostLikeState(article.id, session?.user?.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <article>
        <CategoryTag name={article.category.name} slug={article.category.slug} />
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-secondary md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          By {article.author.username} · {formatDate(article.publishedAt ?? article.createdAt)} · {article.readingTime} min read
        </p>
        {article.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.featuredImage} alt="" className="mt-6 w-full rounded-lg object-cover" />
        )}
        <div className="mt-4">
          <PostLikeButton
            slug={slug}
            articleId={article.id}
            initialLiked={likeState.likedByMe}
            initialCount={likeState.count}
            canLike={!!session?.user}
          />
        </div>
        <div
          className="prose prose-lg mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Related" />
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <CommentSection articleId={article.id} slug={slug} />
    </main>
  );
}
