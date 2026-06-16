export type League = { slug: string; name: string; country: string };
export type Team = { name: string; crest?: string };

export type Standing = {
  rank: number;
  team: Team;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED";

export type Match = {
  id: string;
  leagueSlug: string;
  home: Team;
  away: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute: number | null;
  kickoff: string; // ISO string
};

export type MatchQuery = { leagueSlug?: string; status: "live" | "upcoming" | "finished" };
