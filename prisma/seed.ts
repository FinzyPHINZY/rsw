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

  console.log("Seed complete:", email, "+", categories.length, "categories");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
