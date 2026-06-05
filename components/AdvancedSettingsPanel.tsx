"use client";
import React from "react";
import { TEAM_FLAGS } from "../lib/bracketData";

interface AdvancedSettingsPanelProps {
  chaosFactor: number;
  setChaosFactor: (v: number) => void;
  boostTeam: string;
  setBoostTeam: (v: string) => void;
  boostAmount: number;
  setBoostAmount: (v: number) => void;
}

const SORTED_TEAM_NAMES = Object.keys(TEAM_FLAGS).sort();

export const AdvancedSettingsPanel: React.FC<AdvancedSettingsPanelProps> = ({
  chaosFactor,
  setChaosFactor,
  boostTeam,
  setBoostTeam,
  boostAmount,
  setBoostAmount,
}) => {
  const isModified = chaosFactor > 0 || boostTeam !== "" || boostAmount > 0;

  const handleReset = () => {
    setChaosFactor(0);
    setBoostTeam("");
    setBoostAmount(0);
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-6 animate-slide-down">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chaos Factor */}
        <div className="space-y-3 p-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-neutral-600 dark:text-neutral-350 tracking-widest uppercase flex items-center gap-1.5">
              <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              Chaos Factor
            </label>
            <span className="text-xs font-mono text-violet-500 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
              {Math.round(chaosFactor * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0" max="1" step="0.05"
            value={chaosFactor}
            onChange={(e) => setChaosFactor(parseFloat(e.target.value))}
            className="w-full accent-violet-500 cursor-pointer h-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 appearance-none"
          />
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
            Introduces upsets — higher values increase likelihood of weaker teams winning unexpectedly.
          </p>
        </div>

        {/* Boost Team */}
        <div className="space-y-3 p-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <label className="text-xs font-bold text-neutral-600 dark:text-neutral-350 tracking-widest uppercase flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Favor a Team
          </label>
          <select
            value={boostTeam}
            onChange={(e) => setBoostTeam(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-violet-500 focus:outline-none cursor-pointer transition-colors rounded"
          >
            <option value="">No boost — pure data</option>
            {SORTED_TEAM_NAMES.map((name) => (
              <option key={name} value={name} className="bg-white dark:bg-neutral-900">{name}</option>
            ))}
          </select>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
            Simulate home advantage, fan pressure, or personal bias for one team.
          </p>
        </div>

        {/* Boost Strength */}
        <div className="space-y-3 p-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-neutral-600 dark:text-neutral-350 tracking-widest uppercase flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Boost Strength
            </label>
            <span className="text-xs font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              +{boostAmount} ELO
            </span>
          </div>
          <input
            type="range"
            min="0" max="500" step="25"
            value={boostAmount}
            disabled={boostTeam === ""}
            onChange={(e) => setBoostAmount(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed h-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 appearance-none"
          />
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
            How much ELO advantage the favored team receives throughout the tournament.
          </p>
        </div>
      </div>

      {isModified && (
        <div className="flex justify-end border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-1">
          <button
            onClick={handleReset}
            className="text-xs text-red-500 hover:text-red-400 hover:bg-red-500/5 px-3.5 py-2 transition-all font-bold cursor-pointer border border-red-500/20 hover:border-red-500/40 rounded flex items-center gap-1.5 bg-transparent"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.706 7H18.5" />
            </svg>
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
};
