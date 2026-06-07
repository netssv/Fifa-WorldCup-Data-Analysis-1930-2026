import { useState, useEffect } from "react";
import {
  BracketState,
  Round,
  INITIAL_STATE,
  ROUND_LIMITS,
  isRoundComplete,
  getAvailableTeams,
  cleanDependencies,
  getTabUnlockedStatus,
  applySimulationData
} from "../lib/bracketLogic";
import { saveBracket, loadBracket, exportBracket } from "../lib/bracketStore";
import { fetchFullBracketStreaming } from "../lib/apiClient";

export const useFifaBracket = () => {
  const [state, setState] = useState<BracketState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<Round | "summary" | "ai_lab">("groups");
  const [userName, setUserName] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [chaosFactor, setChaosFactor] = useState<number>(0.0);
  const [boostTeam, setBoostTeam] = useState<string>("");
  const [boostAmount, setBoostAmount] = useState<number>(0);
  const [simRuns, setSimRuns] = useState<number>(1);
  // Global model calibrator toggles — apply to all predictions and tournament sims
  const [useGoldman, setUseGoldman] = useState<boolean>(true);
  const [useKlement, setUseKlement] = useState<boolean>(true);
  const [winProbs, setWinProbs] = useState<Record<string, number> | null>(null);
  const [teamStats, setTeamStats] = useState<Record<string, { avg_goals_scored: number; avg_goals_conceded: number; avg_goal_diff: number }> | null>(null);
  const [simRunsTotal, setSimRunsTotal] = useState<number>(1);
  const [lastSimScope, setLastSimScope] = useState<Round | "all">("all");
  // Real-time simulation progress from SSE stream
  const [simProgress, setSimProgress] = useState<{ current: number; total: number }>({ current: 0, total: 1 });

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

  const handleGroupSelect = (groupName: string, teamName: string) => {
    setState(prev => {
      const current = prev.groups[groupName] || [];
      let updated: string[];

      if (current.includes(teamName)) {
        updated = current.filter(t => t !== teamName);
      } else {
        if (current.length >= 2) return prev;
        updated = [...current, teamName];
      }

      const newState = {
        ...prev,
        groups: { ...prev.groups, [groupName]: updated }
      };
      return cleanDependencies(newState);
    });
  };

  const handleSetGroupQualifiers = (groupName: string, teamNames: string[]) => {
    setState(prev => {
      const newState = {
        ...prev,
        groups: { ...prev.groups, [groupName]: teamNames }
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

  const handleAiAutoFill = (selectedScope: Round | "all" = "all") => {
    setLastSimScope(selectedScope);
    setAiLoading(true);
    setWinProbs(null);
    setSimProgress({ current: 0, total: simRuns });

    fetchFullBracketStreaming(
      chaosFactor,
      boostTeam || undefined,
      boostAmount || undefined,
      simRuns,
      selectedScope,
      useGoldman,
      useKlement,
      {
        onProgress: (current, total) => {
          setSimProgress({ current, total });
        },
        onResult: (data) => {
          if (data.win_probabilities && Object.keys(data.win_probabilities).length > 0) {
            setWinProbs(data.win_probabilities);
            setSimRunsTotal(simRuns);
          } else {
            setWinProbs(null);
          }
          setTeamStats(data.team_stats || null);
          setState(prev => applySimulationData(prev, data, selectedScope));
          setAiLoading(false);
        },
        onError: (err) => {
          console.error("AI Auto-Fill stream error:", err);
          alert("Failed to fetch AI bracket predictions. Make sure the API is running.");
          setAiLoading(false);
        },
      }
    );
  };

  const checkTabUnlocked = (tabId: Round | "summary" | "ai_lab"): boolean => {
    return getTabUnlockedStatus(state, tabId);
  };

  const roundKeys: Round[] = ["groups", "r32", "r16", "r8", "semi", "final"];
  const completedRoundsCount = roundKeys.filter(r => isRoundComplete(state, r)).length;

  return {
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
    getTabUnlockedStatus: checkTabUnlocked,
    chaosFactor,
    setChaosFactor,
    boostTeam,
    setBoostTeam,
    boostAmount,
    setBoostAmount,
    simRuns,
    setSimRuns,
    useGoldman,
    setUseGoldman,
    useKlement,
    setUseKlement,
    winProbs,
    teamStats,
    simRunsTotal,
    lastSimScope,
    simProgress,
  };
};
