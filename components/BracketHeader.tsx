import React, { useState } from "react";
import { Round } from "../lib/bracketLogic";
import { TEAM_FLAGS } from "../lib/bracketData";

interface BracketHeaderProps {
  completedRoundsCount: number;
  aiLoading: boolean;
  onAiAutoFill: (upToRound: Round | "all") => void;
  onSave: () => void;
  onReset: () => void;
  // Strategy settings:
  chaosFactor: number;
  setChaosFactor: (v: number) => void;
  boostTeam: string;
  setBoostTeam: (v: string) => void;
  boostAmount: number;
  setBoostAmount: (v: number) => void;
  simRuns: number;
  setSimRuns: (v: number) => void;
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

const SORTED_TEAM_NAMES = Object.keys(TEAM_FLAGS).sort();

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
}) => {
  const [targetRound, setTargetRound] = useState<Round | "all">("all");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const hasActiveOverrides = chaosFactor > 0 || (boostTeam !== "" && boostAmount > 0) || simRuns > 1;

  return (
    <div className="bg-neutral-900 text-white rounded-none shadow-lg border border-neutral-800 overflow-hidden">
      {/* Top Main Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 border-b border-neutral-850">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            AI Strategy Controls
            {hasActiveOverrides && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 border border-amber-500/30 animate-pulse rounded-none">
                Custom Strategy Active
              </span>
            )}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure global simulation parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="bg-neutral-850 px-4 py-2 border border-neutral-800 text-sm mr-auto lg:mr-0 rounded-none">
            Progress:{" "}
            <span className="font-semibold text-green-400">
              {completedRoundsCount} of 6
            </span>{" "}
            rounds complete
          </div>

          {/* Collapsible Gear Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 border transition duration-150 relative cursor-pointer rounded-none ${
              showSettings || hasActiveOverrides
                ? "bg-violet-600/25 border-violet-500/40 text-violet-300"
                : "bg-neutral-800/40 border-neutral-750 text-neutral-450 hover:bg-neutral-850 hover:text-white"
            }`}
            title="Configure Custom AI Strategy Settings"
          >
            <svg className={`h-5.5 w-5.5 transition-transform duration-300 ${showSettings ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {hasActiveOverrides && !showSettings && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-violet-500 rounded-full border-2 border-neutral-900" />
            )}
          </button>

          {/* AI Autofill trigger group */}
          <div className="flex items-center gap-1.5 bg-neutral-800/40 p-1.5 border border-neutral-750 rounded-none">
            <select
              value={targetRound}
              onChange={(e) => setTargetRound(e.target.value as Round | "all")}
              disabled={aiLoading}
              className="bg-transparent text-xs text-neutral-200 font-medium px-2 py-1.5 rounded-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[140px]"
            >
              {ROUND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => onAiAutoFill(targetRound)}
              disabled={aiLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-1.5 px-3 rounded-none transition duration-155 text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 border border-emerald-500/20"
              title="Auto-fill predictions using the AI model"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <span>AI Auto-Fill</span>
              )}
            </button>
          </div>

          <button
            onClick={onSave}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-none transition duration-150 text-sm cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={onReset}
            className="bg-red-650/20 hover:bg-red-655/35 text-red-400 font-semibold py-2 px-4 rounded-none transition duration-150 text-sm cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Expandable Custom AI Strategy Panel */}
      {showSettings && (
        <div className="bg-neutral-950 p-5 border-b border-neutral-850 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
          {/* Chaos / Surprise Factor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-neutral-350 tracking-wider uppercase">
                Upsets / Chaos Factor
              </label>
              <span className="text-xs font-mono text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded-none">
                {Math.round(chaosFactor * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={chaosFactor}
              onChange={(e) => setChaosFactor(parseFloat(e.target.value))}
              className="w-full accent-violet-500 h-1.5 bg-neutral-800 rounded-none appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Higher value introduces surprise elements/random sampling based on actual team probabilities instead of always selecting the mathematical favorite.
            </p>
          </div>

          {/* Favored Team */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-350 tracking-wider uppercase block">
              Favor / Boost Team
            </label>
            <select
              value={boostTeam}
              onChange={(e) => setBoostTeam(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-none px-3 py-2 text-xs text-neutral-200 focus:ring-1 focus:ring-violet-500 focus:outline-none cursor-pointer"
            >
              <option value="">No custom boost</option>
              {SORTED_TEAM_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Select a team to receive a global simulation advantage, simulating custom bias conditions (e.g. home advantage, fan pressure).
            </p>
          </div>

          {/* Boost Strength */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-neutral-350 tracking-wider uppercase">
                Boost Strength
              </label>
              <span className="text-xs font-mono text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded-none">
                +{boostAmount} ELO
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="25"
              value={boostAmount}
              disabled={boostTeam === ""}
              onChange={(e) => setBoostAmount(parseInt(e.target.value))}
              className="w-full accent-violet-500 h-1.5 bg-neutral-800 rounded-none appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            />
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              The amount of ELO strength and form calibration boost given to the favored team throughout the simulated tournament matches.
            </p>
          </div>

          {/* Simulation Runs */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-350 tracking-wider uppercase block">
              Simulation Runs
            </label>
            <select
              value={simRuns}
              onChange={(e) => setSimRuns(parseInt(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-none px-3 py-2 text-xs text-neutral-200 focus:ring-1 focus:ring-violet-500 focus:outline-none cursor-pointer"
            >
              <option value="1">1 Run (Fast/Deterministic)</option>
              <option value="10">10 Runs</option>
              <option value="50">50 Runs</option>
              <option value="100">100 Runs</option>
              <option value="250">250 Runs</option>
              <option value="500">500 Runs</option>
            </select>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Run the tournament simulation multiple times to calculate overall winning frequencies for each country.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
