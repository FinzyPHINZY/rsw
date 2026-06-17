import { getSportsProvider } from "@/lib/sports";
import { findLeague } from "@/lib/sports/leagues";
import { LeagueSelector } from "@/components/sports/LeagueSelector";
import { MatchList } from "@/components/sports/MatchList";

export const dynamic = "force-dynamic";

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const sp = await searchParams;
  const leagueSlug = findLeague(sp.league ?? "") ? sp.league : undefined;

  let content;
  try {
    const provider = getSportsProvider();
    const [live, upcoming, finished] = await Promise.all([
      provider.getMatches({ leagueSlug, status: "live" }),
      provider.getMatches({ leagueSlug, status: "upcoming" }),
      provider.getMatches({ leagueSlug, status: "finished" }),
    ]);
    content = (
      <>
        <MatchList title="Live" matches={live} />
        <MatchList title="Upcoming" matches={upcoming} />
        <MatchList title="Results" matches={finished} />
      </>
    );
  } catch {
    content = <p className="text-sm text-gray-400">Scores unavailable right now.</p>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Live Scores</h1>
      <LeagueSelector basePath="/scores" active={leagueSlug ?? ""} />
      {content}
    </main>
  );
}
