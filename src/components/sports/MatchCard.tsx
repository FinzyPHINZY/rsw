import type { Match } from "@/lib/sports/types";

function kickoffTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ match }: { match: Match }) {
  if (match.status === "LIVE") {
    return <span className="rounded bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">{match.minute}&apos;</span>;
  }
  if (match.status === "FINISHED") {
    return <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">FT</span>;
  }
  return <span className="text-xs text-gray-400">{kickoffTime(match.kickoff)}</span>;
}

export function MatchCard({ match }: { match: Match }) {
  const showScore = match.status !== "SCHEDULED";
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
      <div className="flex-1 space-y-1 text-sm font-medium text-secondary">
        <div>{match.home.name}</div>
        <div>{match.away.name}</div>
      </div>
      <div className="flex items-center gap-4">
        {showScore && (
          <div className="space-y-1 text-right text-sm font-bold tabular-nums text-secondary">
            <div>{match.homeScore}</div>
            <div>{match.awayScore}</div>
          </div>
        )}
        <StatusBadge match={match} />
      </div>
    </div>
  );
}
