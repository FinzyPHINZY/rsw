import Link from "next/link";
import { getSportsProvider } from "@/lib/sports";
import { MatchCard } from "@/components/sports/MatchCard";

export async function ScoreStrip() {
  let matches;
  try {
    const provider = getSportsProvider();
    const live = await provider.getMatches({ status: "live" });
    const upcoming = live.length >= 4 ? [] : await provider.getMatches({ status: "upcoming" });
    matches = [...live, ...upcoming].slice(0, 4);
  } catch {
    matches = null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-secondary">Live Scores</p>
        <Link href="/scores" className="text-xs text-primary hover:underline">All scores</Link>
      </div>
      {matches === null ? (
        <p className="text-xs text-gray-400">Scores unavailable right now.</p>
      ) : matches.length > 0 ? (
        <div className="space-y-2">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">No matches right now.</p>
      )}
    </div>
  );
}
