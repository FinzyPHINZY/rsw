"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    const category = params.get("category");
    if (category) next.set("category", category);
    router.push(`/news?${next.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <Input
        type="search"
        placeholder="Search articles…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search articles"
      />
    </form>
  );
}
