import {
  Stage,
  MatchPrediction,
  GroupPrediction,
  FullBracket,
  MatchOverrides,
  TeamPathPrediction,
  StreamCallbacks,
} from "./apiTypes";

export * from "./apiTypes";

const getApiUrl = (): string => {
  // 1st priority: explicit env var (always use this in production/Vercel)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl;
  }
  // 2nd priority (browser-only): derive from current hostname for local network dev
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // If it's a real IP or local domain (not localhost), use port 8000 on same host
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:8000`;
    }
  }
  // 3rd priority: localhost fallback
  return envUrl ?? "http://localhost:8000";
};

const API_BASE = getApiUrl();

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
  stage: Stage = "group",
  overrides?: MatchOverrides
): Promise<MatchPrediction> =>
  post<MatchPrediction>("/predict/match", { team_a, team_b, stage, ...overrides });

export const predictGroup = (
  group_name: string,
  teams: string[]
): Promise<GroupPrediction> =>
  post<GroupPrediction>("/predict/group", { group_name, teams });

export interface DataSourceStatus {
  loaded: boolean;
  teams: number;
  label: string;
}
export interface DataSourcesResponse {
  squad_value: DataSourceStatus;
  ea_fc_ratings: DataSourceStatus;
  xg_stats: DataSourceStatus;
  market_odds: DataSourceStatus;
  coach_exp: DataSourceStatus;
  fatigue: DataSourceStatus;
  pressure: DataSourceStatus;
  models_loaded: boolean;
}
export const fetchDataSources = (): Promise<DataSourcesResponse> =>
  get<DataSourcesResponse>("/data-sources");

export const fetchFullBracket = (
  chaosFactor?: number,
  boostTeam?: string,
  boostAmount?: number,
  simRuns?: number,
  scope?: string,
  useGoldman: boolean = true,
  useKlement: boolean = true,
): Promise<FullBracket> => {
  const params = new URLSearchParams();
  if (chaosFactor !== undefined) params.append("chaos_factor", String(chaosFactor));
  if (boostTeam) params.append("boost_team", boostTeam);
  if (boostAmount !== undefined) params.append("boost_amount", String(boostAmount));
  if (simRuns !== undefined) params.append("sim_runs", String(simRuns));
  if (scope && scope !== "all") params.append("scope", scope);
  params.append("use_goldman", String(useGoldman));
  params.append("use_klement", String(useKlement));
  const query = params.toString() ? `?${params.toString()}` : "";
  return get<FullBracket>(`/predict/bracket/full${query}`);
};

export const fetchTeamPath = (team: string): Promise<TeamPathPrediction> =>
  post<TeamPathPrediction>("/predict/team-path", { team });

// ── Streaming (SSE) bracket fetch ─────────────────────────────────────
export function fetchFullBracketStreaming(
  chaosFactor: number = 0,
  boostTeam: string | undefined,
  boostAmount: number = 0,
  simRuns: number = 1,
  scope: string = "all",
  useGoldman: boolean = true,
  useKlement: boolean = true,
  callbacks: StreamCallbacks,
): () => void {
  const params = new URLSearchParams();
  if (chaosFactor) params.append("chaos_factor", String(chaosFactor));
  if (boostTeam)   params.append("boost_team", boostTeam);
  if (boostAmount) params.append("boost_amount", String(boostAmount));
  params.append("sim_runs", String(simRuns));
  if (scope && scope !== "all") params.append("scope", scope);
  params.append("use_goldman", String(useGoldman));
  params.append("use_klement", String(useKlement));

  const url = `${API_BASE}/predict/bracket/stream?${params.toString()}`;
  let cancelled = false;

  (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Stream API error: ${response.status}`);
      if (!response.body) throw new Error("No response body for SSE stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const json = trimmed.slice(5).trim();
          if (!json) continue;

          try {
            const event = JSON.parse(json);
            if (event.type === "progress") {
              callbacks.onProgress(event.current, event.total);
            } else if (event.type === "result") {
              callbacks.onResult(event as FullBracket);
            }
          } catch {
            // Ignore malformed JSON lines
          }
        }
      }

      reader.cancel();
    } catch (err) {
      if (!cancelled) {
        callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  })();

  return () => { cancelled = true; };
}
