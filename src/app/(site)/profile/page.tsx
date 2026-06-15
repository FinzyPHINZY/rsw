import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar } from "@/components/community/Avatar";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?from=/profile");

  const comments = await db.comment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, content: true, createdAt: true, article: { select: { title: true, slug: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Avatar username={session.user.name ?? "U"} size={56} />
        <div>
          <h1 className="text-2xl font-bold">{session.user.name}</h1>
          <p className="text-sm text-gray-500">{session.user.email}</p>
        </div>
      </div>
      <h2 className="mb-3 text-lg font-semibold">Your recent comments</h2>
      {comments.length > 0 ? (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md border border-gray-200 p-3 text-sm">
              <p className="text-secondary">{c.content}</p>
              <Link href={`/news/${c.article.slug}`} className="mt-1 block text-xs text-primary hover:underline">
                on {c.article.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">You haven&apos;t commented yet.</p>
      )}
    </main>
  );
}
