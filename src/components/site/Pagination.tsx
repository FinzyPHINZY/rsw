"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const params = useSearchParams();
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    return `/news?${next.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="rounded px-3 py-1.5 text-sm text-secondary hover:bg-gray-100">
          Prev
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className={`rounded px-3 py-1.5 text-sm ${
            p === page ? "bg-primary text-white" : "text-secondary hover:bg-gray-100"
          }`}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className="rounded px-3 py-1.5 text-sm text-secondary hover:bg-gray-100">
          Next
        </Link>
      )}
    </nav>
  );
}
