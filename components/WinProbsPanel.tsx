"use client";

import React, { useState } from "react";
import { TEAM_FLAGS } from "../lib/bracketData";

interface WinProbsPanelProps {
  winProbs: Record<string, number>;
  simRunsTotal: number;
}

export const WinProbsPanel: React.FC<WinProbsPanelProps> = ({
  winProbs,
  simRunsTotal,
}) => {
  const [showAll, setShowAll] = useState(false);

  const sorted = Object.entries(winProbs).sort((a, b) => b[1] - a[1]);
  const topTeams = sorted.filter(([, p]) => p > 0);
  const displayList = showAll ? topTeams : topTeams.slice(0, 10);

  const topTeam = sorted[0]?.[0] ?? "";
  const topProb = sorted[0]?.[1] ?? 0;
  const topWins = Math.round(topProb * simRunsTotal);

  const isMultiRun = simRunsTotal > 1;

  return (
    <div className="bg-slate-900 border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Tournament Simulation Results
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isMultiRun
              ? `${simRunsTotal} simulations — championship wins per country`
              : "Single simulation — predicted winner"}
          </p>
        </div>
        {isMultiRun && topTeam && (
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
              Most Likely Champion
            </span>
            <span className="text-sm font-extrabold text-emerald-400">
              {TEAM_FLAGS[topTeam] ? `${TEAM_FLAGS[topTeam]} ` : ""}
              {topTeam}
            </span>
            <span className="text-xs text-slate-400 block">
              {topWins} wins ({(topProb * 100).toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50">
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Rank
              </th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Country
              </th>
              {isMultiRun && (
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Wins
                </th>
              )}
              <th className="text-right px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {isMultiRun ? "Win Rate" : "Probability"}
              </th>
              <th className="px-4 py-2.5 w-40 hidden sm:table-cell"></th>
            </tr>
          </thead>
          <tbody>
            {displayList.map(([team, prob], idx) => {
              const wins = Math.round(prob * simRunsTotal);
              const pct = (prob * 100).toFixed(1);
              const isTop = idx === 0;
              return (
                <tr
                  key={team}
                  className={`border-b border-slate-800/50 transition-colors ${
                    isTop
                      ? "bg-emerald-950/25 hover:bg-emerald-950/40"
                      : "hover:bg-slate-800/30"
                  }`}
                >
                  {/* Rank */}
                  <td className="px-4 py-3 text-xs font-mono">
                    <span
                      className={`inline-flex w-6 h-6 items-center justify-center font-bold text-[11px] ${
                        idx === 0
                          ? "bg-amber-500/20 text-amber-300"
                          : idx === 1
                          ? "bg-slate-600/30 text-slate-400"
                          : idx === 2
                          ? "bg-orange-900/30 text-orange-400"
                          : "text-slate-600"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>

                  {/* Country */}
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      {TEAM_FLAGS[team] && (
                        <span className="text-base leading-none">
                          {TEAM_FLAGS[team]}
                        </span>
                      )}
                      <span
                        className={`font-semibold ${
                          isTop ? "text-emerald-300" : "text-slate-200"
                        }`}
                      >
                        {team}
                      </span>
                    </span>
                  </td>

                  {/* Wins count */}
                  {isMultiRun && (
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {wins}
                        <span className="text-slate-600 font-normal">
                          /{simRunsTotal}
                        </span>
                      </span>
                    </td>
                  )}

                  {/* Win rate */}
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs font-mono font-bold ${
                        prob > 0.15
                          ? "text-emerald-400"
                          : prob > 0.05
                          ? "text-sky-400"
                          : "text-slate-400"
                      }`}
                    >
                      {pct}%
                    </span>
                  </td>

                  {/* Progress bar */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${
                          isTop
                            ? "bg-emerald-500"
                            : prob > 0.05
                            ? "bg-sky-600"
                            : "bg-slate-600"
                        }`}
                        style={{ width: `${Math.min(100, prob * 100 / (sorted[0]?.[1] || 1) * 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show more / less */}
      {topTeams.length > 10 && (
        <div className="px-4 py-3 border-t border-slate-800 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            {showAll
              ? `Show Top 10 only`
              : `Show all ${topTeams.length} teams`}
          </button>
        </div>
      )}
    </div>
  );
};
