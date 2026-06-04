import { useState, useEffect } from "react";
import { fetchFullBracket } from "../lib/apiClient";

/** Returns a map of teamName → championship win probability (0–1), fetched once. */
export const useTeamWinProbs = (): Record<string, number> => {
  const [probs, setProbs] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchFullBracket()
      .then((data) => {
        if (data?.win_probabilities) setProbs(data.win_probabilities);
      })
      .catch(() => {/* silently ignore — probabilities are optional UI enhancement */});
  }, []);

  return probs;
};
