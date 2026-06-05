"use client";
import React from "react";

interface ProgressBarProps {
  completedRoundsCount: number;
  hasActiveOverrides: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completedRoundsCount,
  hasActiveOverrides,
}) => {
  const progressPct = Math.round((completedRoundsCount / 6) * 100);

  return (
    <div className="flex items-center gap-4 min-w-0">
      <div className="flex flex-col">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Tournament Progress
        </span>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-sm font-bold text-emerald-500">
            {completedRoundsCount}
            <span className="text-neutral-400 font-normal">/6</span>
          </span>
        </div>
      </div>

      {hasActiveOverrides && (
        <span className="text-[10px] bg-amber-500/15 text-amber-400 font-bold px-2.5 py-1 border border-amber-500/25 animate-pulse rounded-full uppercase tracking-wider">
          Custom Strategy
        </span>
      )}
    </div>
  );
};
