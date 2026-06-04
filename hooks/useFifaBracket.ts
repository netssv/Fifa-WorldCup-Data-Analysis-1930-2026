import { useState, useEffect } from "react";
import {
  BracketState,
  Round,
  INITIAL_STATE,
  ROUND_LIMITS,
  isRoundComplete,
  getAvailableTeams
} from "../lib/bracketLogic";
import { saveBracket, loadBracket, exportBracket } from "../lib/bracketStore";
import { fetchFullBracket } from "../lib/apiClient";

export const useFifaBracket = () => {
  const [state, setState] = useState<BracketState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<Round | "summary" | "ai_lab">("groups");
  const [userName, setUserName] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

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

  const cleanDependencies = (newState: BracketState): BracketState => {
    const cleanState = { ...newState };
    const groupTeams = Object.values(cleanState.groups).flat();
    cleanState.r32 = cleanState.r32.filter(t => groupTeams.includes(t));
    cleanState.r16 = cleanState.r16.filter(t => cleanState.r32.includes(t));
    cleanState.r8 = cleanState.r8.filter(t => cleanState.r16.includes(t));
    cleanState.semi = cleanState.semi.filter(t => cleanState.r8.includes(t));
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

  const getTabUnlockedStatus = (tabId: Round | "summary" | "ai_lab"): boolean => {
    if (tabId === "groups") return true;
    if (tabId === "r32") return isRoundComplete(state, "groups");
    if (tabId === "r16") return isRoundComplete(state, "r32") && getTabUnlockedStatus("r32");
    if (tabId === "r8") return isRoundComplete(state, "r16") && getTabUnlockedStatus("r16");
    if (tabId === "semi") return isRoundComplete(state, "r8") && getTabUnlockedStatus("r8");
    if (tabId === "final") return isRoundComplete(state, "semi") && getTabUnlockedStatus("semi");
    if (tabId === "summary") return true;
    if (tabId === "ai_lab") return true;
    return false;
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
    getTabUnlockedStatus
  };
};
