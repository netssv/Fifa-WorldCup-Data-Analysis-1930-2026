import React, { useState, useEffect } from "react";
import { GROUPS } from "../lib/bracketData";
import {
  BracketState,
  Round,
  INITIAL_STATE,
  ROUND_LIMITS,
  isRoundComplete,
  getAvailableTeams
} from "../lib/bracketLogic";
import { saveBracket, loadBracket, exportBracket } from "../lib/bracketStore";
import { GroupCard } from "./GroupCard";
import { fetchFullBracket } from "../lib/apiClient";
import { RoundColumn } from "./RoundColumn";
import { BracketSummary } from "./BracketSummary";

export const FifaBracket: React.FC = () => {
  const [state, setState] = useState<BracketState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<Round | "summary">("groups");
  const [userName, setUserName] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const handleSetGroupQualifiers = (groupName: string, teamNames: string[]) => {
    setState(prev => {
      const newState = {
        ...prev,
        groups: {
          ...prev.groups,
          [groupName]: teamNames
        }
      };
      return cleanDependencies(newState);
    });
  };

  const handleAiAutoFill = async () => {
    try {
      setAiLoading(true);
      const data = await fetchFullBracket();
      if (data) {
        setState({
          groups: data.groups,
          r32: data.r32,
          r16: data.r16,
          r8: data.r8,
          semi: data.semi,
          final: data.final
        });
      }
    } catch (err) {
      console.error("AI Auto-Fill error:", err);
      alert("Failed to fetch AI bracket predictions. Make sure the API is running.");
    } finally {
      setAiLoading(false);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadBracket();
    setState(loaded);
  }, []);

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    if (state !== INITIAL_STATE) {
      saveBracket(state);
    }
  }, [state]);

  // Clean cascading dependencies if a selection is removed in an earlier round
  const cleanDependencies = (newState: BracketState): BracketState => {
    const cleanState = { ...newState };

    // Clean r32
    const groupTeams = Object.values(cleanState.groups).flat();
    cleanState.r32 = cleanState.r32.filter(t => groupTeams.includes(t));

    // Clean r16
    cleanState.r16 = cleanState.r16.filter(t => cleanState.r32.includes(t));

    // Clean r8
    cleanState.r8 = cleanState.r8.filter(t => cleanState.r16.includes(t));

    // Clean semi
    cleanState.semi = cleanState.semi.filter(t => cleanState.r8.includes(t));

    // Clean final
    if (cleanState.final && !cleanState.semi.includes(cleanState.final)) {
      cleanState.final = "";
    }

    return cleanState;
  };

  const handleGroupSelect = (groupName: string, teamName: string) => {
    setState(prev => {
      const current = prev.groups[groupName] || [];
      let updated: string[];

      if (current.includes(teamName)) {
        updated = current.filter(t => t !== teamName);
      } else {
        if (current.length >= 2) return prev; // Limit to 2
        updated = [...current, teamName];
      }

      const newState = {
        ...prev,
        groups: {
          ...prev.groups,
          [groupName]: updated
        }
      };

      return cleanDependencies(newState);
    });
  };

  const handlePlayoffSelect = (round: Exclude<Round, "groups">, teamName: string) => {
    setState(prev => {
      let newState: BracketState;

      if (round === "final") {
        newState = {
          ...prev,
          final: prev.final === teamName ? "" : teamName
        };
      } else {
        const list = prev[round] as string[];
        const updated = list.includes(teamName)
          ? list.filter(t => t !== teamName)
          : [...list, teamName];

        if (updated.length > ROUND_LIMITS[round]) return prev;

        newState = {
          ...prev,
          [round]: updated
        };
      }

      return cleanDependencies(newState);
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all your predictions?")) {
      setState(INITIAL_STATE);
      saveBracket(INITIAL_STATE);
      setActiveTab("groups");
    }
  };

  const handleManualSave = () => {
    saveBracket(state);
    setSaveStatus("Saved successfully!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const handleExport = () => {
    exportBracket(userName, state);
  };

  // Check which tabs are unlocked
  const rounds: { id: Round | "summary"; label: string }[] = [
    { id: "groups", label: "Groups" },
    { id: "r32", label: "Round of 32" },
    { id: "r16", label: "Round of 16" },
    { id: "r8", label: "Quarterfinals" },
    { id: "semi", label: "Semifinals" },
    { id: "final", label: "Final" },
    { id: "summary", label: "Summary" }
  ];

  const getTabUnlockedStatus = (tabId: Round | "summary"): boolean => {
    if (tabId === "groups") return true;
    if (tabId === "r32") return isRoundComplete(state, "groups");
    if (tabId === "r16") return isRoundComplete(state, "r32") && getTabUnlockedStatus("r32");
    if (tabId === "r8") return isRoundComplete(state, "r16") && getTabUnlockedStatus("r16");
    if (tabId === "semi") return isRoundComplete(state, "r8") && getTabUnlockedStatus("r8");
    if (tabId === "final") return isRoundComplete(state, "semi") && getTabUnlockedStatus("semi");
    if (tabId === "summary") return true; // Always allow summary viewing
    return false;
  };

  // Calculate completed rounds progress
  const roundKeys: Round[] = ["groups", "r32", "r16", "r8", "semi", "final"];
  const completedRoundsCount = roundKeys.filter(r => isRoundComplete(state, r)).length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            FIFA 2026 World Cup Bracket
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build your interactive predictions path from groups stage to the champions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-850 px-4 py-2 rounded-xl border border-slate-800 text-sm">
            Progress: <span className="font-semibold text-green-400">{completedRoundsCount} of 6</span> rounds complete
          </div>
          <button
            onClick={handleAiAutoFill}
            disabled={aiLoading}
            className="bg-emerald-650 hover:bg-emerald-755 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl transition duration-150 text-sm flex items-center gap-2 cursor-pointer active:scale-95 border border-emerald-500/20"
            title="Auto-fill the entire bracket utilizing the ML predictions model"
          >
            {aiLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>✨ AI Auto-Fill</span>
              </>
            )}
          </button>
          <button
            onClick={handleManualSave}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-150 text-sm"
          >
            Save predictions
          </button>
          <button
            onClick={handleReset}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-2 px-4 rounded-xl transition duration-150 text-sm"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Save Status Notification */}
      {saveStatus && (
        <div className="bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-2.5 rounded-xl text-sm font-medium text-center animate-pulse">
          {saveStatus}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-800 overflow-x-auto flex whitespace-nowrap scrollbar-hide">
        <nav className="flex space-x-2 p-1" aria-label="Tabs">
          {rounds.map(tab => {
            const unlocked = getTabUnlockedStatus(tab.id);
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                disabled={!unlocked}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4 rounded-lg font-medium text-sm transition-all duration-150 ${
                  active
                    ? "bg-green-600 text-white"
                    : unlocked
                    ? "text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
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
            {GROUPS.map(group => (
              <GroupCard
                key={group.name}
                groupName={group.name}
                teams={group.teams}
                selectedTeams={state.groups[group.name] || []}
                onSelectTeam={team => handleGroupSelect(group.name, team)}
                onSetQualifiers={handleSetGroupQualifiers}
              />
            ))}
          </div>
        )}

        {activeTab === "r32" && (
          <RoundColumn
            round="r32"
            roundTitle="Round of 32 (Predictions)"
            previousRoundTeams={getAvailableTeams(state, "r32")}
            selectedTeams={state.r32}
            onToggleTeam={team => handlePlayoffSelect("r32", team)}
          />
        )}

        {activeTab === "r16" && (
          <RoundColumn
            round="r16"
            roundTitle="Round of 16 (Predictions)"
            previousRoundTeams={getAvailableTeams(state, "r16")}
            selectedTeams={state.r16}
            onToggleTeam={team => handlePlayoffSelect("r16", team)}
          />
        )}

        {activeTab === "r8" && (
          <RoundColumn
            round="r8"
            roundTitle="Quarterfinals (Predictions)"
            previousRoundTeams={getAvailableTeams(state, "r8")}
            selectedTeams={state.r8}
            onToggleTeam={team => handlePlayoffSelect("r8", team)}
          />
        )}

        {activeTab === "semi" && (
          <RoundColumn
            round="semi"
            roundTitle="Semifinals (Predictions)"
            previousRoundTeams={getAvailableTeams(state, "semi")}
            selectedTeams={state.semi}
            onToggleTeam={team => handlePlayoffSelect("semi", team)}
          />
        )}

        {activeTab === "final" && (
          <RoundColumn
            round="final"
            roundTitle="Grand Final Prediction"
            previousRoundTeams={getAvailableTeams(state, "final")}
            selectedTeams={state.final}
            onToggleTeam={team => handlePlayoffSelect("final", team)}
          />
        )}

        {activeTab === "summary" && (
          <div className="space-y-6">
            <BracketSummary state={state} />

            {/* Export options */}
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
                  onChange={e => setUserName(e.target.value)}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm flex-1 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition duration-150"
                >
                  Export to JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
