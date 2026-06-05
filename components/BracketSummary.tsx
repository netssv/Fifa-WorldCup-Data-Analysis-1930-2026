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
    return (
      <div className="flex items-center gap-2 p-1.5 rounded bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors">
        <span className="truncate">{team}</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-none p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
            Predictions Summary
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Full overview of your predicted tournament path.
          </p>
        </div>
        <div className="bg-neutral-900 dark:bg-neutral-850 text-white rounded-none px-5 py-3 text-right">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">
            Max Potential Points
          </span>
          <span className="text-3xl font-extrabold text-green-400">
            {maxPoints} <span className="text-lg font-normal text-neutral-300">/ 138</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto">
        {/* Column 1: Groups stage */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-100 dark:border-neutral-800">
            Groups ({groupTeams.length})
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {groupTeams.map((t) => <React.Fragment key={t}>{renderTeamItem(t)}</React.Fragment>)}
            {groupTeams.length === 0 && (
              <p className="text-xs text-neutral-400 italic">No selections</p>
            )}
          </div>
        </div>

        {/* Column 2: R32 */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-100 dark:border-neutral-800">
            Round of 32 ({state.r32.length})
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {state.r32.map((t) => <React.Fragment key={t}>{renderTeamItem(t)}</React.Fragment>)}
            {state.r32.length === 0 && (
              <p className="text-xs text-neutral-400 italic">No selections</p>
            )}
          </div>
        </div>

        {/* Column 3: R16 */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-100 dark:border-neutral-800">
            Round of 16 ({state.r16.length})
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {state.r16.map((t) => <React.Fragment key={t}>{renderTeamItem(t)}</React.Fragment>)}
            {state.r16.length === 0 && (
              <p className="text-xs text-neutral-400 italic">No selections</p>
            )}
          </div>
        </div>

        {/* Column 4: R8 */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-100 dark:border-neutral-800">
            Quarterfinals ({state.r8.length})
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {state.r8.map((t) => <React.Fragment key={t}>{renderTeamItem(t)}</React.Fragment>)}
            {state.r8.length === 0 && (
              <p className="text-xs text-neutral-400 italic">No selections</p>
            )}
          </div>
        </div>

        {/* Column 5: Semis */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-100 dark:border-neutral-800">
            Semifinals ({state.semi.length})
          </h3>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {state.semi.map((t) => <React.Fragment key={t}>{renderTeamItem(t)}</React.Fragment>)}
            {state.semi.length === 0 && (
              <p className="text-xs text-neutral-400 italic">No selections</p>
            )}
          </div>
        </div>

        {/* Column 6: Final */}
        <div className="space-y-3 min-w-[140px]">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-100 dark:border-neutral-800">
            Champion (1)
          </h3>
          <div className="space-y-1.5 pr-1">
            {state.final ? (
              renderTeamItem(state.final)
            ) : (
              <p className="text-xs text-neutral-400 italic">No winner</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
