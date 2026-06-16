export type LeagueConfig = { slug: string; name: string; country: string; apiId: number };

export const LEAGUES: LeagueConfig[] = [
  { slug: "premier-league", name: "Premier League", country: "England", apiId: 39 },
  { slug: "la-liga", name: "La Liga", country: "Spain", apiId: 140 },
  { slug: "champions-league", name: "Champions League", country: "Europe", apiId: 2 },
  { slug: "npfl", name: "NPFL", country: "Nigeria", apiId: 399 },
];

export const DEFAULT_LEAGUE = "premier-league";

export function findLeague(slug: string): LeagueConfig | undefined {
  return LEAGUES.find((l) => l.slug === slug);
}
