import type { SportsProvider } from "@/lib/sports/provider";
import type { Standing, Match, MatchStatus, MatchQuery } from "@/lib/sports/types";
import { findLeague } from "@/lib/sports/leagues";

const BASE = "https://v3.football.api-sports.io";

// ---- pure transforms (unit-tested) ----

type RawStanding = {
  rank: number;
  team: { name: string; logo?: string };
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  goalsDiff: number;
  points: number;
};

export function toStanding(raw: RawStanding): Standing {
  return {
    rank: raw.rank,
    team: { name: raw.team.name, crest: raw.team.logo },
    played: raw.all.played,
    win: raw.all.win,
    draw: raw.all.draw,
    loss: raw.all.lose,
    goalsFor: raw.all.goals.for,
    goalsAgainst: raw.all.goals.against,
    goalDiff: raw.goalsDiff,
    points: raw.points,
  };
}

type RawFixture = {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null } };
  teams: { home: { name: string; logo?: string }; away: { name: string; logo?: string } };
  goals: { home: number | null; away: number | null };
};

const LIVE_CODES = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE"]);
const FINISHED_CODES = new Set(["FT", "AET", "PEN"]);

function mapStatus(short: string): MatchStatus {
  if (LIVE_CODES.has(short)) return "LIVE";
  if (FINISHED_CODES.has(short)) return "FINISHED";
  return "SCHEDULED";
}

export function toMatch(raw: RawFixture, leagueSlug: string): Match {
  const status = mapStatus(raw.fixture.status.short);
  return {
    id: String(raw.fixture.id),
    leagueSlug,
    home: { name: raw.teams.home.name, crest: raw.teams.home.logo },
    away: { name: raw.teams.away.name, crest: raw.teams.away.logo },
    homeScore: raw.goals.home,
    awayScore: raw.goals.away,
    status,
    minute: status === "LIVE" ? raw.fixture.status.elapsed : null,
    kickoff: raw.fixture.date,
  };
}

// ---- provider ----

export class ApiFootballProvider implements SportsProvider {
  constructor(private apiKey: string) {}

  private async get(path: string): Promise<{ response: unknown[] }> {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "x-apisports-key": this.apiKey },
    });
    if (!res.ok) throw new Error(`API-Football ${res.status}`);
    return res.json();
  }

  async getStandings(leagueSlug: string): Promise<Standing[]> {
    const league = findLeague(leagueSlug);
    if (!league) return [];
    const season = new Date().getUTCFullYear();
    const data = await this.get(`/standings?league=${league.apiId}&season=${season}`);
    const first = data.response[0] as { league?: { standings?: RawStanding[][] } } | undefined;
    const rows = first?.league?.standings?.[0] ?? [];
    return rows.map(toStanding);
  }

  async getMatches(opts: MatchQuery): Promise<Match[]> {
    const league = opts.leagueSlug ? findLeague(opts.leagueSlug) : undefined;
    const leagueParam = league ? `&league=${league.apiId}` : "";
    const query =
      opts.status === "live"
        ? `/fixtures?live=all${leagueParam}`
        : opts.status === "upcoming"
          ? `/fixtures?next=20${leagueParam}`
          : `/fixtures?last=20${leagueParam}`;
    const data = await this.get(query);
    const slug = opts.leagueSlug ?? "";
    return (data.response as RawFixture[]).map((r) => toMatch(r, slug));
  }
}
