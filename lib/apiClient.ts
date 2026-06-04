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
    {
      qualifiers: [string, string];
      probs: Record<string, number>;
      match_probs: Record<string, { win_a: number; draw: number; win_b: number }>;
    }
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
export const predictMatch = (
  team_a: string,
  team_b: string,
  stage: Stage = "group"
): Promise<MatchPrediction> =>
  post<MatchPrediction>("/predict/match", { team_a, team_b, stage });

export const predictGroup = (
  group_name: string,
  teams: string[]
): Promise<GroupPrediction> =>
  post<GroupPrediction>("/predict/group", { group_name, teams });

export const fetchFullBracket = (): Promise<FullBracket> =>
  get<FullBracket>("/predict/bracket/full");
