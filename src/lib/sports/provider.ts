import type { Standing, Match, MatchQuery } from "@/lib/sports/types";

export interface SportsProvider {
  getStandings(leagueSlug: string): Promise<Standing[]>;
  getMatches(opts: MatchQuery): Promise<Match[]>;
}
