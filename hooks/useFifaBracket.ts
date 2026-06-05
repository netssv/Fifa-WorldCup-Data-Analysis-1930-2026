import { useState, useEffect } from "react";
import {
  BracketState,
  Round,
  INITIAL_STATE,
  ROUND_LIMITS,
  isRoundComplete,
  getAvailableTeams,
  cleanDependencies,
  getTabUnlockedStatus
} from "../lib/bracketLogic";
import { saveBracket, loadBracket, exportBracket } from "../lib/bracketStore";
import { fetchFullBracket } from "../lib/apiClient";

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
  const [winProbs, setWinProbs] = useState<Record<string, number> | null>(null);
  const [simRunsTotal, setSimRunsTotal] = useState<number>(1);

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

  const handleAiAutoFill = async (upToRound: Round | "all" = "all") => {
    try {
      setAiLoading(true);
      setWinProbs(null);
      const data = await fetchFullBracket(
        chaosFactor,
        boostTeam || undefined,
        boostAmount || undefined,
        simRuns
      );
      if (data) {
        if (data.win_probabilities && Object.keys(data.win_probabilities).length > 0) {
          setWinProbs(data.win_probabilities);
          setSimRunsTotal(simRuns);
        }

        setState(prev => {
          const groups: Record<string, string[]> = { ...prev.groups };
          if (upToRound === "all" || upToRound === "groups" || ["r32", "r16", "r8", "semi", "final"].includes(upToRound)) {
            for (const [groupName, groupData] of Object.entries(data.groups)) {
              groups[groupName] = Array.isArray(groupData)
                ? groupData
                : (groupData as any).qualifiers || [];
            }
          }

          const newState = {
            ...prev,
            groups,
            r32: (upToRound === "all" || ["r32", "r16", "r8", "semi", "final"].includes(upToRound)) ? data.r32 : prev.r32,
            r16: (upToRound === "all" || ["r16", "r8", "semi", "final"].includes(upToRound)) ? data.r16 : prev.r16,
            r8: (upToRound === "all" || ["r8", "semi", "final"].includes(upToRound)) ? data.r8 : prev.r8,
            semi: (upToRound === "all" || ["semi", "final"].includes(upToRound)) ? data.semi : prev.semi,
            final: (upToRound === "all" || upToRound === "final") ? data.final : prev.final
          };

          return cleanDependencies(newState);
        });
      }
    } catch (err) {
      console.error("AI Auto-Fill error:", err);
      alert("Failed to fetch AI bracket predictions. Make sure the API is running.");
    } finally {
      setAiLoading(false);
    }
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
    winProbs,
    simRunsTotal,
  };
};
