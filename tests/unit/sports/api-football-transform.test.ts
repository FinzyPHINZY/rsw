import { describe, it, expect } from "vitest";
import { toStanding, toMatch } from "@/lib/sports/api-football-provider";

describe("api-football transforms", () => {
  it("maps a raw standing row to the domain shape", () => {
    const raw = {
      rank: 1,
      team: { name: "Arsenal", logo: "https://x/arsenal.png" },
      all: { played: 28, win: 20, draw: 5, lose: 3, goals: { for: 62, against: 24 } },
      goalsDiff: 38,
      points: 65,
    };
    expect(toStanding(raw)).toEqual({
      rank: 1,
      team: { name: "Arsenal", crest: "https://x/arsenal.png" },
      played: 28,
      win: 20,
      draw: 5,
      loss: 3,
      goalsFor: 62,
      goalsAgainst: 24,
      goalDiff: 38,
      points: 65,
    });
  });

  it("maps a live fixture to a LIVE match with a minute", () => {
    const raw = {
      fixture: { id: 42, date: "2026-06-15T14:00:00+00:00", status: { short: "2H", elapsed: 74 } },
      teams: { home: { name: "Arsenal", logo: "h.png" }, away: { name: "Chelsea", logo: "a.png" } },
      goals: { home: 2, away: 1 },
    };
    const m = toMatch(raw, "premier-league");
    expect(m.id).toBe("42");
    expect(m.status).toBe("LIVE");
    expect(m.minute).toBe(74);
    expect(m.homeScore).toBe(2);
    expect(m.awayScore).toBe(1);
    expect(m.home).toEqual({ name: "Arsenal", crest: "h.png" });
  });

  it("maps scheduled and finished statuses", () => {
    const sched = toMatch({ fixture: { id: 1, date: "2026-06-16T12:00:00+00:00", status: { short: "NS", elapsed: null } }, teams: { home: { name: "A" }, away: { name: "B" } }, goals: { home: null, away: null } }, "la-liga");
    expect(sched.status).toBe("SCHEDULED");
    expect(sched.minute).toBeNull();

    const ft = toMatch({ fixture: { id: 2, date: "2026-06-14T12:00:00+00:00", status: { short: "FT", elapsed: 90 } }, teams: { home: { name: "A" }, away: { name: "B" } }, goals: { home: 3, away: 0 } }, "la-liga");
    expect(ft.status).toBe("FINISHED");
  });
});
