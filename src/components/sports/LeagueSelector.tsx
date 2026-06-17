import Link from "next/link";
import { LEAGUES } from "@/lib/sports/leagues";

export function LeagueSelector({ basePath, active }: { basePath: string; active: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {LEAGUES.map((l) => (
        <Link
          key={l.slug}
          href={`${basePath}?league=${l.slug}`}
          className={`rounded-full px-3 py-1 text-sm ${l.slug === active ? "bg-primary text-white" : "bg-gray-100 text-secondary hover:bg-gray-200"}`}
        >
          {l.name}
        </Link>
      ))}
    </div>
  );
}
