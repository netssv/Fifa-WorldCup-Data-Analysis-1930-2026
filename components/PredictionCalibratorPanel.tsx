import React from "react";

interface PredictionCalibratorPanelProps {
  useGoldman: boolean;
  setUseGoldman: (value: boolean) => void;
  useKlement: boolean;
  setUseKlement: (value: boolean) => void;
}

export const PredictionCalibratorPanel: React.FC<PredictionCalibratorPanelProps> = ({
  useGoldman,
  setUseGoldman,
  useKlement,
  setUseKlement,
}) => {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-none p-6 shadow-sm">
      <h2 className="text-xl font-extrabold text-neutral-800 dark:text-white mb-2 flex items-center gap-2.5">
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Prediction Calibrators
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        Apply statistical adjustments to match predictions based on external factors.
      </p>

      {/* Calibrator Options */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-none cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors">
          <input
            type="checkbox"
            checked={useGoldman}
            onChange={(e) => setUseGoldman(e.target.checked)}
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer mt-0.5 flex-shrink-0"
          />
          <div className="flex-1">
            <span className="block text-neutral-800 dark:text-neutral-200 font-semibold">
              Goldman Sachs (Elite Scorers)
            </span>
            <span className="block text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Adjust outcomes by top-scorer talent in Europe's elite leagues.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-none cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors">
          <input
            type="checkbox"
            checked={useKlement}
            onChange={(e) => setUseKlement(e.target.checked)}
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer mt-0.5 flex-shrink-0"
          />
          <div className="flex-1">
            <span className="block text-neutral-800 dark:text-neutral-200 font-semibold">
              Klement Macro (GDP &amp; Culture)
            </span>
            <span className="block text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Use macroeconomic and cultural calibration for relative team strength.
            </span>
          </div>
        </label>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-none">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">💡 Tip:</span> These calibrators refine predictions with specialized analysis. Toggle them on/off to see their impact on match odds.
        </p>
      </div>
    </div>
  );
};
