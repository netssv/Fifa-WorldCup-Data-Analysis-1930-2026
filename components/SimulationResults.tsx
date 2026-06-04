import React from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
import { MatchPrediction } from "../lib/apiClient";

interface SimulationResultsProps {
  result: MatchPrediction;
  showDrawBar: boolean;
}

const getProbabilityBarColor = (probability: number): string => {
  if (probability > 0.55) return "bg-emerald-500";
  if (probability > 0.40) return "bg-sky-500";
  return "bg-slate-400 dark:bg-slate-600";
};

const getConfidenceBadgeStyle = (confidence: string): string => {
  if (confidence === "high")
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400";
  if (confidence === "medium")
    return "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-400";
  return "bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-300";
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
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Simulation Probabilities
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Confidence:
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${getConfidenceBadgeStyle(result.confidence)}`}>
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

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Predicted Outcome:
          </span>
          <div className="flex items-center gap-2.5 font-bold text-slate-850 dark:text-white bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-xl">{TEAM_FLAGS[result.predicted_winner]}</span>
            <span>{result.predicted_winner} advances/wins</span>
          </div>
        </div>
      </div>

      {/* Model Features Card */}
      <ModelFeaturesCard result={result} />
    </div>
  );
};

/* ── Atomic sub-components ─────────────────────────────────────────── */

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
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          ) : flag}
        </span>
        <span>{label}</span>
      </span>
      <span>{(probability * 100).toFixed(1)}%</span>
    </div>
    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ${
          isNeutral ? "bg-slate-400 dark:bg-slate-600" : getProbabilityBarColor(probability)
        }`}
        style={{ width: `${probability * 100}%` }}
      />
    </div>
  </div>
);

const ModelFeaturesCard: React.FC<{ result: MatchPrediction }> = ({ result }) => {
  const { elo_diff, team_a_form, team_b_form, h2h_wins_a } = result.model_features;
  const eloDiffIsPositive = elo_diff >= 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
        Model Feature Details
      </h3>
      <div className="space-y-4">
        <FeatureRow
          title="ELO Differential"
          subtitle="Power rating gap between teams"
          value={`${eloDiffIsPositive ? "+" : ""}${elo_diff}`}
          valueStyle={eloDiffIsPositive
            ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
          }
          hasBorder
        />
        <FeatureRow
          title={`${result.team_a} Form`}
          subtitle="Wins in last 10 games"
          value={`${(team_a_form * 100).toFixed(0)}%`}
          hasBorder
        />
        <FeatureRow
          title={`${result.team_b} Form`}
          subtitle="Wins in last 10 games"
          value={`${(team_b_form * 100).toFixed(0)}%`}
          hasBorder
        />
        <FeatureRow
          title="H2H Wins (A vs B)"
          subtitle="Historical matches won by Team A"
          value={`${h2h_wins_a} wins`}
        />
      </div>
    </div>
  );
};

interface FeatureRowProps {
  title: string;
  subtitle: string;
  value: string;
  valueStyle?: string;
  hasBorder?: boolean;
}

const FeatureRow: React.FC<FeatureRowProps> = ({
  title,
  subtitle,
  value,
  valueStyle = "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100",
  hasBorder = false,
}) => (
  <div className={`flex justify-between items-center py-2.5 ${hasBorder ? "border-b border-slate-100 dark:border-slate-850" : ""}`}>
    <div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">{title}</span>
      <span className="text-xs text-slate-400">{subtitle}</span>
    </div>
    <span className={`text-sm font-extrabold px-3 py-1 rounded-lg ${valueStyle}`}>
      {value}
    </span>
  </div>
);
