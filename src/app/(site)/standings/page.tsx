import type { Standing } from "@/lib/sports/types";
import { getSportsProvider } from "@/lib/sports";
import { DEFAULT_LEAGUE, findLeague } from "@/lib/sports/leagues";
import { LeagueSelector } from "@/components/sports/LeagueSelector";
import { LeagueTable } from "@/components/sports/LeagueTable";

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Standings",
  description: "League tables and standings for top football competitions.",
  alternates: { canonical: `${SITE_URL}/standings` },
};

export const dynamic = "force-dynamic";

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const sp = await searchParams;
  const slug = findLeague(sp.league ?? "") ? sp.league! : DEFAULT_LEAGUE;
  const league = findLeague(slug)!;

  let standings: Standing[] | null = null;
  try {
    standings = await getSportsProvider().getStandings(slug);
  } catch {
    standings = null;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">{league.name} Table</h1>
      <LeagueSelector basePath="/standings" active={slug} />
      {standings === null ? (
        <p className="text-sm text-gray-400">Standings unavailable right now.</p>
      ) : (
        <LeagueTable standings={standings} />
      )}
    </main>
  );
}
