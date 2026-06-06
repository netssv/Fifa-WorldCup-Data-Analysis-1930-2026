"use client";

import React, { useState, useCallback, useRef } from "react";
import { GROUPS } from "../lib/bracketData";
import { Round, getAvailableTeams } from "../lib/bracketLogic";
import { GroupCard } from "./GroupCard";
import { RoundColumn } from "./RoundColumn";
import { BracketSummary, BracketSummaryHandle } from "./BracketSummary";
import { BracketHeader } from "./BracketHeader";
import { AiLab } from "./AiLab";
import { WinProbsPanel } from "./WinProbsPanel";
import { useFifaBracket } from "../hooks/useFifaBracket";
import { FifaTitleHeader } from "./FifaTitleHeader";
import { ExportPanel } from "./ExportPanel";
import { BracketNavigation, NAVIGATION_TABS } from "./BracketNavigation";
import { FifaFooter } from "./FifaFooter";

export const FifaBracket: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const bracketSummaryRef = useRef<BracketSummaryHandle>(null);

  const handleToggleTheme = useCallback(() => {
    setIsDark(document.documentElement.classList.toggle("dark"));
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
    winProbs, teamStats, simRunsTotal, lastSimScope,
    simProgress,
  } = useFifaBracket();

  const currentTabIndex = NAVIGATION_TABS.findIndex((t) => t.id === activeTab);
  const handlePrevTab = () => {
    const prev = NAVIGATION_TABS[currentTabIndex - 1];
    if (prev && getTabUnlockedStatus(prev.id)) setActiveTab(prev.id);
  };
  const handleNextTab = () => {
    const next = NAVIGATION_TABS[currentTabIndex + 1];
    if (next && getTabUnlockedStatus(next.id)) setActiveTab(next.id);
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
        simProgress={simProgress}
      />

      {/* Save status toast */}
      {saveStatus && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-2.5 text-sm font-semibold text-center rounded-none animate-slide-down">
          ✓ {saveStatus}
        </div>
      )}

      {/* Win probabilities panel — solo para torneo completo */}
      {winProbs && lastSimScope === "all" && (
        <WinProbsPanel winProbs={winProbs} simRunsTotal={simRunsTotal} />
      )}

      {/* Banner informativo para simulaciones de ronda específica */}
      {lastSimScope !== "all" && !aiLoading && (
        <div className="bg-emerald-950/30 border border-emerald-800/40 px-5 py-3 flex items-center gap-3 text-sm">
          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-emerald-300 font-semibold">
            Simulated: <span className="text-white">{
              lastSimScope === "groups" ? "Group Stage"
              : lastSimScope === "r32" ? "Round of 32"
              : lastSimScope === "r16" ? "Round of 16"
              : lastSimScope === "r8" ? "Quarterfinals"
              : lastSimScope === "semi" ? "Semifinals"
              : "Final"
            }</span>
          </span>
          <span className="text-emerald-600 text-xs">— only this stage was updated in your bracket</span>
        </div>
      )}

      <BracketNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        getTabUnlockedStatus={getTabUnlockedStatus}
      />

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
                winProbs={winProbs}
                teamStats={teamStats}
              />
            ))}
          </div>
        )}

        {activeTab === "r32" && (
          <RoundColumn round="r32" roundTitle="Round of 32" previousRoundTeams={getAvailableTeams(state, "r32")} selectedTeams={state.r32} onToggleTeam={(team) => handlePlayoffSelect("r32", team)} winProbs={winProbs} teamStats={teamStats} />
        )}
        {activeTab === "r16" && (
          <RoundColumn round="r16" roundTitle="Round of 16" previousRoundTeams={getAvailableTeams(state, "r16")} selectedTeams={state.r16} onToggleTeam={(team) => handlePlayoffSelect("r16", team)} winProbs={winProbs} teamStats={teamStats} />
        )}
        {activeTab === "r8" && (
          <RoundColumn round="r8" roundTitle="Quarterfinals" previousRoundTeams={getAvailableTeams(state, "r8")} selectedTeams={state.r8} onToggleTeam={(team) => handlePlayoffSelect("r8", team)} winProbs={winProbs} teamStats={teamStats} />
        )}
        {activeTab === "semi" && (
          <RoundColumn round="semi" roundTitle="Semifinals" previousRoundTeams={getAvailableTeams(state, "semi")} selectedTeams={state.semi} onToggleTeam={(team) => handlePlayoffSelect("semi", team)} winProbs={winProbs} teamStats={teamStats} />
        )}
        {activeTab === "final" && (
          <RoundColumn round="final" roundTitle="Grand Final" previousRoundTeams={getAvailableTeams(state, "final")} selectedTeams={state.final} onToggleTeam={(team) => handlePlayoffSelect("final", team)} winProbs={winProbs} teamStats={teamStats} />
        )}

        {activeTab === "summary" && (
          <div className="space-y-6">
            <BracketSummary ref={bracketSummaryRef} state={state} onPickWinner={handlePlayoffSelect} />
            <ExportPanel
              userName={userName}
              onNameChange={setUserName}
              onExportJSON={handleExport}
              onExportPNG={() => bracketSummaryRef.current?.exportPNG()}
              onExportPDF={() => bracketSummaryRef.current?.exportPDF()}
            />
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

      {/* ── Footer / Copyleft & Technical details ── */}
      <FifaFooter />
    </div>
  );
};
