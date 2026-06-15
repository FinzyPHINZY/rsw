import Link from "next/link";
import { getCategoriesWithCounts } from "@/lib/public-articles";
import { auth } from "@/lib/auth";
import { Avatar } from "@/components/community/Avatar";
import { LogoutButton } from "@/components/site/LogoutButton";

export async function Navbar() {
  const [categories, session] = await Promise.all([getCategoriesWithCounts(), auth()]);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-secondary">RSW</Link>
        <nav className="hidden gap-4 md:flex">
          {categories.slice(0, 5).map((c) => (
            <Link key={c.id} href={`/news?category=${c.slug}`} className="text-sm font-medium text-gray-600 hover:text-primary">
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/news" className="text-sm font-semibold text-primary hover:underline">All News</Link>
          {user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2">
                <Avatar username={user.name ?? "U"} size={28} />
                <span className="hidden text-sm font-medium text-secondary sm:inline">{user.name}</span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary">Sign in</Link>
              <Link href="/register" className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
