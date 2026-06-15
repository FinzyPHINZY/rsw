import Link from "next/link";
import { CategoryTag } from "@/components/site/CategoryTag";
import type { ArticleCardData } from "@/lib/public-articles";

function formatDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ArticleCard({
  article,
  variant = "grid",
}: {
  article: ArticleCardData;
  variant?: "hero" | "grid";
}) {
  const href = `/news/${article.slug}`;
  const isHero = variant === "hero";

  return (
    <article className={isHero ? "group" : "group flex flex-col"}>
      <Link href={href} className="block overflow-hidden rounded-lg bg-gray-100">
        {article.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featuredImage}
            alt=""
            className={`w-full object-cover transition group-hover:opacity-95 ${
              isHero ? "h-72 md:h-96" : "h-44"
            }`}
          />
        ) : (
          <div className={`w-full bg-gradient-to-br from-secondary/10 to-primary/10 ${isHero ? "h-72 md:h-96" : "h-44"}`} />
        )}
      </Link>
      <div className={isHero ? "mt-4" : "mt-3"}>
        <CategoryTag name={article.category.name} slug={article.category.slug} />
        <h3 className={`mt-2 font-bold tracking-tight text-secondary group-hover:text-primary ${isHero ? "text-2xl md:text-3xl" : "text-base"}`}>
          <Link href={href}>{article.title}</Link>
        </h3>
        {article.excerpt && (
          <p className={`mt-1 text-gray-600 ${isHero ? "text-base" : "text-sm line-clamp-2"}`}>
            {article.excerpt}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          {formatDate(article.publishedAt ?? article.createdAt)} · {article.readingTime} min read
        </p>
      </div>
    </article>
  );
}
