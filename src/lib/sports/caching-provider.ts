import type { SportsProvider } from "@/lib/sports/provider";
import type { Standing, Match, MatchQuery } from "@/lib/sports/types";

const STANDINGS_TTL = 15 * 60 * 1000;
const LIVE_TTL = 30 * 1000;
const MATCHES_TTL = 5 * 60 * 1000;

type Entry = { value: unknown; expires: number };

export class CachingSportsProvider implements SportsProvider {
  private cache = new Map<string, Entry>();

  constructor(
    private inner: SportsProvider,
    private now: () => number = () => Date.now()
  ) {}

  private async memo<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && this.now() < hit.expires) {
      return hit.value as T;
    }
    const value = await fetcher();
    this.cache.set(key, { value, expires: this.now() + ttl });
    return value;
  }

  getStandings(leagueSlug: string): Promise<Standing[]> {
    return this.memo(`standings:${leagueSlug}`, STANDINGS_TTL, () =>
      this.inner.getStandings(leagueSlug)
    );
  }

  getMatches(opts: MatchQuery): Promise<Match[]> {
    const ttl = opts.status === "live" ? LIVE_TTL : MATCHES_TTL;
    const key = `matches:${opts.status}:${opts.leagueSlug ?? "all"}`;
    return this.memo(key, ttl, () => this.inner.getMatches(opts));
  }
}
