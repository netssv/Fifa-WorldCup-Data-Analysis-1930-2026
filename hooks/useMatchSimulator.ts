import { useState, useCallback } from "react";
import { TEAM_FLAGS, TEAM_STATS } from "../lib/bracketData";
import { predictMatch, fetchTeamPath, MatchPrediction, Stage, MatchOverrides } from "../lib/apiClient";

const SORTED_TEAM_NAMES = Object.keys(TEAM_FLAGS).sort();

export const useMatchSimulator = () => {
  const [teamA, setTeamA] = useState<string>("Brazil");
  const [teamB, setTeamB] = useState<string>("Argentina");
  const [stage, setStage] = useState<Stage>("group");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<MatchPrediction | null>(null);
  const [simulationError, setSimulationError] = useState<string>("");

  // Custom AI Overrides States
  const [customEnabled, setCustomEnabled] = useState<boolean>(false);
  const [eloA, setEloA] = useState<number>(1800);
  const [eloB, setEloB] = useState<number>(1800);
  const [formA, setFormA] = useState<number>(0.5);
  const [formB, setFormB] = useState<number>(0.5);
  const [penaltyA, setPenaltyA] = useState<number>(0.5);
  const [penaltyB, setPenaltyB] = useState<number>(0.5);
  const [bigMatchA, setBigMatchA] = useState<number>(0.5);
  const [bigMatchB, setBigMatchB] = useState<number>(0.5);
  const [knockoutA, setKnockoutA] = useState<number>(0.5);
  const [knockoutB, setKnockoutB] = useState<number>(0.5);
  const [isAutoFilling, setIsAutoFilling] = useState<boolean>(false);
  const [autoFillError, setAutoFillError] = useState<string>("");

  /** Fetch real AI values for both teams and populate all sliders */
  const autoFillFromApi = useCallback(async () => {
    setIsAutoFilling(true);
    setAutoFillError("");
    try {
      const [dataA, dataB] = await Promise.all([
        fetchTeamPath(teamA),
        fetchTeamPath(teamB),
      ]);

      // ELO from static stats as fallback, or api data
      const statsA = TEAM_STATS[teamA];
      const statsB = TEAM_STATS[teamB];
      setEloA(dataA.elo ?? statsA?.elo ?? 1500);
      setEloB(dataB.elo ?? statsB?.elo ?? 1500);

      // Form from API (path.qualify_from_group is a good proxy, clamped 0.3–0.9)
      setFormA(Math.min(0.9, Math.max(0.3, dataA.form)));
      setFormB(Math.min(0.9, Math.max(0.3, dataB.form)));

      // Pressure: derive from tournament path probabilities
      // penalty ≈ reach_final / reach_semifinals (clutch factor)
      const safeDivA = (dataA.path.reach_final ?? 0) / Math.max(dataA.path.reach_semifinals ?? 0.01, 0.01);
      const safeDivB = (dataB.path.reach_final ?? 0) / Math.max(dataB.path.reach_semifinals ?? 0.01, 0.01);
      setPenaltyA(Math.min(0.9, Math.max(0.3, safeDivA * 0.7)));
      setPenaltyB(Math.min(0.9, Math.max(0.3, safeDivB * 0.7)));

      // Big match ≈ reach_quarterfinals (shows ability in big games)
      setBigMatchA(Math.min(0.85, Math.max(0.2, dataA.path.reach_quarterfinals * 2)));
      setBigMatchB(Math.min(0.85, Math.max(0.2, dataB.path.reach_quarterfinals * 2)));

      // Knockout ≈ win_tournament (overall clutch)
      setKnockoutA(Math.min(0.85, Math.max(0.2, dataA.path.win_tournament * 4)));
      setKnockoutB(Math.min(0.85, Math.max(0.2, dataB.path.win_tournament * 4)));

      // Enable overrides so the user sees the values
      setCustomEnabled(true);
    } catch {
      setAutoFillError("Auto-fill failed: API unreachable. Make sure the server is running on port 8000.");
    } finally {
      setIsAutoFilling(false);
    }
  }, [teamA, teamB]);

  const runSimulation = async () => {
    if (teamA === teamB) {
      setSimulationError("Please select two different teams to simulate.");
      return;
    }
    setSimulationError("");
    setIsSimulating(true);
    try {
      const overrides: MatchOverrides = customEnabled
        ? {
            elo_a_override: eloA, elo_b_override: eloB,
            form_a_override: formA, form_b_override: formB,
            penalty_a_override: penaltyA, penalty_b_override: penaltyB,
            big_match_a_override: bigMatchA, big_match_b_override: bigMatchB,
            knockout_a_override: knockoutA, knockout_b_override: knockoutB,
          }
        : {};
      const prediction = await predictMatch(teamA, teamB, stage, overrides);
      setSimulationResult(prediction);
    } catch (err) {
      console.error(err);
      setSimulationError("Failed to run prediction. Make sure the API server is active on port 8000.");
    } finally {
      setIsSimulating(false);
    }
  };

  return {
    teamA, setTeamA, teamB, setTeamB,
    stage, setStage,
    isSimulating, simulationResult, simulationError, runSimulation,
    availableTeams: SORTED_TEAM_NAMES,
    customEnabled, setCustomEnabled,
    eloA, setEloA, eloB, setEloB,
    formA, setFormA, formB, setFormB,
    penaltyA, setPenaltyA, penaltyB, setPenaltyB,
    bigMatchA, setBigMatchA, bigMatchB, setBigMatchB,
    knockoutA, setKnockoutA, knockoutB, setKnockoutB,
    isAutoFilling, autoFillError, autoFillFromApi,
  };
};
