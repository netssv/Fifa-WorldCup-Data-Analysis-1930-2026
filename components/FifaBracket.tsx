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

export const FifaBracket: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const bracketSummaryRef = useRef<BracketSummaryHandle>(null);

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
      <footer className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-500 dark:text-neutral-400 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-left md:text-right max-w-7xl mx-auto px-1">
          <div className="text-left space-y-1">
            <p className="font-semibold text-neutral-600 dark:text-neutral-300">Under the Hood</p>
            <p className="max-w-xl leading-relaxed">
              Frontend built with Next.js 16, React 19, and Tailwind CSS. Machine Learning backend powered by Python, FastAPI, Pandas, Scikit-learn, and XGBoost models running on Railway.
            </p>
          </div>
          <div className="text-right md:self-end">
            <p className="text-neutral-400 dark:text-neutral-500">
              copyleft rodrigo martel
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
