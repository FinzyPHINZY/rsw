import { SITE_NAME } from "@/lib/site";

type ArticleInput = {
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  author: { username: string };
};

export function articleJsonLd(a: ArticleInput, siteUrl: string) {
  // `new Date(...)` coerces both Date objects and ISO strings (unstable_cache
  // serializes Dates to strings on a cache hit).
  const published = new Date(a.publishedAt ?? a.createdAt).toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.excerpt ?? undefined,
    image: a.featuredImage ? [`${siteUrl}${a.featuredImage}`] : [],
    datePublished: published,
    dateModified: published,
    author: { "@type": "Person", name: a.author.username },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${siteUrl}/news/${a.slug}`,
  };
}

export function websiteJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/news?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
  };
}
