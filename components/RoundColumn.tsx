import React from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
import { Round, ROUND_LIMITS, getFriendlyGoalDiffText } from "../lib/bracketLogic";

interface RoundColumnProps {
  round: Exclude<Round, 'groups'>;
  roundTitle: string;
  previousRoundTeams: string[]; // Teams selected in the previous round
  selectedTeams: string[] | string; // Selected teams in this round
  onToggleTeam: (teamName: string) => void;
  winProbs?: Record<string, number> | null;
  teamStats?: Record<
    string,
    { avg_goals_scored: number; avg_goals_conceded: number; avg_goal_diff: number }
  > | null;
}

export const RoundColumn: React.FC<RoundColumnProps> = ({
  round,
  roundTitle,
  previousRoundTeams = [],
  selectedTeams = [],
  onToggleTeam,
  winProbs,
  teamStats
}) => {
  const limit = ROUND_LIMITS[round];
  
  // Normalize string/array selectedTeams
  const selections = typeof selectedTeams === "string" 
    ? (selectedTeams ? [selectedTeams] : []) 
    : selectedTeams;

  const isSelected = (team: string) => selections.includes(team);
  const reachedLimit = selections.length >= limit;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-none p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
            {roundTitle}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
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
          const prob = winProbs && winProbs[team] !== undefined ? winProbs[team] : null;
          const stats = teamStats && teamStats[team] ? teamStats[team] : null;
          return (
            <button
              key={team}
              onClick={() => onToggleTeam(team)}
              disabled={disabled}
              className={`flex items-center justify-between p-3.5 rounded-none border text-left font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 relative overflow-hidden ${
                selected
                  ? "bg-green-600 border-green-600 text-white shadow-sm shadow-green-600/20"
                  : disabled
                  ? "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850 text-neutral-300 dark:text-neutral-700 cursor-not-allowed hover:scale-100"
                  : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-850 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <span className="flex items-center gap-2.5 overflow-hidden">
                {TEAM_FLAGS[team] ? (
                  <img src={TEAM_FLAGS[team]} alt={team} className="w-5 h-3.5 object-cover shadow-sm mr-2" />
                ) : (
                  <span className="mr-2 text-base">🏳️</span>
                )}
                <span className="flex flex-col text-left overflow-hidden">
                  <span className="font-semibold text-sm truncate">{team}</span>
                  {selected && stats && (
                    <span className="text-[9px] text-emerald-100 font-semibold tracking-wide uppercase opacity-90 truncate">
                      {getFriendlyGoalDiffText(stats.avg_goal_diff)}
                    </span>
                  )}
                </span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                {selected && prob !== null && (
                  <span className="text-[9px] bg-black/20 dark:bg-black/30 px-1 py-0.5 rounded-sm font-bold text-white">
                    {(prob * 100).toFixed(0)}%
                  </span>
                )}
                {selected && (
                  <svg
                    className="w-4 h-4 text-white shrink-0"
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
              </div>
              {selected && prob !== null && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10 dark:bg-black/25">
                  <div
                    className="h-full bg-emerald-300 dark:bg-emerald-400 transition-all duration-500"
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {previousRoundTeams.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-neutral-850 rounded-none">
          <p className="text-neutral-400 dark:text-neutral-600 text-sm">
            Please complete selections in the previous round to unlock this stage.
          </p>
        </div>
      )}
    </div>
  );
};
