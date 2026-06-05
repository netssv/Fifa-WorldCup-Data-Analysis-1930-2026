import React from "react";
import { MatchPrediction } from "../lib/apiClient";

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
  valueStyle = "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100",
  hasBorder = false,
}) => (
  <div
    className={`flex justify-between items-center py-2.5 ${
      hasBorder ? "border-b border-neutral-100 dark:border-neutral-850" : ""
    }`}
  >
    <div>
      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200 block">
        {title}
      </span>
      <span className="text-xs text-neutral-400">{subtitle}</span>
    </div>
    <span className={`text-sm font-extrabold px-3 py-1 rounded-none ${valueStyle}`}>
      {value}
    </span>
  </div>
);

/** Card showing the ML model's input features for a given match prediction */
export const ModelFeaturesCard: React.FC<{ result: MatchPrediction }> = ({ result }) => {
  const { elo_diff, team_a_form, team_b_form, h2h_wins_a } = result.model_features;
  const eloDiffIsPositive = elo_diff >= 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-none p-6 shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
        Model Feature Details
      </h3>
      <div className="space-y-4">
        <FeatureRow
          title="ELO Differential"
          subtitle="Power rating gap between teams"
          value={`${eloDiffIsPositive ? "+" : ""}${elo_diff}`}
          valueStyle={
            eloDiffIsPositive
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
