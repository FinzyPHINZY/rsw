import { describe, it, expect } from "vitest";
import { CachingSportsProvider } from "@/lib/sports/caching-provider";
import type { SportsProvider } from "@/lib/sports/provider";
import type { Standing, Match, MatchQuery } from "@/lib/sports/types";

class CountingProvider implements SportsProvider {
  standingsCalls = 0;
  matchCalls = 0;
  async getStandings(_slug: string): Promise<Standing[]> {
    this.standingsCalls++;
    return [];
  }
  async getMatches(_opts: MatchQuery): Promise<Match[]> {
    this.matchCalls++;
    return [];
  }
}

describe("CachingSportsProvider", () => {
  it("serves standings from cache within the 15m TTL, refetches after", async () => {
    const inner = new CountingProvider();
    let now = 0;
    const cached = new CachingSportsProvider(inner, () => now);

    await cached.getStandings("premier-league");
    await cached.getStandings("premier-league");
    expect(inner.standingsCalls).toBe(1);

    now += 15 * 60 * 1000 + 1;
    await cached.getStandings("premier-league");
    expect(inner.standingsCalls).toBe(2);
  });

  it("caches per league key", async () => {
    const inner = new CountingProvider();
    const cached = new CachingSportsProvider(inner, () => 0);
    await cached.getStandings("premier-league");
    await cached.getStandings("la-liga");
    expect(inner.standingsCalls).toBe(2);
  });

  it("uses a 30s TTL for live matches and 5m for others", async () => {
    const inner = new CountingProvider();
    let now = 0;
    const cached = new CachingSportsProvider(inner, () => now);

    await cached.getMatches({ status: "live" });
    now += 31 * 1000;
    await cached.getMatches({ status: "live" });
    expect(inner.matchCalls).toBe(2);

    await cached.getMatches({ status: "upcoming" });
    now += 31 * 1000;
    await cached.getMatches({ status: "upcoming" });
    expect(inner.matchCalls).toBe(3);
  });
});
