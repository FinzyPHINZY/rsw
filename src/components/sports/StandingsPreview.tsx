import Link from "next/link";
import { getSportsProvider } from "@/lib/sports";
import { DEFAULT_LEAGUE, findLeague } from "@/lib/sports/leagues";

export async function StandingsPreview() {
  const league = findLeague(DEFAULT_LEAGUE)!;
  let top;
  try {
    top = (await getSportsProvider().getStandings(DEFAULT_LEAGUE)).slice(0, 5);
  } catch {
    top = null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-secondary">{league.name}</p>
        <Link href="/standings" className="text-xs text-primary hover:underline">Full table</Link>
      </div>
      {top === null ? (
        <p className="text-xs text-gray-400">Standings unavailable right now.</p>
      ) : (
        <ol className="space-y-1 text-sm">
          {top.map((s) => (
            <li key={s.rank} className="flex justify-between">
              <span className="text-secondary"><span className="mr-2 text-gray-400">{s.rank}</span>{s.team.name}</span>
              <span className="font-semibold text-secondary">{s.points}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
