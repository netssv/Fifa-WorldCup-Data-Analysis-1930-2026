import React, { useState } from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
import { predictGroup } from "../lib/apiClient";

interface GroupCardProps {
  groupName: string;
  teams: string[];
  selectedTeams: string[];
  onSelectTeam: (teamName: string) => void;
  onSetQualifiers?: (groupName: string, teamNames: string[]) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  groupName,
  teams,
  selectedTeams = [],
  onSelectTeam,
  onSetQualifiers
}) => {
  const [loading, setLoading] = useState(false);
  const isSelected = (team: string) => selectedTeams.includes(team);
  const reachedLimit = selectedTeams.length >= 2;

  const handleAiSuggest = async () => {
    if (!onSetQualifiers) return;
    try {
      setLoading(true);
      const res = await predictGroup(groupName, teams);
      if (res && res.suggested_qualifiers) {
        onSetQualifiers(groupName, res.suggested_qualifiers);
      }
    } catch (err) {
      console.error("AI Group Suggest error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {groupName}
          </span>
          {onSetQualifiers && (
            <button
              onClick={handleAiSuggest}
              disabled={loading}
              className="text-xs px-2 py-0.5 rounded-none font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/50 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition duration-155 disabled:opacity-50 flex items-center gap-1 cursor-pointer active:scale-95"
              title="Predict qualifiers using ML models"
            >
              {loading ? (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <span>AI</span>
              )}
            </button>
          )}
        </div>
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 font-medium">
          {selectedTeams.length} / 2 selected
        </span>
      </div>

      <div className="space-y-2">
        {teams.map(team => {
          const selected = isSelected(team);
          const disabled = !selected && reachedLimit;
          const flag = TEAM_FLAGS[team] || "🏳️";

          return (
            <button
              key={team}
              onClick={() => onSelectTeam(team)}
              disabled={disabled}
              className={`w-full flex items-center justify-between p-3 rounded-none border text-left font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                selected
                  ? "bg-green-600 border-green-600 text-white shadow-sm"
                  : disabled
                  ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-300 dark:text-slate-700 cursor-not-allowed hover:scale-100"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-3">
                <span>{team}</span>
              </span>
              {selected && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
