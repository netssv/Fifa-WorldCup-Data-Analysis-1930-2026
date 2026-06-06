export type Stage = "group" | "r32" | "r16" | "r8" | "semi" | "final";

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
  team_stats?: Record<
    string,
    {
      avg_goals_scored: number;
      avg_goals_conceded: number;
      avg_goal_diff: number;
    }
  >;
}

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

export interface StreamCallbacks {
  /** Called after each completed simulation run */
  onProgress: (current: number, total: number) => void;
  /** Called once with the final bracket result */
  onResult: (result: FullBracket) => void;
  /** Called if the stream encounters an error */
  onError?: (err: Error) => void;
}
