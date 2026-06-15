import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const categories = [
  "Football",
  "Premier League",
  "La Liga",
  "Champions League",
  "Transfer News",
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@rsw.local";
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      username,
      password: await bcrypt.hash(password, 10),
      role: "ADMIN",
    },
  });

  for (const name of categories) {
    await db.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  const admin = await db.user.findUniqueOrThrow({ where: { email } });
  const allCats = await db.category.findMany();
  const catBySlug = (s: string) => allCats.find((c) => c.slug === s) ?? allCats[0];

  const para = (t: string) => ({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: t }] }],
  });

  const samples = [
    { title: "Arsenal Edge Past Chelsea in London Derby", slug: "arsenal-edge-past-chelsea",
      excerpt: "A late winner settles a tense derby at the Emirates.", categorySlug: "premier-league", views: 120 },
    { title: "La Liga Title Race Heats Up", slug: "la-liga-title-race-heats-up",
      excerpt: "Two points separate the top three with ten games to go.", categorySlug: "la-liga", views: 80 },
    { title: "Champions League Last 16 Preview", slug: "champions-league-last-16-preview",
      excerpt: "The standout ties and what to watch for.", categorySlug: "champions-league", views: 60 },
    { title: "Transfer Window: Five Deals to Watch", slug: "transfer-window-five-deals",
      excerpt: "The moves that could define the season run-in.", categorySlug: "transfer-news", views: 200 },
    { title: "Why Pressing Is Back in Fashion", slug: "why-pressing-is-back",
      excerpt: "Tactics corner: the return of the high press.", categorySlug: "football", views: 40 },
  ];

  for (const s of samples) {
    await db.article.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        title: s.title,
        slug: s.slug,
        excerpt: s.excerpt,
        content: para(`${s.title}. ${s.excerpt} More analysis and detail follows in the full report.`),
        categoryId: catBySlug(s.categorySlug).id,
        authorId: admin.id,
        status: "PUBLISHED",
        views: s.views,
        publishedAt: new Date(),
      },
    });
  }

  console.log("Seed complete:", email, "+", categories.length, "categories +", samples.length, "articles");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
