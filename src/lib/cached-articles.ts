import { unstable_cache } from "next/cache";
import { TAG_ARTICLES, articleTag } from "@/lib/cache-tags";
import {
  getPublishedArticles,
  getFeaturedArticle,
  getLatestArticles,
  getTrendingArticles,
  getArticleBySlug,
  getRelatedArticles,
  getCategoriesWithCounts,
  type PublishedListParams,
} from "@/lib/public-articles";
import { db } from "@/lib/db";

const REVALIDATE = 300;

export function getCachedArticleBySlug(slug: string) {
  return unstable_cache(() => getArticleBySlug(slug), ["article-by-slug", slug], {
    tags: [TAG_ARTICLES, articleTag(slug)],
    revalidate: REVALIDATE,
  })();
}

export function getCachedPublishedArticles(params: PublishedListParams) {
  const key = JSON.stringify(params);
  return unstable_cache(() => getPublishedArticles(params), ["published-articles", key], {
    tags: [TAG_ARTICLES],
    revalidate: REVALIDATE,
  })();
}

export const getCachedFeatured = unstable_cache(() => getFeaturedArticle(), ["featured"], {
  tags: [TAG_ARTICLES],
  revalidate: REVALIDATE,
});

export function getCachedLatest(limit: number, excludeId?: string) {
  return unstable_cache(
    () => getLatestArticles(limit, excludeId),
    ["latest", String(limit), excludeId ?? ""],
    { tags: [TAG_ARTICLES], revalidate: REVALIDATE }
  )();
}

export function getCachedTrending(limit: number) {
  return unstable_cache(() => getTrendingArticles(limit), ["trending", String(limit)], {
    tags: [TAG_ARTICLES],
    revalidate: REVALIDATE,
  })();
}

export function getCachedRelated(articleId: string, categoryId: string, limit: number) {
  return unstable_cache(
    () => getRelatedArticles(articleId, categoryId, limit),
    ["related", articleId, categoryId, String(limit)],
    { tags: [TAG_ARTICLES], revalidate: REVALIDATE }
  )();
}

export const getCachedCategoriesWithCounts = unstable_cache(
  () => getCategoriesWithCounts(),
  ["categories-with-counts"],
  { tags: [TAG_ARTICLES], revalidate: REVALIDATE }
);

export const getCachedSitemapArticles = unstable_cache(
  async () => {
    const rows = await db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    return rows;
  },
  ["sitemap-articles"],
  { tags: [TAG_ARTICLES], revalidate: REVALIDATE }
);
