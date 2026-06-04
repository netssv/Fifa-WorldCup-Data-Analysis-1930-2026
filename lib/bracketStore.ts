import { BracketState, INITIAL_STATE } from "./bracketLogic";

const STORAGE_KEY = "fifa2026_bracket";

export function saveBracket(state: BracketState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving bracket state to localStorage:", error);
  }
}

export function loadBracket(): BracketState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading bracket state from localStorage:", error);
  }
  return INITIAL_STATE;
}

export interface ExportedPredictions {
  userName: string;
  predictions: BracketState;
  savedAt: string;
}

export function exportBracket(userName: string, state: BracketState): void {
  const exportData: ExportedPredictions = {
    userName: userName || "Anonymous",
    predictions: state,
    savedAt: new Date().toISOString()
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportData, null, 2)
  )}`;
  
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", `fifa_wc2026_predictions_${exportData.userName.toLowerCase().replace(/\s+/g, "_")}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
