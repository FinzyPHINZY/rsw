import { getSportsProvider } from "@/lib/sports";
import { DEFAULT_LEAGUE, findLeague } from "@/lib/sports/leagues";
import { LeagueSelector } from "@/components/sports/LeagueSelector";
import { LeagueTable } from "@/components/sports/LeagueTable";

export const dynamic = "force-dynamic";

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const sp = await searchParams;
  const slug = findLeague(sp.league ?? "") ? sp.league! : DEFAULT_LEAGUE;
  const league = findLeague(slug)!;

  let body;
  try {
    const standings = await getSportsProvider().getStandings(slug);
    body = <LeagueTable standings={standings} />;
  } catch {
    body = <p className="text-sm text-gray-400">Standings unavailable right now.</p>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">{league.name} Table</h1>
      <LeagueSelector basePath="/standings" active={slug} />
      {body}
    </main>
  );
}
