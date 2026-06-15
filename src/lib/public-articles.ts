import { db } from "@/lib/db";
import { readingTimeFromTiptap } from "@/lib/reading-time";
import type { Prisma } from "@prisma/client";

export type ArticleCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: { name: string; slug: string };
  publishedAt: Date | null;
  createdAt: Date;
  readingTime: number;
};

type WithContentAndCategory = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  content: Prisma.JsonValue;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string; slug: string };
};

function toCard(a: WithContentAndCategory): ArticleCardData {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    featuredImage: a.featuredImage,
    category: a.category,
    publishedAt: a.publishedAt,
    createdAt: a.createdAt,
    readingTime: readingTimeFromTiptap(a.content),
  };
}

const cardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  featuredImage: true,
  content: true,
  publishedAt: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ArticleSelect;

const newestFirst: Prisma.ArticleOrderByWithRelationInput[] = [
  { publishedAt: "desc" },
  { createdAt: "desc" },
];

export type PublishedListParams = {
  categorySlug?: string;
  q?: string;
  page?: number;
  perPage?: number;
};

export type PublishedListResult = {
  items: ArticleCardData[];
  total: number;
  totalPages: number;
  page: number;
};

export async function getPublishedArticles(
  params: PublishedListParams = {}
): Promise<PublishedListResult> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.max(1, params.perPage ?? 12);

  const where: Prisma.ArticleWhereInput = {
    status: "PUBLISHED",
    ...(params.categorySlug ? { category: { slug: params.categorySlug } } : {}),
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q, mode: "insensitive" } },
            { excerpt: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: newestFirst,
      skip: (page - 1) * perPage,
      take: perPage,
      select: cardSelect,
    }),
  ]);

  return {
    items: rows.map(toCard),
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    page,
  };
}

export async function getFeaturedArticle(): Promise<ArticleCardData | null> {
  const row = await db.article.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: newestFirst,
    select: cardSelect,
  });
  return row ? toCard(row) : null;
}

export async function getLatestArticles(
  limit: number,
  excludeId?: string
): Promise<ArticleCardData[]> {
  const rows = await db.article.findMany({
    where: { status: "PUBLISHED", ...(excludeId ? { id: { not: excludeId } } : {}) },
    orderBy: newestFirst,
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function getTrendingArticles(limit: number): Promise<ArticleCardData[]> {
  const rows = await db.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ views: "desc" }, ...newestFirst],
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export type FullArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  content: Prisma.JsonValue;
  publishedAt: Date | null;
  createdAt: Date;
  views: number;
  categoryId: string;
  category: { name: string; slug: string };
  author: { username: string };
  readingTime: number;
};

export async function getArticleBySlug(slug: string): Promise<FullArticle | null> {
  const a = await db.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      ...cardSelect,
      views: true,
      categoryId: true,
      author: { select: { username: true } },
    },
  });
  if (!a) return null;
  return { ...a, readingTime: readingTimeFromTiptap(a.content) };
}

export async function getRelatedArticles(
  articleId: string,
  categoryId: string,
  limit: number
): Promise<ArticleCardData[]> {
  const rows = await db.article.findMany({
    where: { status: "PUBLISHED", categoryId, id: { not: articleId } },
    orderBy: newestFirst,
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function incrementViews(id: string): Promise<void> {
  await db.article.update({ where: { id }, data: { views: { increment: 1 } } });
}

export async function getCategoriesWithCounts(): Promise<
  { id: string; name: string; slug: string; count: number }[]
> {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  const grouped = await db.article.groupBy({
    by: ["categoryId"],
    where: { status: "PUBLISHED" },
    _count: { _all: true },
  });
  const counts = new Map(grouped.map((g) => [g.categoryId, g._count._all]));
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: counts.get(c.id) ?? 0,
  }));
}
