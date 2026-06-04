"""
src/ingestion_coaches.py
──────────────────────────────────────────────────────────────────────
FEATURE SET 6 — Coach Experience

Source : data/coaches_wc2026.json  (hardcoded, update manually)

Per-team raw fields:
  wc_editions           — number of World Cups coached as head coach
  intl_win_rate         — international win rate (0.0–1.0)
  knockout_experience   — bool: has coached a WC knockout match
  tournament_wins       — major trophies (WC + continental) as head coach

Per-match derived features (5 total):
  coach_wc_editions      — home team coach's WC edition count
  coach_intl_win_rate    — home team coach's international win rate
  coach_experience_diff  — home coach WC editions − away coach WC editions
  coach_knockout_edge    — home knockout (0/1) − away knockout (0/1)
  coach_tournament_wins  — home team coach's total tournament wins
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

COACHES_JSON_PATH = Path("data/coaches_wc2026.json")

# ─────────────────────────────────────────────
# Fallback for unknown teams (relegation-zone defaults)
# ─────────────────────────────────────────────
_DEFAULT_COACH_STATS = {
    "wc_editions": 0,
    "intl_win_rate": 0.45,
    "knockout_experience": False,
    "tournament_wins": 0,
}


def load_coaches(json_path: str | Path = COACHES_JSON_PATH) -> dict[str, dict]:
    """
    Load the coach data JSON and return a clean dict keyed by team name.
    Strips the _metadata key before returning.
    """
    path = Path(json_path)
    if not path.exists():
        raise FileNotFoundError(
            f"Coach data not found at {path}. "
            "Create data/coaches_wc2026.json before running."
        )

    with open(path, encoding="utf-8") as file_handle:
        raw = json.load(file_handle)

    # Remove the metadata annotation — not a team
    return {team: stats for team, stats in raw.items() if not team.startswith("_")}


def get_coach_stats(team_name: str, coaches: dict[str, dict]) -> dict:
    """Return coach stats for a team, falling back to league-average defaults."""
    return coaches.get(team_name, _DEFAULT_COACH_STATS)


def build_coach_features(
    df_matches: pd.DataFrame,
    home_col: str = "home_team",
    away_col: str = "away_team",
    json_path: str | Path = COACHES_JSON_PATH,
) -> pd.DataFrame:
    """
    Compute the 5 coach-experience features for every row in df_matches.

    Returns a DataFrame with columns:
        coach_wc_editions, coach_intl_win_rate,
        coach_experience_diff, coach_knockout_edge, coach_tournament_wins
    """
    coaches = load_coaches(json_path)

    rows = []
    for _, match_row in df_matches.iterrows():
        home_coach = get_coach_stats(match_row[home_col], coaches)
        away_coach = get_coach_stats(match_row[away_col], coaches)

        # Knockout experience as a numeric signal (1 = experienced, 0 = not)
        home_knockout_numeric = 1 if home_coach["knockout_experience"] else 0
        away_knockout_numeric = 1 if away_coach["knockout_experience"] else 0

        rows.append({
            # Home coach absolute value features
            "coach_wc_editions": home_coach["wc_editions"],
            "coach_intl_win_rate": home_coach["intl_win_rate"],
            "coach_tournament_wins": home_coach["tournament_wins"],
            # Relative features — how much better/worse vs the opponent's coach
            "coach_experience_diff": home_coach["wc_editions"] - away_coach["wc_editions"],
            "coach_knockout_edge": home_knockout_numeric - away_knockout_numeric,
        })

    return pd.DataFrame(rows, index=df_matches.index)


def main() -> None:
    """
    Validate that the JSON loads and prints a summary of all coaches.
    Run directly: python -m src.ingestion_coaches
    """
    coaches = load_coaches()
    print(f"[INFO] Loaded coach data for {len(coaches)} teams\n")

    # Pretty-print a sorted summary
    sorted_teams = sorted(
        coaches.items(),
        key=lambda item: (item[1]["wc_editions"], item[1]["tournament_wins"]),
        reverse=True,
    )

    header = f"{'Team':<30} {'Coach':<25} {'WC':<4} {'Win%':<6} {'KO':<5} {'Trophies'}"
    print(header)
    print("─" * len(header))
    for team, stats in sorted_teams:
        ko_flag = "Yes" if stats["knockout_experience"] else "No"
        print(
            f"{team:<30} {stats['coach']:<25} "
            f"{stats['wc_editions']:<4} {stats['intl_win_rate']:<6.2f} "
            f"{ko_flag:<5} {stats['tournament_wins']}"
        )


if __name__ == "__main__":
    main()
