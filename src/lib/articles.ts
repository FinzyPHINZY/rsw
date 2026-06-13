import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";
import type {
  CreateArticleInput,
  UpdateArticleInput,
} from "@/lib/validators/article";

export async function createArticle(input: CreateArticleInput, authorId: string) {
  const base = slugify(input.title);
  const slug = await uniqueSlug(base, async (s) => {
    const existing = await db.article.findUnique({ where: { slug: s } });
    return existing !== null;
  });

  return db.article.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      featuredImage: input.featuredImage || null,
      categoryId: input.categoryId,
      authorId,
      status: input.status ?? "DRAFT",
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    },
  });
}

export async function listArticles() {
  return db.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, author: { select: { username: true } } },
  });
}

export async function getArticle(id: string) {
  return db.article.findUnique({ where: { id } });
}

export async function updateArticle(id: string, input: UpdateArticleInput) {
  return db.article.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.featuredImage !== undefined && {
        featuredImage: input.featuredImage || null,
      }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.status !== undefined && {
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      }),
    },
  });
}

export async function deleteArticle(id: string) {
  return db.article.delete({ where: { id } });
}
