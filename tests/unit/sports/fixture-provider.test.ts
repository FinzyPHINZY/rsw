import { describe, it, expect } from "vitest";
import { FixtureSportsProvider } from "@/lib/sports/fixture-provider";

const p = new FixtureSportsProvider();

describe("FixtureSportsProvider", () => {
  it("returns a rank-ordered standings table for a known league", async () => {
    const table = await p.getStandings("premier-league");
    expect(table.length).toBeGreaterThanOrEqual(4);
    const ranks = table.map((s) => s.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(table[0].team.name).toBeTruthy();
    for (const row of table) {
      expect(row.goalDiff).toBe(row.goalsFor - row.goalsAgainst);
      expect(row.played).toBe(row.win + row.draw + row.loss);
    }
  });

  it("returns an empty table for an unknown league", async () => {
    expect(await p.getStandings("nope-league")).toEqual([]);
  });

  it("returns only matches matching the requested status", async () => {
    const live = await p.getMatches({ status: "live" });
    expect(live.length).toBeGreaterThanOrEqual(1);
    expect(live.every((m) => m.status === "LIVE")).toBe(true);
    expect(live.every((m) => typeof m.minute === "number")).toBe(true);

    const upcoming = await p.getMatches({ status: "upcoming" });
    expect(upcoming.every((m) => m.status === "SCHEDULED")).toBe(true);

    const finished = await p.getMatches({ status: "finished" });
    expect(finished.every((m) => m.status === "FINISHED")).toBe(true);
  });

  it("filters matches by league when given", async () => {
    const all = await p.getMatches({ status: "finished" });
    const pl = await p.getMatches({ status: "finished", leagueSlug: "premier-league" });
    expect(pl.every((m) => m.leagueSlug === "premier-league")).toBe(true);
    expect(pl.length).toBeLessThanOrEqual(all.length);
  });
});
