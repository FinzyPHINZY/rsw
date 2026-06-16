import type { SportsProvider } from "@/lib/sports/provider";
import type { Standing, Match, MatchQuery, Team } from "@/lib/sports/types";

function team(name: string): Team {
  return { name };
}

function row(
  rank: number,
  name: string,
  played: number,
  win: number,
  draw: number,
  loss: number,
  gf: number,
  ga: number
): Standing {
  return {
    rank,
    team: team(name),
    played,
    win,
    draw,
    loss,
    goalsFor: gf,
    goalsAgainst: ga,
    goalDiff: gf - ga,
    points: win * 3 + draw,
  };
}

const STANDINGS: Record<string, Standing[]> = {
  "premier-league": [
    row(1, "Arsenal", 28, 20, 5, 3, 62, 24),
    row(2, "Manchester City", 28, 19, 6, 3, 65, 30),
    row(3, "Liverpool", 28, 18, 7, 3, 60, 28),
    row(4, "Aston Villa", 28, 16, 6, 6, 55, 38),
    row(5, "Tottenham", 28, 15, 5, 8, 52, 42),
    row(6, "Chelsea", 28, 13, 7, 8, 48, 40),
  ],
  "la-liga": [
    row(1, "Real Madrid", 28, 21, 5, 2, 60, 18),
    row(2, "Barcelona", 28, 19, 5, 4, 58, 30),
    row(3, "Girona", 28, 18, 5, 5, 56, 36),
    row(4, "Atletico Madrid", 28, 16, 6, 6, 50, 32),
    row(5, "Athletic Club", 28, 14, 8, 6, 45, 30),
    row(6, "Real Sociedad", 28, 12, 9, 7, 40, 33),
  ],
  "champions-league": [
    row(1, "Bayern Munich", 6, 5, 1, 0, 16, 6),
    row(2, "Real Madrid", 6, 4, 1, 1, 14, 8),
    row(3, "PSG", 6, 3, 2, 1, 12, 9),
    row(4, "Inter", 6, 3, 1, 2, 10, 8),
  ],
  npfl: [
    row(1, "Enyimba", 24, 14, 6, 4, 34, 18),
    row(2, "Rivers United", 24, 13, 7, 4, 30, 17),
    row(3, "Remo Stars", 24, 12, 7, 5, 28, 19),
    row(4, "Kano Pillars", 24, 11, 8, 5, 25, 18),
  ],
};

const NOW = Date.UTC(2026, 5, 15, 15, 0, 0);

const MATCHES: Match[] = [
  { id: "m1", leagueSlug: "premier-league", home: team("Arsenal"), away: team("Chelsea"), homeScore: 2, awayScore: 1, status: "LIVE", minute: 74, kickoff: new Date(NOW - 74 * 60000).toISOString() },
  { id: "m2", leagueSlug: "la-liga", home: team("Barcelona"), away: team("Girona"), homeScore: 1, awayScore: 1, status: "LIVE", minute: 58, kickoff: new Date(NOW - 58 * 60000).toISOString() },
  { id: "m3", leagueSlug: "premier-league", home: team("Liverpool"), away: team("Aston Villa"), homeScore: null, awayScore: null, status: "SCHEDULED", minute: null, kickoff: new Date(NOW + 2 * 3600000).toISOString() },
  { id: "m4", leagueSlug: "champions-league", home: team("Real Madrid"), away: team("Bayern Munich"), homeScore: null, awayScore: null, status: "SCHEDULED", minute: null, kickoff: new Date(NOW + 26 * 3600000).toISOString() },
  { id: "m5", leagueSlug: "premier-league", home: team("Manchester City"), away: team("Tottenham"), homeScore: 3, awayScore: 0, status: "FINISHED", minute: null, kickoff: new Date(NOW - 26 * 3600000).toISOString() },
  { id: "m6", leagueSlug: "la-liga", home: team("Real Madrid"), away: team("Atletico Madrid"), homeScore: 2, awayScore: 2, status: "FINISHED", minute: null, kickoff: new Date(NOW - 50 * 3600000).toISOString() },
];

const STATUS_MAP = { live: "LIVE", upcoming: "SCHEDULED", finished: "FINISHED" } as const;

export class FixtureSportsProvider implements SportsProvider {
  async getStandings(leagueSlug: string): Promise<Standing[]> {
    return STANDINGS[leagueSlug] ?? [];
  }

  async getMatches(opts: MatchQuery): Promise<Match[]> {
    const wanted = STATUS_MAP[opts.status];
    return MATCHES.filter(
      (m) => m.status === wanted && (!opts.leagueSlug || m.leagueSlug === opts.leagueSlug)
    );
  }
}
