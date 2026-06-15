import Link from "next/link";
import { ArticleCard } from "@/components/site/ArticleCard";
import { SearchBar } from "@/components/site/SearchBar";
import { Pagination } from "@/components/site/Pagination";
import { getPublishedArticles, getCategoriesWithCounts } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const categorySlug = sp.category;
  const q = sp.q;

  const [{ items, totalPages, page: current }, categories] = await Promise.all([
    getPublishedArticles({ categorySlug, q, page, perPage: 12 }),
    getCategoriesWithCounts(),
  ]);

  function chipHref(slug?: string) {
    const next = new URLSearchParams();
    if (slug) next.set("category", slug);
    if (q) next.set("q", q);
    const qs = next.toString();
    return qs ? `/news?${qs}` : "/news";
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">All News</h1>

      <div className="mb-6 flex flex-col gap-4">
        <SearchBar />
        <div className="flex flex-wrap gap-2">
          <Link
            href={chipHref(undefined)}
            className={`rounded-full px-3 py-1 text-sm ${!categorySlug ? "bg-primary text-white" : "bg-gray-100 text-secondary hover:bg-gray-200"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={chipHref(c.slug)}
              className={`rounded-full px-3 py-1 text-sm ${categorySlug === c.slug ? "bg-primary text-white" : "bg-gray-100 text-secondary hover:bg-gray-200"}`}
            >
              {c.name} ({c.count})
            </Link>
          ))}
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-gray-400">No articles found.</p>
      )}

      <Pagination page={current} totalPages={totalPages} />
    </main>
  );
}
