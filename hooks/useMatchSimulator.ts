import { useState } from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
import { predictMatch, MatchPrediction, Stage } from "../lib/apiClient";

const SORTED_TEAM_NAMES = Object.keys(TEAM_FLAGS).sort();

export const useMatchSimulator = () => {
  const [teamA, setTeamA] = useState<string>("Brazil");
  const [teamB, setTeamB] = useState<string>("Argentina");
  const [stage, setStage] = useState<Stage>("group");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<MatchPrediction | null>(null);
  const [simulationError, setSimulationError] = useState<string>("");

  const runSimulation = async () => {
    if (teamA === teamB) {
      setSimulationError("Please select two different teams to simulate.");
      return;
    }
    setSimulationError("");
    setIsSimulating(true);
    try {
      const prediction = await predictMatch(teamA, teamB, stage);
      setSimulationResult(prediction);
    } catch (err) {
      console.error(err);
      setSimulationError(
        "Failed to run prediction. Make sure the API server is active on port 8000."
      );
    } finally {
      setIsSimulating(false);
    }
  };

  return {
    teamA,
    setTeamA,
    teamB,
    setTeamB,
    stage,
    setStage,
    isSimulating,
    simulationResult,
    simulationError,
    runSimulation,
    availableTeams: SORTED_TEAM_NAMES,
  };
};
