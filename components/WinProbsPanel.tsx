"use client";
import React, { useState } from "react";
import { TEAM_FLAGS } from "../lib/bracketData";

interface WinProbsPanelProps {
  winProbs: Record<string, number>;
  simRunsTotal: number;
}

const RankBadge: React.FC<{ idx: number }> = ({ idx }) => {
  const style =
    idx === 0 ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300"
    : idx === 1 ? "bg-neutral-200 dark:bg-neutral-600/30 text-neutral-500 dark:text-neutral-400"
    : idx === 2 ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
    : "text-neutral-400 dark:text-neutral-600";
  return (
    <span className={`inline-flex w-6 h-6 items-center justify-center font-bold text-[11px] ${style}`}>
      {idx + 1}
    </span>
  );
};

export const WinProbsPanel: React.FC<WinProbsPanelProps> = ({ winProbs, simRunsTotal }) => {
  const [showAll, setShowAll] = useState(false);

  const sorted = Object.entries(winProbs).sort((a, b) => b[1] - a[1]);
  const topTeams = sorted.filter(([, p]) => p > 0);
  const displayList = showAll ? topTeams : topTeams.slice(0, 10);

  const topTeam = sorted[0]?.[0] ?? "";
  const topProb = sorted[0]?.[1] ?? 0;
  const topWins = Math.round(topProb * simRunsTotal);
  const isMultiRun = simRunsTotal > 1;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            Tournament Simulation Results
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {isMultiRun
              ? `${simRunsTotal} simulations — championship wins per country`
              : "Single simulation — predicted winner"}
          </p>
        </div>

        {/* Most likely champion — fixed: render flag as img, not URL text */}
        {isMultiRun && topTeam && (
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 block">
              Most Likely Champion
            </span>
            <span className="text-sm font-extrabold text-emerald-500 dark:text-emerald-400 flex items-center justify-end gap-2 mt-0.5">
              {TEAM_FLAGS[topTeam] && (
                <img src={TEAM_FLAGS[topTeam]} alt={topTeam} className="w-5 h-3.5 object-cover shadow-sm" />
              )}
              {topTeam}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 block">
              {topWins} wins ({(topProb * 100).toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Rank</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Country</th>
              {isMultiRun && (
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Wins</th>
              )}
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                {isMultiRun ? "Win Rate" : "Probability"}
              </th>
              <th className="px-4 py-2.5 w-40 hidden sm:table-cell" />
            </tr>
          </thead>
          <tbody>
            {displayList.map(([team, prob], idx) => {
              const wins = Math.round(prob * simRunsTotal);
              const pct = (prob * 100).toFixed(1);
              const isTop = idx === 0;
              const barPct = Math.min(100, (prob / (sorted[0]?.[1] || 1)) * 100);
              return (
                <tr
                  key={team}
                  className={`border-b border-neutral-100 dark:border-neutral-800/50 transition-colors ${
                    isTop
                      ? "bg-emerald-50 dark:bg-emerald-950/25 hover:bg-emerald-100 dark:hover:bg-emerald-950/40"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                  }`}
                >
                  <td className="px-4 py-3 text-xs font-mono"><RankBadge idx={idx} /></td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      {TEAM_FLAGS[team] && (
                        <img src={TEAM_FLAGS[team]} alt={team} className="w-4 h-3 object-cover shadow-sm" />
                      )}
                      <span className={`font-semibold ${isTop ? "text-emerald-600 dark:text-emerald-300" : "text-neutral-800 dark:text-neutral-200"}`}>
                        {team}
                      </span>
                    </span>
                  </td>

                  {isMultiRun && (
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                        {wins}
                        <span className="text-neutral-400 dark:text-neutral-600 font-normal">/{simRunsTotal}</span>
                      </span>
                    </td>
                  )}

                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-mono font-bold ${
                      prob > 0.15 ? "text-emerald-500 dark:text-emerald-400"
                      : prob > 0.05 ? "text-sky-500 dark:text-sky-400"
                      : "text-neutral-400"
                    }`}>{pct}%</span>
                  </td>

                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${
                          isTop ? "bg-emerald-500" : prob > 0.05 ? "bg-sky-500" : "bg-neutral-400"
                        }`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {topTeams.length > 10 && (
        <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-white font-semibold transition-colors cursor-pointer"
          >
            {showAll ? "Show Top 10 only" : `Show all ${topTeams.length} teams`}
          </button>
        </div>
      )}
    </div>
  );
};
