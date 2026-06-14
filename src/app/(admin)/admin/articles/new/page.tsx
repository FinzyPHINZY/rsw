import { db } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">New Article</h1>
      <ArticleForm categories={categories} />
    </main>
  );
}
