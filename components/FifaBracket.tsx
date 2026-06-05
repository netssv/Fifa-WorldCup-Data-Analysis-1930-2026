"use client";

import React from "react";
import { GROUPS } from "../lib/bracketData";
import { Round, getAvailableTeams } from "../lib/bracketLogic";
import { GroupCard } from "./GroupCard";
import { RoundColumn } from "./RoundColumn";
import { BracketSummary } from "./BracketSummary";
import { BracketHeader } from "./BracketHeader";
import { AiLab } from "./AiLab";
import { WinProbsPanel } from "./WinProbsPanel";
import { useFifaBracket } from "../hooks/useFifaBracket";

const NAVIGATION_TABS: { id: Round | "summary" | "ai_lab"; label: string }[] = [
  { id: "groups", label: "Groups" },
  { id: "r32", label: "Round of 32" },
  { id: "r16", label: "Round of 16" },
  { id: "r8", label: "Quarterfinals" },
  { id: "semi", label: "Semifinals" },
  { id: "final", label: "Final" },
  { id: "summary", label: "Summary" },
  { id: "ai_lab", label: "AI Lab" },
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
    chaosFactor,
    setChaosFactor,
    boostTeam,
    setBoostTeam,
    boostAmount,
    setBoostAmount,
    simRuns,
    setSimRuns,
    winProbs,
    simRunsTotal,
  } = useFifaBracket();

  const currentTabIndex = NAVIGATION_TABS.findIndex((t) => t.id === activeTab);
  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      const prevTab = NAVIGATION_TABS[currentTabIndex - 1];
      if (getTabUnlockedStatus(prevTab.id)) {
        setActiveTab(prevTab.id);
      }
    }
  };
  const handleNextTab = () => {
    if (currentTabIndex < NAVIGATION_TABS.length - 1) {
      const nextTab = NAVIGATION_TABS[currentTabIndex + 1];
      if (getTabUnlockedStatus(nextTab.id)) {
        setActiveTab(nextTab.id);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-neutral-800 dark:text-neutral-100">
      {/* Centered Big Title */}
      <div className="text-center py-8">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-[#00ff85] via-[#00f0ff] to-[#ff00a0] bg-clip-text text-transparent uppercase font-sans">
          FIFA 2026 World Cup Bracket
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-semibold tracking-wide uppercase">
          Official Simulation & Interactive Predictor
        </p>
      </div>

      <BracketHeader
        completedRoundsCount={completedRoundsCount}
        aiLoading={aiLoading}
        onAiAutoFill={handleAiAutoFill}
        onSave={handleManualSave}
        onReset={handleReset}
        chaosFactor={chaosFactor}
        setChaosFactor={setChaosFactor}
        boostTeam={boostTeam}
        setBoostTeam={setBoostTeam}
        boostAmount={boostAmount}
        setBoostAmount={setBoostAmount}
        simRuns={simRuns}
        setSimRuns={setSimRuns}
      />

      {saveStatus && (
        <div className="bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-2.5 text-sm font-medium text-center animate-pulse rounded-none">
          {saveStatus}
        </div>
      )}

      {/* Simulation win stats panel — shows after AI auto-fill with multiple runs */}
      {winProbs && (
        <WinProbsPanel winProbs={winProbs} simRunsTotal={simRunsTotal} />
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-neutral-800 overflow-x-auto flex whitespace-nowrap scrollbar-hide">
        <nav className="flex space-x-2 p-1" aria-label="Tabs">
          {NAVIGATION_TABS.map((tab) => {
            const isUnlocked = getTabUnlockedStatus(tab.id);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                disabled={!isUnlocked}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 rounded-none font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-green-600 text-white"
                    : isUnlocked
                    ? "text-neutral-650 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    : "text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
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

      {/* Back and Next navigation buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={handlePrevTab}
          disabled={currentTabIndex === 0}
          className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-none text-sm transition duration-150 cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={handleNextTab}
          disabled={currentTabIndex === NAVIGATION_TABS.length - 1 || !getTabUnlockedStatus(NAVIGATION_TABS[currentTabIndex + 1]?.id)}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-none text-sm transition duration-150 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

/* ── Atomic export sub-component ───────────────────────────────────── */

const ExportPanel: React.FC<{
  userName: string;
  onNameChange: (name: string) => void;
  onExport: () => void;
}> = ({ userName, onNameChange, onExport }) => (
  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-none max-w-xl">
    <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-2">
      Export Predictions
    </h3>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
      Export your predictions bracket as a JSON file to share.
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => onNameChange(e.target.value)}
        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-none px-4 py-2.5 text-sm flex-1 focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
      <button
        onClick={onExport}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-none text-sm transition duration-150"
      >
        Export to JSON
      </button>
    </div>
  </div>
);
