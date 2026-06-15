import Link from "next/link";
import { getCategoriesWithCounts } from "@/lib/public-articles";

export async function Navbar() {
  const categories = await getCategoriesWithCounts();
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-secondary">
          RSW
        </Link>
        <nav className="hidden gap-4 md:flex">
          {categories.slice(0, 5).map((c) => (
            <Link key={c.id} href={`/news?category=${c.slug}`} className="text-sm font-medium text-gray-600 hover:text-primary">
              {c.name}
            </Link>
          ))}
        </nav>
        <Link href="/news" className="text-sm font-semibold text-primary hover:underline">
          All News
        </Link>
      </div>
    </header>
  );
}
