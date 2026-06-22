import type { MetadataRoute } from "next";

export function buildSitemapEntries(
  siteUrl: string,
  staticRoutes: string[],
  articles: { slug: string; updatedAt: Date }[]
): MetadataRoute.Sitemap {
  const abs = (path: string) => (path === "/" ? siteUrl : `${siteUrl}${path}`);
  const staticEntries = staticRoutes.map((r) => ({ url: abs(r), lastModified: new Date() }));
  const articleEntries = articles.map((a) => ({
    url: `${siteUrl}/news/${a.slug}`,
    lastModified: a.updatedAt,
  }));
  return [...staticEntries, ...articleEntries];
}
