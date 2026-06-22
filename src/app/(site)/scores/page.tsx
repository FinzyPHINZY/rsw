import type { Match } from "@/lib/sports/types";
import { getSportsProvider } from "@/lib/sports";
import { findLeague } from "@/lib/sports/leagues";
import { LeagueSelector } from "@/components/sports/LeagueSelector";
import { MatchList } from "@/components/sports/MatchList";

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Live Scores",
  description: "Live football scores, fixtures, and results.",
  alternates: { canonical: `${SITE_URL}/scores` },
};

export const dynamic = "force-dynamic";

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const sp = await searchParams;
  const leagueSlug = findLeague(sp.league ?? "") ? sp.league : undefined;

  let groups: { live: Match[]; upcoming: Match[]; finished: Match[] } | null = null;
  try {
    const provider = getSportsProvider();
    const [live, upcoming, finished] = await Promise.all([
      provider.getMatches({ leagueSlug, status: "live" }),
      provider.getMatches({ leagueSlug, status: "upcoming" }),
      provider.getMatches({ leagueSlug, status: "finished" }),
    ]);
    groups = { live, upcoming, finished };
  } catch {
    groups = null;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Live Scores</h1>
      <LeagueSelector basePath="/scores" active={leagueSlug ?? ""} />
      {groups === null ? (
        <p className="text-sm text-gray-400">Scores unavailable right now.</p>
      ) : (
        <>
          <MatchList title="Live" matches={groups.live} />
          <MatchList title="Upcoming" matches={groups.upcoming} />
          <MatchList title="Results" matches={groups.finished} />
        </>
      )}
    </main>
  );
}
