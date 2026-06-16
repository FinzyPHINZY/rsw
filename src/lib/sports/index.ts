import type { SportsProvider } from "@/lib/sports/provider";
import { FixtureSportsProvider } from "@/lib/sports/fixture-provider";
import { ApiFootballProvider } from "@/lib/sports/api-football-provider";
import { CachingSportsProvider } from "@/lib/sports/caching-provider";

let cached: SportsProvider | undefined;

export function getSportsProvider(): SportsProvider {
  if (cached) return cached;
  const key = process.env.API_FOOTBALL_KEY;
  cached = key
    ? new CachingSportsProvider(new ApiFootballProvider(key))
    : new FixtureSportsProvider();
  return cached;
}

export type { SportsProvider };
