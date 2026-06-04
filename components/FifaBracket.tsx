"use client";

import React from "react";
import { GROUPS } from "../lib/bracketData";
import { Round, getAvailableTeams } from "../lib/bracketLogic";
import { GroupCard } from "./GroupCard";
import { RoundColumn } from "./RoundColumn";
import { BracketSummary } from "./BracketSummary";
import { BracketHeader } from "./BracketHeader";
import { AiLab } from "./AiLab";
import { useFifaBracket } from "../hooks/useFifaBracket";

const NAVIGATION_TABS: { id: Round | "summary" | "ai_lab"; label: string }[] = [
  { id: "groups", label: "Groups" },
  { id: "r32", label: "Round of 32" },
  { id: "r16", label: "Round of 16" },
  { id: "r8", label: "Quarterfinals" },
  { id: "semi", label: "Semifinals" },
  { id: "final", label: "Final" },
  { id: "summary", label: "Summary" },
  { id: "ai_lab", label: "✨ AI Lab" },
];

export const FifaBracket: React.FC = () => {
  const {
    state,
    activeTab,
    setActiveTab,
    userName,
    setUserName,
    saveStatus,
    aiLoading,
    completedRoundsCount,
    handleGroupSelect,
    handleSetGroupQualifiers,
    handlePlayoffSelect,
    handleReset,
    handleManualSave,
    handleExport,
    handleAiAutoFill,
    getTabUnlockedStatus,
  } = useFifaBracket();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-100">
      <BracketHeader
        completedRoundsCount={completedRoundsCount}
        aiLoading={aiLoading}
        onAiAutoFill={handleAiAutoFill}
        onSave={handleManualSave}
        onReset={handleReset}
      />

      {saveStatus && (
        <div className="bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-2.5 rounded-xl text-sm font-medium text-center animate-pulse">
          {saveStatus}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-800 overflow-x-auto flex whitespace-nowrap scrollbar-hide">
        <nav className="flex space-x-2 p-1" aria-label="Tabs">
          {NAVIGATION_TABS.map((tab) => {
            const isUnlocked = getTabUnlockedStatus(tab.id);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                disabled={!isUnlocked}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 rounded-lg font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-green-600 text-white"
                    : isUnlocked
                    ? "text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    : "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <main className="mt-6">
        {activeTab === "groups" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GROUPS.map((group) => (
              <GroupCard
                key={group.name}
                groupName={group.name}
                teams={group.teams}
                selectedTeams={state.groups[group.name] || []}
                onSelectTeam={(team) => handleGroupSelect(group.name, team)}
                onSetQualifiers={handleSetGroupQualifiers}
              />
            ))}
          </div>
        )}

        {activeTab === "r32" && (
          <RoundColumn round="r32" roundTitle="Round of 32 (Predictions)" previousRoundTeams={getAvailableTeams(state, "r32")} selectedTeams={state.r32} onToggleTeam={(team) => handlePlayoffSelect("r32", team)} />
        )}

        {activeTab === "r16" && (
          <RoundColumn round="r16" roundTitle="Round of 16 (Predictions)" previousRoundTeams={getAvailableTeams(state, "r16")} selectedTeams={state.r16} onToggleTeam={(team) => handlePlayoffSelect("r16", team)} />
        )}

        {activeTab === "r8" && (
          <RoundColumn round="r8" roundTitle="Quarterfinals (Predictions)" previousRoundTeams={getAvailableTeams(state, "r8")} selectedTeams={state.r8} onToggleTeam={(team) => handlePlayoffSelect("r8", team)} />
        )}

        {activeTab === "semi" && (
          <RoundColumn round="semi" roundTitle="Semifinals (Predictions)" previousRoundTeams={getAvailableTeams(state, "semi")} selectedTeams={state.semi} onToggleTeam={(team) => handlePlayoffSelect("semi", team)} />
        )}

        {activeTab === "final" && (
          <RoundColumn round="final" roundTitle="Grand Final Prediction" previousRoundTeams={getAvailableTeams(state, "final")} selectedTeams={state.final} onToggleTeam={(team) => handlePlayoffSelect("final", team)} />
        )}

        {activeTab === "summary" && (
          <div className="space-y-6">
            <BracketSummary state={state} />
            <ExportPanel userName={userName} onNameChange={setUserName} onExport={handleExport} />
          </div>
        )}

        {activeTab === "ai_lab" && <AiLab />}
      </main>
    </div>
  );
};

/* ── Atomic export sub-component ───────────────────────────────────── */

const ExportPanel: React.FC<{
  userName: string;
  onNameChange: (name: string) => void;
  onExport: () => void;
}> = ({ userName, onNameChange, onExport }) => (
  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-xl">
    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
      Export Predictions
    </h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
      Export your predictions bracket as a JSON file to share.
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => onNameChange(e.target.value)}
        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm flex-1 focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
      <button
        onClick={onExport}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition duration-150"
      >
        Export to JSON
      </button>
    </div>
  </div>
);
