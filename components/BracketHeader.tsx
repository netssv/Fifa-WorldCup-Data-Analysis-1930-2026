"use client";
import React, { useState, useCallback } from "react";
import { Round } from "../lib/bracketLogic";
import { AdvancedSettingsPanel } from "./AdvancedSettingsPanel";
import { ProgressBar } from "./ProgressBar";
import { SimRunsSelector } from "./SimRunsSelector";
import { HeaderActionButtons } from "./HeaderActionButtons";

interface BracketHeaderProps {
  completedRoundsCount: number;
  aiLoading: boolean;
  onAiAutoFill: (upToRound: Round | "all") => void;
  onSave: () => void;
  onReset: () => void;
  chaosFactor: number;
  setChaosFactor: (v: number) => void;
  boostTeam: string;
  setBoostTeam: (v: string) => void;
  boostAmount: number;
  setBoostAmount: (v: number) => void;
  simRuns: number;
  setSimRuns: (v: number) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const ROUND_OPTIONS: { value: Round | "all"; label: string }[] = [
  { value: "all", label: "Entire Tournament" },
  { value: "groups", label: "Groups Only" },
  { value: "r32", label: "Round of 32" },
  { value: "r16", label: "Round of 16" },
  { value: "r8", label: "Quarterfinals" },
  { value: "semi", label: "Semifinals" },
  { value: "final", label: "Final Winner" },
];

export const BracketHeader: React.FC<BracketHeaderProps> = ({
  completedRoundsCount,
  aiLoading,
  onAiAutoFill,
  onSave,
  onReset,
  chaosFactor,
  setChaosFactor,
  boostTeam,
  setBoostTeam,
  boostAmount,
  setBoostAmount,
  simRuns,
  setSimRuns,
  isDark,
  onToggleTheme,
}) => {
  const [targetRound, setTargetRound] = useState<Round | "all">("all");
  const [showSettings, setShowSettings] = useState(false);

  const hasActiveOverrides =
    chaosFactor > 0 || (boostTeam !== "" && boostAmount > 0) || simRuns > 1;

  const handleToggleSettings = useCallback(
    () => setShowSettings((prev) => !prev),
    []
  );

  return (
    <div className="bg-white dark:bg-neutral-900/95 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden transition-colors duration-300">
      {/* ── Main Controls Bar ── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 px-5 py-4">

        <ProgressBar
          completedRoundsCount={completedRoundsCount}
          hasActiveOverrides={hasActiveOverrides}
        />

        {/* Right: Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">

          {/* Round Scope Selector */}
          <select
            value={targetRound}
            onChange={(e) => setTargetRound(e.target.value as Round | "all")}
            disabled={aiLoading}
            className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer text-neutral-700 dark:text-neutral-200 transition-colors hover:border-neutral-400 dark:hover:border-neutral-600"
          >
            {ROUND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-neutral-900">
                {opt.label}
              </option>
            ))}
          </select>

          <SimRunsSelector
            simRuns={simRuns}
            setSimRuns={setSimRuns}
            aiLoading={aiLoading}
          />

          {/* Simulate Button */}
          <button
            onClick={() => onAiAutoFill(targetRound)}
            disabled={aiLoading}
            className="relative bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 px-5 transition-all duration-200 text-xs flex items-center gap-2 cursor-pointer active:scale-95 hover:shadow-lg hover:shadow-emerald-600/25 group overflow-hidden"
            title="Simulate Tournament with AI"
          >
            <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            {aiLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Simulating…</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span>Simulate</span>
              </>
            )}
          </button>

          <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

          <HeaderActionButtons
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            showSettings={showSettings}
            hasActiveOverrides={hasActiveOverrides}
            onToggleSettings={handleToggleSettings}
            onSave={onSave}
            onReset={onReset}
          />
        </div>
      </div>

      {/* ── Advanced Settings Panel ── */}
      {showSettings && (
        <AdvancedSettingsPanel
          chaosFactor={chaosFactor}
          setChaosFactor={setChaosFactor}
          boostTeam={boostTeam}
          setBoostTeam={setBoostTeam}
          boostAmount={boostAmount}
          setBoostAmount={setBoostAmount}
        />
      )}
    </div>
  );
};
