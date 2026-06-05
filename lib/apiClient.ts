const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Stage = "group" | "r32" | "r16" | "r8" | "semi" | "final";

// ── Types ─────────────────────────────────────────────────────────────
export interface MatchPrediction {
  team_a: string;
  team_b: string;
  team_a_win_prob: number;
  draw_prob: number;
  team_b_win_prob: number;
  predicted_winner: string;
  confidence: "high" | "medium" | "low";
  confidence_score: number;
  goals_a?: number;
  goals_b?: number;
  model_features: {
    elo_diff: number;
    team_a_form: number;
    team_b_form: number;
    h2h_wins_a: number;
  };
}

export interface GroupRanking {
  team: string;
  qualify_prob: number;
  rank: number;
}

export interface GroupPrediction {
  group: string;
  rankings: GroupRanking[];
  suggested_qualifiers: [string, string];
}

export interface FullBracket {
  groups: Record<
    string,
    | {
        qualifiers: [string, string];
        probs: Record<string, number>;
        match_probs: Record<string, { win_a: number; draw: number; win_b: number }>;
      }
    | string[]
  >;
  r32: string[];
  r16: string[];
  r8: string[];
  semi: string[];
  final: string;
  win_probabilities: Record<string, number>;
}

// ── Fetch helpers ─────────────────────────────────────────────────────
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} error: ${res.status}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} error: ${res.status}`);
  return res.json();
}

// ── Public API ────────────────────────────────────────────────────────
export interface MatchOverrides {
  elo_a_override?: number;
  elo_b_override?: number;
  form_a_override?: number;
  form_b_override?: number;
  penalty_a_override?: number;
  penalty_b_override?: number;
  big_match_a_override?: number;
  big_match_b_override?: number;
  knockout_a_override?: number;
  knockout_b_override?: number;
}

export const predictMatch = (
  team_a: string,
  team_b: string,
  stage: Stage = "group",
  overrides?: MatchOverrides
): Promise<MatchPrediction> =>
  post<MatchPrediction>("/predict/match", { team_a, team_b, stage, ...overrides });

export const predictGroup = (
  group_name: string,
  teams: string[]
): Promise<GroupPrediction> =>
  post<GroupPrediction>("/predict/group", { group_name, teams });

export const fetchFullBracket = (
  chaosFactor?: number,
  boostTeam?: string,
  boostAmount?: number,
  simRuns?: number
): Promise<FullBracket> => {
  const params = new URLSearchParams();
  if (chaosFactor !== undefined) params.append("chaos_factor", String(chaosFactor));
  if (boostTeam) params.append("boost_team", boostTeam);
  if (boostAmount !== undefined) params.append("boost_amount", String(boostAmount));
  if (simRuns !== undefined) params.append("sim_runs", String(simRuns));
  const query = params.toString() ? `?${params.toString()}` : "";
  return get<FullBracket>(`/predict/bracket/full${query}`);
};

export interface TeamPathPrediction {
  team: string;
  group: string;
  elo: number;
  form: number;
  path: {
    qualify_from_group: number;
    reach_r16: number;
    reach_quarterfinals: number;
    reach_semifinals: number;
    reach_final: number;
    win_tournament: number;
  };
}

export const fetchTeamPath = (team: string): Promise<TeamPathPrediction> =>
  post<TeamPathPrediction>("/predict/team-path", { team });
