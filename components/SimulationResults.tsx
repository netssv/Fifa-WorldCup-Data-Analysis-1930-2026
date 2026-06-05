import React from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
import { MatchPrediction } from "../lib/apiClient";
import { ModelFeaturesCard } from "./ModelFeaturesCard";

interface SimulationResultsProps {
  result: MatchPrediction;
  showDrawBar: boolean;
}

const getProbabilityBarColor = (probability: number): string => {
  if (probability > 0.55) return "bg-emerald-500";
  if (probability > 0.40) return "bg-sky-500";
  return "bg-neutral-400 dark:bg-neutral-600";
};

const getConfidenceBadgeStyle = (confidence: string): string => {
  if (confidence === "high")
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400";
  if (confidence === "medium")
    return "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-400";
  return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300";
};

/** Renders probability bars, confidence badge, and predicted winner */
export const SimulationResults: React.FC<SimulationResultsProps> = ({
  result,
  showDrawBar,
}) => {
  const { team_a, team_b, team_a_win_prob, draw_prob, team_b_win_prob } = result;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Probabilities Card */}
      <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-none p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
              Simulation Probabilities
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
                Confidence:
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-none font-bold uppercase ${getConfidenceBadgeStyle(result.confidence)}`}>
                {result.confidence} ({(result.confidence_score * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <ProbabilityBar
              flag={TEAM_FLAGS[team_a]}
              label={`${team_a} Wins`}
              probability={team_a_win_prob}
            />
            {showDrawBar && (
              <ProbabilityBar flag="" label="Draw" probability={draw_prob} isNeutral />
            )}
            <ProbabilityBar
              flag={TEAM_FLAGS[team_b]}
              label={`${team_b} Wins`}
              probability={team_b_win_prob}
            />
          </div>
        </div>

        {/* Predicted Outcome Footer */}
        <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Predicted Outcome:
            </span>
            {result.goals_a !== undefined && result.goals_b !== undefined && (
              <span className="text-xs font-mono text-emerald-500 font-bold mt-0.5">
                Expected Goals: {result.goals_a.toFixed(2)} - {result.goals_b.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 font-bold text-neutral-850 dark:text-white bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 rounded-none border border-neutral-200/60 dark:border-neutral-800">
            <span className="text-xl">
              {TEAM_FLAGS[result.predicted_winner] ? (
                <img
                  src={TEAM_FLAGS[result.predicted_winner]}
                  alt={result.predicted_winner}
                  className="w-8 h-5 object-cover inline-block shadow-sm"
                />
              ) : null}
            </span>
            <span>
              {result.predicted_winner} wins
              {result.goals_a !== undefined && result.goals_b !== undefined &&
                ` by ${Math.abs(result.goals_a - result.goals_b).toFixed(1)} goals (expected)`}
            </span>
          </div>
        </div>
      </div>

      <ModelFeaturesCard result={result} />
    </div>
  );
};

/* ── Atomic sub-component ─────────────────────────────────────────── */

interface ProbabilityBarProps {
  flag: string;
  label: string;
  probability: number;
  isNeutral?: boolean;
}

const ProbabilityBar: React.FC<ProbabilityBarProps> = ({
  flag,
  label,
  probability,
  isNeutral = false,
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm font-semibold">
      <span className="flex items-center gap-2">
        <span className="flex items-center text-lg min-w-[24px]">
          {isNeutral ? (
            <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          ) : flag ? (
            <img src={flag} alt="" className="w-5 h-3.5 object-cover rounded-[2px]" />
          ) : null}
        </span>
        <span>{label}</span>
      </span>
      <span>{(probability * 100).toFixed(1)}%</span>
    </div>
    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-3 rounded-none overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ${
          isNeutral ? "bg-neutral-400 dark:bg-neutral-600" : getProbabilityBarColor(probability)
        }`}
        style={{ width: `${probability * 100}%` }}
      />
    </div>
  </div>
);
