"use client";

import React, { useState, useCallback } from "react";
import { GROUPS } from "../lib/bracketData";
import { Round, getAvailableTeams } from "../lib/bracketLogic";
import { GroupCard } from "./GroupCard";
import { RoundColumn } from "./RoundColumn";
import { BracketSummary } from "./BracketSummary";
import { BracketHeader } from "./BracketHeader";
import { AiLab } from "./AiLab";
import { WinProbsPanel } from "./WinProbsPanel";
import { useFifaBracket } from "../hooks/useFifaBracket";
import { FifaTitleHeader } from "./FifaTitleHeader";
import { ExportPanel } from "./ExportPanel";

const NAVIGATION_TABS: { id: Round | "summary" | "ai_lab"; label: string }[] = [
  { id: "groups", label: "Groups" }, { id: "r32", label: "Round of 32" },
  { id: "r16", label: "Round of 16" }, { id: "r8", label: "Quarters" },
  { id: "semi", label: "Semis" }, { id: "final", label: "Final" },
  { id: "summary", label: "Summary" }, { id: "ai_lab", label: "AI Lab" },
];

export const FifaBracket: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  const handleToggleTheme = useCallback(() => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const {
    state, activeTab, setActiveTab,
    userName, setUserName, saveStatus, aiLoading,
    completedRoundsCount,
    handleGroupSelect, handleSetGroupQualifiers,
    handlePlayoffSelect, handleReset, handleManualSave,
    handleExport, handleAiAutoFill, getTabUnlockedStatus,
    chaosFactor, setChaosFactor,
    boostTeam, setBoostTeam,
    boostAmount, setBoostAmount,
    simRuns, setSimRuns,
    winProbs, simRunsTotal,
  } = useFifaBracket();

  const currentTabIndex = NAVIGATION_TABS.findIndex((t) => t.id === activeTab);
  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      const prevTab = NAVIGATION_TABS[currentTabIndex - 1];
      if (getTabUnlockedStatus(prevTab.id)) setActiveTab(prevTab.id);
    }
  };
  const handleNextTab = () => {
    if (currentTabIndex < NAVIGATION_TABS.length - 1) {
      const nextTab = NAVIGATION_TABS[currentTabIndex + 1];
      if (getTabUnlockedStatus(nextTab.id)) setActiveTab(nextTab.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-neutral-800 dark:text-neutral-100 transition-colors duration-300">

      {/* ── Official FIFA 2026 Title Header ── */}
      <FifaTitleHeader />

      {/* Control Panel */}
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
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Save status toast */}
      {saveStatus && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-2.5 text-sm font-semibold text-center rounded-none animate-slide-down">
          ✓ {saveStatus}
        </div>
      )}

      {/* Win probabilities panel */}
      {winProbs && <WinProbsPanel winProbs={winProbs} simRunsTotal={simRunsTotal} />}

      <div className="border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto scrollbar-hide">
        <nav className="flex whitespace-nowrap" aria-label="Bracket Navigation">
          {NAVIGATION_TABS.map((tab) => {
            const isUnlocked = getTabUnlockedStatus(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                disabled={!isUnlocked}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group flex items-center gap-1.5 py-3 px-4 sm:px-5 font-semibold text-sm transition-all duration-200 border-b-2 select-none ${
                  isActive
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                    : isUnlocked
                    ? "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer"
                    : "border-transparent text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Tab Panels ── */}
      <main className="mt-2">
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
          <RoundColumn round="r32" roundTitle="Round of 32" previousRoundTeams={getAvailableTeams(state, "r32")} selectedTeams={state.r32} onToggleTeam={(team) => handlePlayoffSelect("r32", team)} />
        )}
        {activeTab === "r16" && (
          <RoundColumn round="r16" roundTitle="Round of 16" previousRoundTeams={getAvailableTeams(state, "r16")} selectedTeams={state.r16} onToggleTeam={(team) => handlePlayoffSelect("r16", team)} />
        )}
        {activeTab === "r8" && (
          <RoundColumn round="r8" roundTitle="Quarterfinals" previousRoundTeams={getAvailableTeams(state, "r8")} selectedTeams={state.r8} onToggleTeam={(team) => handlePlayoffSelect("r8", team)} />
        )}
        {activeTab === "semi" && (
          <RoundColumn round="semi" roundTitle="Semifinals" previousRoundTeams={getAvailableTeams(state, "semi")} selectedTeams={state.semi} onToggleTeam={(team) => handlePlayoffSelect("semi", team)} />
        )}
        {activeTab === "final" && (
          <RoundColumn round="final" roundTitle="Grand Final" previousRoundTeams={getAvailableTeams(state, "final")} selectedTeams={state.final} onToggleTeam={(team) => handlePlayoffSelect("final", team)} />
        )}

        {activeTab === "summary" && (
          <div className="space-y-6">
            <BracketSummary state={state} />
            <ExportPanel userName={userName} onNameChange={setUserName} onExport={handleExport} />
          </div>
        )}

        {activeTab === "ai_lab" && <AiLab />}
      </main>

      {/* ── Bottom Navigation ── */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={handlePrevTab}
          disabled={currentTabIndex === 0}
          className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 dark:text-neutral-300 font-semibold py-2.5 px-6 transition-all duration-150 text-sm cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={handleNextTab}
          disabled={currentTabIndex === NAVIGATION_TABS.length - 1 || !getTabUnlockedStatus(NAVIGATION_TABS[currentTabIndex + 1]?.id)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 transition-all duration-150 text-sm cursor-pointer active:scale-95 hover:shadow-lg hover:shadow-emerald-600/25"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
