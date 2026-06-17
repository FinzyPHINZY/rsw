import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { updateArticle, deleteArticle } from "@/lib/articles";
import { updateArticleSchema } from "@/lib/validators/article";
import { TAG_ARTICLES, articleTag } from "@/lib/cache-tags";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const parsed = updateArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await updateArticle(id, parsed.data);
  revalidateTag(TAG_ARTICLES, "max");
  revalidateTag(articleTag(updated.slug), "max");
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await db.article.findUnique({ where: { id }, select: { slug: true } });
  await deleteArticle(id);
  revalidateTag(TAG_ARTICLES, "max");
  if (existing) revalidateTag(articleTag(existing.slug), "max");
  return NextResponse.json({ ok: true });
}
