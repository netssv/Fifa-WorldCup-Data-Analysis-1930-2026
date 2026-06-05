"use client";
import React, { useState, useCallback } from "react";
import { Round } from "../lib/bracketLogic";
import { AdvancedSettingsPanel } from "./AdvancedSettingsPanel";
import { ProgressBar } from "./ProgressBar";

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

const PRESET_RUNS = [1, 10, 50, 100, 500, 1000, 5000];

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
  const [customRuns, setCustomRuns] = useState("");
  const [useCustomRuns, setUseCustomRuns] = useState(false);

  const hasActiveOverrides =
    chaosFactor > 0 || (boostTeam !== "" && boostAmount > 0) || simRuns > 1;

  const handleCustomRunsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      setCustomRuns(raw);
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 100000) {
        setSimRuns(parsed);
      }
    },
    [setSimRuns]
  );

  return (
    <div className="bg-white dark:bg-neutral-900/95 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden transition-colors duration-300">
      {/* ── Main Controls Bar ── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 px-5 py-4">
        {/* Left: Progress + Label */}
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

          {/* Sim Runs — Preset or Custom */}
          {useCustomRuns ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                inputMode="numeric"
                value={customRuns}
                onChange={handleCustomRunsChange}
                placeholder="e.g. 2500"
                className="w-24 bg-neutral-100 dark:bg-neutral-800 border border-violet-500/50 text-xs font-semibold px-3 py-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={() => setUseCustomRuns(false)}
                className="text-neutral-400 hover:text-red-400 text-xs px-1 py-2 transition-colors"
                title="Back to presets"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <select
                value={simRuns}
                onChange={(e) => setSimRuns(parseInt(e.target.value, 10))}
                disabled={aiLoading}
                className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer text-neutral-700 dark:text-neutral-200 transition-colors"
              >
                {PRESET_RUNS.map((r) => (
                  <option key={r} value={r} className="bg-white dark:bg-neutral-900">
                    {r === 1 ? "1 Run (Fast)" : `${r.toLocaleString()} Runs`}
                  </option>
                ))}
              </select>
              <button
                onClick={() => { setUseCustomRuns(true); setCustomRuns(String(simRuns)); }}
                className="text-[10px] text-violet-400 hover:text-violet-300 border border-violet-500/30 hover:border-violet-400 px-2 py-2 transition-colors font-bold"
                title="Enter custom number of runs"
              >
                Custom
              </button>
            </div>
          )}

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

          {/* Divider */}
          <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

          {/* Advanced Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 border transition-all duration-200 cursor-pointer relative group ${
              showSettings || hasActiveOverrides
                ? "bg-violet-600/20 border-violet-500/50 text-violet-400 hover:bg-violet-600/30"
                : "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-violet-400 hover:border-violet-500/50"
            }`}
            title="Advanced Simulation Settings"
          >
            <svg className={`h-4 w-4 transition-transform duration-300 ${showSettings ? "rotate-45" : "group-hover:rotate-12"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {hasActiveOverrides && !showSettings && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-amber-400 rounded-full border-2 border-white dark:border-neutral-900" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-650 dark:text-neutral-300 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464-4.95a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm-9.9 9.9a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm8.486-.707a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM4 11a1 1 0 100-2H3a1 1 0 100 2h1zm14-1a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM8.95 4.346a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zm8.486 8.486a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 transition-all duration-150 text-xs cursor-pointer active:scale-95 hover:shadow-md hover:shadow-green-600/20"
          >
            Save
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold py-2 px-3 border border-red-500/20 hover:border-red-500/40 transition-all duration-150 text-xs cursor-pointer active:scale-95"
          >
            Reset
          </button>
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
