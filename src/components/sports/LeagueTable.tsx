import type { Standing } from "@/lib/sports/types";

export function LeagueTable({ standings }: { standings: Standing[] }) {
  if (standings.length === 0) {
    return <p className="text-sm text-gray-400">No standings available.</p>;
  }
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b text-left text-gray-500">
          <th className="py-2 pr-2">#</th>
          <th>Team</th>
          <th className="px-2 text-center">P</th>
          <th className="hidden px-2 text-center sm:table-cell">W</th>
          <th className="hidden px-2 text-center sm:table-cell">D</th>
          <th className="hidden px-2 text-center sm:table-cell">L</th>
          <th className="px-2 text-center">GD</th>
          <th className="px-2 text-center font-bold">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s) => (
          <tr key={s.rank} className="border-b">
            <td className="py-2 pr-2 text-gray-500">{s.rank}</td>
            <td className="font-medium text-secondary">{s.team.name}</td>
            <td className="px-2 text-center">{s.played}</td>
            <td className="hidden px-2 text-center sm:table-cell">{s.win}</td>
            <td className="hidden px-2 text-center sm:table-cell">{s.draw}</td>
            <td className="hidden px-2 text-center sm:table-cell">{s.loss}</td>
            <td className="px-2 text-center">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
            <td className="px-2 text-center font-bold text-secondary">{s.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
