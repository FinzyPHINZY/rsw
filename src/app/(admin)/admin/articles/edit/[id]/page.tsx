import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getArticle } from "@/lib/articles";
import { ArticleForm } from "@/components/admin/ArticleForm";
import type { JSONContent } from "@tiptap/react";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Article</h1>
      <ArticleForm
        categories={categories}
        initial={{
          id: article.id,
          title: article.title,
          excerpt: article.excerpt ?? "",
          content: article.content as JSONContent,
          categoryId: article.categoryId,
          status: article.status,
          featuredImage: article.featuredImage,
        }}
      />
    </main>
  );
}
