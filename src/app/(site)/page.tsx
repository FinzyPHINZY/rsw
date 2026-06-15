import { SectionHeading } from "@/components/site/SectionHeading";
import { ArticleCard } from "@/components/site/ArticleCard";
import { ComingSoon } from "@/components/site/ComingSoon";
import { CategoryTag } from "@/components/site/CategoryTag";
import Link from "next/link";
import {
  getFeaturedArticle,
  getLatestArticles,
  getTrendingArticles,
} from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedArticle();
  const latest = await getLatestArticles(6, featured?.id);
  const trending = await getTrendingArticles(5);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero */}
      {featured ? (
        <section className="mb-12">
          <ArticleCard article={featured} variant="hero" />
        </section>
      ) : (
        <section className="mb-12 rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-400">
          No articles yet. Check back soon.
        </section>
      )}

      <div className="grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          {/* Latest */}
          <section className="mb-12">
            <SectionHeading title="Latest News" href="/news" />
            {latest.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {latest.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No articles yet.</p>
            )}
          </section>
        </div>

        <aside>
          {/* Trending */}
          <section className="mb-12">
            <SectionHeading title="Trending" />
            <ol className="space-y-3">
              {trending.map((a, i) => (
                <li key={a.id} className="flex gap-3">
                  <span className="text-lg font-bold text-primary">{i + 1}</span>
                  <div>
                    <CategoryTag name={a.category.name} slug={a.category.slug} />
                    <Link href={`/news/${a.slug}`} className="mt-1 block text-sm font-semibold text-secondary hover:text-primary">
                      {a.title}
                    </Link>
                  </div>
                </li>
              ))}
              {trending.length === 0 && <li className="text-sm text-gray-400">Nothing trending yet.</li>}
            </ol>
          </section>
        </aside>
      </div>

      {/* Placeholder sections (later slices) */}
      <div className="grid gap-6 md:grid-cols-3">
        <ComingSoon title="Live Scores" subtitle="Live match scores — coming soon" />
        <ComingSoon title="League Standings" subtitle="League tables — coming soon" />
        <ComingSoon title="Community" subtitle="Reader discussion — coming soon" />
      </div>
    </main>
  );
}
