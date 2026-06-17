import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { createArticle, listArticles } from "@/lib/articles";
import { createArticleSchema } from "@/lib/validators/article";
import { TAG_ARTICLES } from "@/lib/cache-tags";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await listArticles());
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = createArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const article = await createArticle(parsed.data, session.user.id);
  revalidateTag(TAG_ARTICLES, "max");
  return NextResponse.json(article, { status: 201 });
}
