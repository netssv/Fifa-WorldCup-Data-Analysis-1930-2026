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
