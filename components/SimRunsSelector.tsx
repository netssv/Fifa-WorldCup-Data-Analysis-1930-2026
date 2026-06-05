import React, { useState, useCallback } from "react";

const PRESET_RUNS = [1, 10, 50, 100, 500, 1000, 5000];

interface SimRunsSelectorProps {
  simRuns: number;
  setSimRuns: (v: number) => void;
  aiLoading: boolean;
}

/** Lets the user pick simulation runs from presets or enter a custom value */
export const SimRunsSelector: React.FC<SimRunsSelectorProps> = ({
  simRuns,
  setSimRuns,
  aiLoading,
}) => {
  const [useCustomRuns, setUseCustomRuns] = useState(false);
  const [customRuns, setCustomRuns] = useState("");

  const handleCustomChange = useCallback(
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

  if (useCustomRuns) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          inputMode="numeric"
          value={customRuns}
          onChange={handleCustomChange}
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
    );
  }

  return (
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
  );
};
