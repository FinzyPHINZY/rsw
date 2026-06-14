"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Category = { id: string; name: string };

type Initial = {
  id?: string;
  title?: string;
  excerpt?: string;
  content?: JSONContent;
  categoryId?: string;
  status?: "DRAFT" | "PUBLISHED";
  featuredImage?: string | null;
};

const emptyDoc: JSONContent = { type: "doc", content: [] };

export function ArticleForm({
  categories,
  initial = {},
}: {
  categories: Category[];
  initial?: Initial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title ?? "");
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? categories[0]?.id ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initial.status ?? "DRAFT");
  const [content, setContent] = useState<JSONContent>(initial.content ?? emptyDoc);
  const [featuredImage, setFeaturedImage] = useState(initial.featuredImage ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function uploadFeatured(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setFeaturedImage(data.url);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { title, excerpt, content, categoryId, status, featuredImage };
    const res = initial.id
      ? await fetch(`/api/articles/${initial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    setSaving(false);
    if (!res.ok) {
      setError("Save failed. Check the form.");
      return;
    }
    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input placeholder="Excerpt (optional)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      <div className="flex gap-4">
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-600">Featured image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && uploadFeatured(e.target.files[0])}
        />
        {featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={featuredImage} alt="" className="mt-2 h-32 rounded object-cover" />
        )}
      </div>
      <TiptapEditor value={content} onChange={setContent} />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
