import Link from "next/link";
import { listArticles } from "@/lib/articles";
import { Button } from "@/components/ui/Button";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await listArticles();
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link href="/admin/articles/new">
          <Button>New Article</Button>
        </Link>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2">Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id} className="border-b">
              <td className="py-2 font-medium">{a.title}</td>
              <td>{a.category.name}</td>
              <td>
                <span className={a.status === "PUBLISHED" ? "text-success" : "text-gray-500"}>
                  {a.status}
                </span>
              </td>
              <td>{new Date(a.createdAt).toLocaleDateString()}</td>
              <td className="flex gap-2 py-2">
                <Link href={`/admin/articles/edit/${a.id}`} className="text-primary">
                  Edit
                </Link>
                <DeleteArticleButton id={a.id} />
              </td>
            </tr>
          ))}
          {articles.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-400">
                No articles yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
