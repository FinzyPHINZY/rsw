import type { Match } from "@/lib/sports/types";
import { MatchCard } from "@/components/sports/MatchCard";

export function MatchList({ title, matches }: { title: string; matches: Match[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">{title}</h2>
      {matches.length > 0 ? (
        <div className="space-y-2">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Nothing here right now.</p>
      )}
    </section>
  );
}
