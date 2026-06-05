import { GROUPS } from "./bracketData";

export type Round = 'groups' | 'r32' | 'r16' | 'r8' | 'semi' | 'final';

export interface BracketState {
  groups: Record<string, string[]>; // group name -> 2 selected teams
  r32: string[];                    // 16 teams
  r16: string[];                    // 8 teams
  r8: string[];                     // 4 teams
  semi: string[];                    // 2 teams
  final: string;                    // 1 winner
}

export const INITIAL_STATE: BracketState = {
  groups: {},
  r32: [],
  r16: [],
  r8: [],
  semi: [],
  final: ""
};

export const ROUND_LIMITS: Record<Exclude<Round, 'groups'>, number> = {
  r32: 16,
  r16: 8,
  r8: 4,
  semi: 2,
  final: 1
};

export const ROUND_POINTS: Record<Round, number> = {
  groups: 1,
  r32: 2,
  r16: 4,
  r8: 6,
  semi: 8,
  final: 10
};

export function isRoundComplete(state: BracketState, round: Round): boolean {
  if (round === 'groups') {
    // There must be 12 groups, and each must have exactly 2 selections
    return GROUPS.every(g => (state.groups[g.name] || []).length === 2);
  }
  if (round === 'final') {
    return !!state.final;
  }
  return state[round].length === ROUND_LIMITS[round];
}

export function getAvailableTeams(state: BracketState, round: Round): string[] {
  if (round === 'groups') {
    return GROUPS.flatMap(g => g.teams);
  }
  if (round === 'r32') {
    return Object.values(state.groups).flat();
  }
  if (round === 'r16') {
    return state.r32;
  }
  if (round === 'r8') {
    return state.r16;
  }
  if (round === 'semi') {
    return state.r8;
  }
  if (round === 'final') {
    return state.semi;
  }
  return [];
}

export function canSelectTeam(team: string, round: Round, state: BracketState): boolean {
  if (round === 'groups') {
    return true;
  }
  const available = getAvailableTeams(state, round);
  return available.includes(team);
}

export function calculateMaxPoints(state: BracketState): number {
  let points = 0;
  
  // Groups: 1pt per selected team
  const groupTeamsCount = Object.values(state.groups).flat().length;
  points += groupTeamsCount * ROUND_POINTS.groups;
  
  // Playoff rounds
  points += state.r32.length * ROUND_POINTS.r32;
  points += state.r16.length * ROUND_POINTS.r16;
  points += state.r8.length * ROUND_POINTS.r8;
  points += state.semi.length * ROUND_POINTS.semi;
  if (state.final) {
    points += 1 * ROUND_POINTS.final;
  }
  
  return points;
}

export function cleanDependencies(state: BracketState): BracketState {
  const cleanState = { ...state };
  const groupTeams = Object.values(cleanState.groups).flat();
  cleanState.r32 = cleanState.r32.filter(t => groupTeams.includes(t));
  cleanState.r16 = cleanState.r16.filter(t => cleanState.r32.includes(t));
  cleanState.r8 = cleanState.r8.filter(t => cleanState.r16.includes(t));
  cleanState.semi = cleanState.semi.filter(t => cleanState.r8.includes(t));
  if (cleanState.final && !cleanState.semi.includes(cleanState.final)) {
    cleanState.final = "";
  }
  return cleanState;
}

export function getTabUnlockedStatus(state: BracketState, tabId: Round | "summary" | "ai_lab"): boolean {
  if (tabId === "groups") return true;
  if (tabId === "r32") return isRoundComplete(state, "groups");
  if (tabId === "r16") return isRoundComplete(state, "r32") && getTabUnlockedStatus(state, "r32");
  if (tabId === "r8") return isRoundComplete(state, "r16") && getTabUnlockedStatus(state, "r16");
  if (tabId === "semi") return isRoundComplete(state, "r8") && getTabUnlockedStatus(state, "r8");
  if (tabId === "final") return isRoundComplete(state, "semi") && getTabUnlockedStatus(state, "semi");
  if (tabId === "summary" || tabId === "ai_lab") return true;
  return false;
}

export function padArray(arr: string[], len: number): string[] {
  const padded = [...arr];
  while (padded.length < len) padded.push("");
  return padded;
}


