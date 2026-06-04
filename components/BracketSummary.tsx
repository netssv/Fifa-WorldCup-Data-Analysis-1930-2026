import React from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
import { BracketState, calculateMaxPoints } from "../lib/bracketLogic";

interface BracketSummaryProps {
  state: BracketState;
}

export const BracketSummary: React.FC<BracketSummaryProps> = ({ state }) => {
  const maxPoints = calculateMaxPoints(state);
  const groupTeams = Object.values(state.groups).flat();

  const renderTeamItem = (team: string) => {
    const flag = TEAM_FLAGS[team] || "🏳️";
    return (
      <div
        key={team}
        className="flex items-center gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
      >
        <span role="img" aria-label={`${team} flag`}>
          {flag}
        </span>
        <span className="truncate">{team}</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Predictions Summary
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Full overview of your predicted tournament path.
          </p>
        </div>
        <div className="bg-slate-900 dark:bg-slate-850 text-white rounded-xl px-5 py-3 text-right">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
            Max Potential Points
          </span>
          <span className="text-3xl font-extrabold text-green-400">
            {maxPoints} <span className="text-lg font-normal text-slate-300">/ 138</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto">
        {/* Column 1: Groups stage */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
            Groups ({groupTeams.length})
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {groupTeams.map(renderTeamItem)}
            {groupTeams.length === 0 && (
              <p className="text-xs text-slate-400 italic">No selections</p>
            )}
          </div>
        </div>

        {/* Column 2: R32 */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
            Round of 32 ({state.r32.length})
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {state.r32.map(renderTeamItem)}
            {state.r32.length === 0 && (
              <p className="text-xs text-slate-400 italic">No selections</p>
            )}
          </div>
        </div>

        {/* Column 3: R16 */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
            Round of 16 ({state.r16.length})
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {state.r16.map(renderTeamItem)}
            {state.r16.length === 0 && (
              <p className="text-xs text-slate-400 italic">No selections</p>
            )}
          </div>
        </div>

        {/* Column 4: R8 */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
            Quarterfinals ({state.r8.length})
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {state.r8.map(renderTeamItem)}
            {state.r8.length === 0 && (
              <p className="text-xs text-slate-400 italic">No selections</p>
            )}
          </div>
        </div>

        {/* Column 5: Semis */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
            Semifinals ({state.semi.length})
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {state.semi.map(renderTeamItem)}
            {state.semi.length === 0 && (
              <p className="text-xs text-slate-400 italic">No selections</p>
            )}
          </div>
        </div>

        {/* Column 6: Final */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
            Champion (1)
          </h3>
          <div className="space-y-1.5 pr-1">
            {state.final ? (
              renderTeamItem(state.final)
            ) : (
              <p className="text-xs text-slate-400 italic">No winner</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
