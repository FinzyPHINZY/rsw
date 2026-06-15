import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-gray-500 md:flex-row">
        <span className="font-bold text-secondary">RSW — Reality Sporting World</span>
        <nav className="flex gap-4">
          <Link href="/" className="hover:text-primary">Home</Link>
          <Link href="/news" className="hover:text-primary">News</Link>
        </nav>
        <span>© {new Date().getFullYear()} RSW</span>
      </div>
    </footer>
  );
}
