import React from "react";

interface BracketHeaderProps {
  completedRoundsCount: number;
  aiLoading: boolean;
  onAiAutoFill: () => void;
  onSave: () => void;
  onReset: () => void;
}

export const BracketHeader: React.FC<BracketHeaderProps> = ({
  completedRoundsCount,
  aiLoading,
  onAiAutoFill,
  onSave,
  onReset,
}) => (
  <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
        FIFA 2026 World Cup Bracket
      </h1>
      <p className="text-sm text-slate-400 mt-1">
        Build your interactive predictions path from groups stage to the champions.
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <div className="bg-slate-850 px-4 py-2 rounded-xl border border-slate-800 text-sm">
        Progress:{" "}
        <span className="font-semibold text-green-400">
          {completedRoundsCount} of 6
        </span>{" "}
        rounds complete
      </div>
      <button
        onClick={onAiAutoFill}
        disabled={aiLoading}
        className="bg-emerald-650 hover:bg-emerald-755 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl transition duration-150 text-sm flex items-center gap-2 cursor-pointer active:scale-95 border border-emerald-500/20"
        title="Auto-fill the entire bracket utilizing the ML predictions model"
      >
        {aiLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <span>✨ AI Auto-Fill</span>
        )}
      </button>
      <button
        onClick={onSave}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-150 text-sm"
      >
        Save predictions
      </button>
      <button
        onClick={onReset}
        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-2 px-4 rounded-xl transition duration-150 text-sm"
      >
        Reset
      </button>
    </div>
  </header>
);
