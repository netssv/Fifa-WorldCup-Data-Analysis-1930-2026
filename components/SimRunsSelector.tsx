import React, { useState, useCallback } from "react";

// Max 100 runs in production to protect Railway CPU budget ($5/month)
const PRESET_RUNS = [1, 10, 50, 100];
const MAX_CUSTOM_RUNS = 100;

interface SimRunsSelectorProps {
  simRuns: number;
  setSimRuns: (v: number) => void;
  aiLoading: boolean;
  showSettings: boolean;
  onToggleSettings: () => void;
}

/** Lets the user pick simulation runs from presets or enter a custom value */
export const SimRunsSelector: React.FC<SimRunsSelectorProps> = ({
  simRuns,
  setSimRuns,
  aiLoading,
  showSettings,
  onToggleSettings,
}) => {
  const [useCustomRuns, setUseCustomRuns] = useState(false);
  const [customRuns, setCustomRuns] = useState("");

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      setCustomRuns(raw);
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= MAX_CUSTOM_RUNS) {
        setSimRuns(Math.min(parsed, MAX_CUSTOM_RUNS));
      }
    },
    [setSimRuns]
  );

  if (useCustomRuns) {
    return (
      <div className="flex items-center gap-1 w-full sm:w-auto">
        <input
          type="text"
          inputMode="numeric"
          value={customRuns}
          onChange={handleCustomChange}
          placeholder={`1–${MAX_CUSTOM_RUNS}`}
          className="w-full bg-neutral-100 dark:bg-neutral-800 border border-violet-500/50 text-xs font-semibold px-3 py-2.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <span className="text-[9px] text-neutral-400 whitespace-nowrap font-bold">max {MAX_CUSTOM_RUNS}</span>
        <button
          onClick={() => {
            setUseCustomRuns(false);
            if (showSettings) onToggleSettings();
          }}
          className="text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 border border-neutral-300 dark:border-neutral-700 hover:border-red-500/30 dark:hover:border-red-500/30 text-xs px-3 py-2.5 transition-colors font-bold flex-shrink-0 cursor-pointer rounded-sm bg-transparent"
          title="Back to presets"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 w-full sm:w-auto">
      <select
        value={simRuns}
        onChange={(e) => setSimRuns(parseInt(e.target.value, 10))}
        disabled={aiLoading}
        className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer text-neutral-700 dark:text-neutral-200 transition-colors w-full"
      >
        {PRESET_RUNS.map((r) => (
          <option key={r} value={r} className="bg-white dark:bg-neutral-900">
            {r === 1 ? "1 Run (Fast)" : r === 100 ? "100 Runs (Max)" : `${r} Runs`}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          setUseCustomRuns(true);
          setCustomRuns(String(simRuns));
          if (!showSettings) {
            onToggleSettings();
          }
        }}
        className={`text-[10px] border px-2 py-2.5 transition-colors font-bold flex-shrink-0 cursor-pointer ${
          showSettings
            ? "bg-violet-600/20 border-violet-500/50 text-violet-400 hover:bg-violet-600/30"
            : "text-violet-400 hover:text-violet-300 border-violet-500/30 hover:border-violet-400"
        }`}
        title="Enter custom number of runs and open parameters panel"
      >
        Custom
      </button>
    </div>
  );
};
