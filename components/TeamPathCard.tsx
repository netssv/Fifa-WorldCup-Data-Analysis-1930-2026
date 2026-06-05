import React, { useState } from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
import { fetchTeamPath, TeamPathPrediction } from "../lib/apiClient";

const SORTED_TEAMS = Object.keys(TEAM_FLAGS).sort();

const PATH_LABELS: { key: keyof TeamPathPrediction["path"]; label: string }[] = [
  { key: "qualify_from_group", label: "Qualify from Group" },
  { key: "reach_r16", label: "Reach Round of 16" },
  { key: "reach_quarterfinals", label: "Reach Quarterfinals" },
  { key: "reach_semifinals", label: "Reach Semifinals" },
  { key: "reach_final", label: "Reach Final" },
  { key: "win_tournament", label: "Win Tournament" },
];

export const TeamPathCard: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState("Brazil");
  const [loading, setLoading] = useState(false);
  const [pathData, setPathData] = useState<TeamPathPrediction | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await fetchTeamPath(selectedTeam);
      setPathData(data);
    } catch {
      setError("Failed to analyze team path. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-none p-6 shadow-sm">
      <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-1">
        Tournament Path Probability
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
        Calculate the cumulative probability of a team reaching each round of the tournament.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
            Select Team
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-none px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            {SORTED_TEAMS.map((team) => (
              <option key={team} value={team}>
                {TEAM_FLAGS[team]} {team}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 dark:hover:bg-neutral-600 text-white font-semibold py-3 px-6 rounded-none text-sm transition duration-150 disabled:opacity-50 cursor-pointer active:scale-95"
        >
          {loading ? "Analyzing..." : "Analyze Path"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm font-medium mt-3">{error}</p>
      )}

      {pathData && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-2xl">{TEAM_FLAGS[pathData.team]}</span>
            <div>
              <span className="font-bold text-neutral-800 dark:text-white">{pathData.team}</span>
              <span className="text-xs text-neutral-400 block">
                {pathData.group} | ELO {pathData.elo} | Form {(pathData.form * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {PATH_LABELS.map(({ key, label }) => {
            const probability = pathData.path[key];
            const percentage = probability * 100;

            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
                  <span className="font-bold text-neutral-800 dark:text-white">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-none overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500 rounded-none"
                    style={{ width: `${Math.max(percentage, 1)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
