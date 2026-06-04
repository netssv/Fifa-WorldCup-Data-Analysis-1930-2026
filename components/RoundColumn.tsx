import React from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
import { Round, ROUND_LIMITS } from "../lib/bracketLogic";

interface RoundColumnProps {
  round: Exclude<Round, 'groups'>;
  roundTitle: string;
  previousRoundTeams: string[]; // Teams selected in the previous round
  selectedTeams: string[] | string; // Selected teams in this round
  onToggleTeam: (teamName: string) => void;
}

export const RoundColumn: React.FC<RoundColumnProps> = ({
  round,
  roundTitle,
  previousRoundTeams = [],
  selectedTeams = [],
  onToggleTeam
}) => {
  const limit = ROUND_LIMITS[round];
  
  // Normalize string/array selectedTeams
  const selections = typeof selectedTeams === "string" 
    ? (selectedTeams ? [selectedTeams] : []) 
    : selectedTeams;

  const isSelected = (team: string) => selections.includes(team);
  const reachedLimit = selections.length >= limit;

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-none p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {roundTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Select the teams advancing to the next stage.
          </p>
        </div>
        <span className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 font-semibold px-3.5 py-1.5 rounded-none text-sm">
          {selections.length} / {limit} slots filled
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {previousRoundTeams.map(team => {
          const selected = isSelected(team);
          const disabled = !selected && reachedLimit;
          return (
            <button
              key={team}
              onClick={() => onToggleTeam(team)}
              disabled={disabled}
              className={`flex items-center justify-between p-3.5 rounded-none border text-left font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                selected
                  ? "bg-green-600 border-green-600 text-white shadow-sm shadow-green-600/20"
                  : disabled
                  ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-300 dark:text-slate-700 cursor-not-allowed hover:scale-100"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2.5 overflow-hidden">
                <span className="truncate text-sm">{team}</span>
              </span>
              {selected && (
                <svg
                  className="w-4 h-4 text-white shrink-0 ml-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      
      {previousRoundTeams.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-slate-850 rounded-none">
          <p className="text-slate-400 dark:text-slate-600 text-sm">
            Please complete selections in the previous round to unlock this stage.
          </p>
        </div>
      )}
    </div>
  );
};
