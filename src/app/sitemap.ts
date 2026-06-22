import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getCachedSitemapArticles } from "@/lib/cached-articles";
import { buildSitemapEntries } from "@/lib/seo/sitemap-entries";

const STATIC_ROUTES = ["/", "/news", "/scores", "/standings", "/login", "/register"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getCachedSitemapArticles();
  return buildSitemapEntries(SITE_URL, STATIC_ROUTES, articles);
}
