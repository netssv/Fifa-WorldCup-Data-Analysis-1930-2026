import React from "react";
import { TEAM_FLAGS, TEAM_STATS } from "../lib/bracketData";

interface TeamCompareCardProps {
  teamName: string;
  position: "left" | "right";
}

export const TeamCompareCard: React.FC<TeamCompareCardProps> = ({ teamName, position }) => {
  const stats = TEAM_STATS[teamName] || { elo: 1400, overall: 70.0, valueM: 50 };

  return (
    <div 
      className={`bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800 rounded-none p-5 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:border-green-500/30 dark:hover:border-green-500/20 group relative overflow-hidden ${
        position === "left" ? "animate-slide-in-left" : "animate-slide-in-right"
      }`}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <span className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300 select-none">
        {TEAM_FLAGS[teamName] || "🏳️"}
      </span>
      <h4 className="text-base font-extrabold text-neutral-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 mb-4">
        {teamName}
      </h4>

      <div className="w-full grid grid-cols-3 gap-2.5 text-center text-xs">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 rounded-none py-2 px-1">
          <span className="text-neutral-400 dark:text-neutral-500 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">ELO</span>
          <span className="font-extrabold text-neutral-700 dark:text-neutral-200">{stats.elo}</span>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 rounded-none py-2 px-1">
          <span className="text-neutral-400 dark:text-neutral-500 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">EA FC</span>
          <span className="font-extrabold text-neutral-700 dark:text-neutral-200">{stats.overall.toFixed(0)}</span>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 rounded-none py-2 px-1">
          <span className="text-neutral-400 dark:text-neutral-500 block mb-0.5 uppercase tracking-wider text-[10px] font-bold">VALUE</span>
          <span className="font-extrabold text-neutral-700 dark:text-neutral-200">{stats.valueM}M</span>
        </div>
      </div>
    </div>
  );
};
