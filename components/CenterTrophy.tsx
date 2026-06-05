import React from "react";
import { TEAM_FLAGS } from "../lib/bracketData";

interface CenterTrophyProps {
  semi: string[];
  finalWinner: string;
  onPickWinner?: (team: string) => void;
}

const TrophyIcon: React.FC = () => (
  <svg
    className="w-14 h-14 sm:w-20 sm:h-20 text-yellow-500 drop-shadow-lg"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ filter: "drop-shadow(0 0 16px rgba(234,179,8,0.4))" }}
  >
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
  </svg>
);

/** Clickable finalist row inside the Grand Final card */
const FinalistRow: React.FC<{
  team: string;
  isChamp: boolean;
  onPickWinner?: (team: string) => void;
}> = ({ team, isChamp, onPickWinner }) => {
  const flag = team ? TEAM_FLAGS[team] : null;
  const isClickable = !!onPickWinner && !!team;

  return (
    <div
      onClick={isClickable ? () => onPickWinner!(team) : undefined}
      role={isClickable ? "button" : undefined}
      title={isClickable ? `Pick ${team} as champion` : undefined}
      className={`flex items-center gap-2 p-2 rounded transition-all duration-200 ${
        isChamp
          ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40"
          : isClickable
          ? "bg-neutral-50 dark:bg-neutral-800 cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border hover:border-sky-400/50"
          : "bg-neutral-50 dark:bg-neutral-800"
      }`}
    >
      {flag
        ? <img src={flag} alt={team} crossOrigin="anonymous" className="w-6 h-4 object-cover rounded-sm" />
        : <div className="w-6 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-sm" />
      }
      <span className={`text-xs font-semibold truncate ${
        isChamp ? "text-yellow-700 dark:text-yellow-300" : "text-neutral-700 dark:text-neutral-300"
      }`}>
        {team || "TBD"}
      </span>
      {isChamp && (
        <svg className="ml-auto w-3.5 h-3.5 text-yellow-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
        </svg>
      )}
    </div>
  );
};

/** Center trophy, champion card, and clickable Grand Final section */
export const CenterTrophy: React.FC<CenterTrophyProps> = ({ semi, finalWinner, onPickWinner }) => (
  <div className="flex flex-col items-center justify-center px-4 sm:px-6 flex-shrink-0 gap-4">
    <div className="flex flex-col items-center gap-1">
      <TrophyIcon />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">Champion</span>
    </div>

    {/* Champion display card */}
    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-[2px] rounded-lg shadow-2xl shadow-yellow-500/20">
      <div className="bg-white dark:bg-neutral-950 px-5 py-3 rounded-[7px] flex items-center gap-3 min-w-[140px] justify-center">
        {finalWinner && TEAM_FLAGS[finalWinner]
          ? <img src={TEAM_FLAGS[finalWinner]} alt={finalWinner} crossOrigin="anonymous" className="w-9 h-6 object-cover rounded-sm shadow-sm" />
          : <div className="w-9 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-sm" />
        }
        <span className="font-black text-base sm:text-lg text-neutral-900 dark:text-white tracking-wide truncate max-w-[110px]">
          {finalWinner || "TBD"}
        </span>
      </div>
    </div>

    {/* Grand Final — each finalist is clickable */}
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 w-44 sm:w-52 shadow-lg">
      <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 text-center mb-2">
        Grand Final
      </div>
      <FinalistRow team={semi[0] ?? ""} isChamp={finalWinner === semi[0]} onPickWinner={onPickWinner} />
      <div className="text-center text-[10px] text-neutral-400 dark:text-neutral-600 font-bold my-1.5">VS</div>
      <FinalistRow team={semi[1] ?? ""} isChamp={finalWinner === semi[1]} onPickWinner={onPickWinner} />
    </div>
  </div>
);
