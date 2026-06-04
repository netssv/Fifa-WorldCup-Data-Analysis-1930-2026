"""
src/ingestion_odds.py
─────────────────────────────────────────────────────────────────────
FEATURE SET 5 — Market Odds (The Odds API)
"""

from __future__ import annotations

import json
import os
import time
import requests
import numpy as np
import pandas as pd

from src.odds_constants import (
    RAW_ODDS_PATH,
    PROCESSED_ODDS_PATH,
    ODDS_API_BASE,
    SPORT_KEY,
    DEFAULT_REGIONS,
    DEFAULT_MARKETS,
    MISSING_ODDS,
    TOURNAMENT_TEAMS,
)
from src.odds_helpers import (
    find_event,
    extract_features_from_event,
    build_team_odds_features,
)


def fetch_match_odds(team_a: str, team_b: str, api_key: str) -> dict:
    """
    Fetch live h2h odds for a single match from The Odds API.
    """
    url = f"{ODDS_API_BASE}/v4/sports/{SPORT_KEY}/odds"
    params = {
        "apiKey": api_key,
        "regions": DEFAULT_REGIONS,
        "markets": DEFAULT_MARKETS,
        "oddsFormat": "decimal",
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as exc:
        print(f"[WARN] Odds API request failed: {exc}")
        return MISSING_ODDS.copy()

    all_matches: list[dict] = response.json()

    # Find the specific match among returned events
    matched_event = find_event(all_matches, team_a, team_b)
    if matched_event is None:
        print(f"[WARN] No odds found for {team_a} vs {team_b}")
        return MISSING_ODDS.copy()

    return extract_features_from_event(matched_event, team_a)


def fetch_all_tournament_odds(api_key: str) -> list[dict]:
    """
    Fetch all available odds for the FIFA World Cup tournament
    and save the raw response.
    """
    url = f"{ODDS_API_BASE}/v4/sports/{SPORT_KEY}/odds"
    params = {
        "apiKey": api_key,
        "regions": DEFAULT_REGIONS,
        "markets": DEFAULT_MARKETS,
        "oddsFormat": "decimal",
    }

    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        all_events: list[dict] = response.json()
    except requests.exceptions.RequestException as exc:
        print(f"[WARN] Odds API request failed: {exc}")
        return []

    # Persist raw data
    RAW_ODDS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(RAW_ODDS_PATH, "w", encoding="utf-8") as file_handle:
        json.dump(
            {"fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "events": all_events},
            file_handle,
            indent=2,
        )

    print(f"[INFO] Saved {len(all_events)} events → {RAW_ODDS_PATH}")
    return all_events


def generate_mock_odds_features(team_names: list[str]) -> pd.DataFrame:
    """
    Generate realistic synthetic odds features when The Odds API is unavailable.
    """
    np.random.seed(42)
    total_teams = len(team_names)

    rows = []
    for rank_index, team_name in enumerate(team_names):
        strength_factor = 1 - (rank_index / total_teams)

        implied_home_win_avg = float(np.clip(np.random.normal(0.40 + strength_factor * 0.25, 0.05), 0.20, 0.75))
        implied_away_win_avg = float(np.clip(np.random.normal(0.30 - strength_factor * 0.10, 0.04), 0.10, 0.55))
        implied_draw_avg = round(1.0 - implied_home_win_avg - implied_away_win_avg, 4)
        implied_draw_avg = float(np.clip(implied_draw_avg, 0.05, 0.45))

        rows.append({
            "team_name": team_name,
            "implied_home_win_avg": round(implied_home_win_avg, 4),
            "implied_away_win_avg": round(implied_away_win_avg, 4),
            "implied_draw_avg": round(implied_draw_avg, 4),
            "market_confidence_avg": round(float(np.random.uniform(0.6, 0.9)), 4),
            "odds_margin_avg": round(float(np.random.uniform(0.04, 0.09)), 4),
        })

    return pd.DataFrame(rows)


def main(api_key: str | None = None) -> None:
    """
    Run the full odds ingestion pipeline.
    """
    resolved_key = api_key or os.environ.get("ODDS_API_KEY", "")

    if resolved_key:
        print(f"[INFO] Fetching live odds from The Odds API...")
        events = fetch_all_tournament_odds(resolved_key)
        if events:
            df_odds = build_team_odds_features(events)
        else:
            print("[WARN] No events returned. Falling back to mock data.")
            df_odds = generate_mock_odds_features(TOURNAMENT_TEAMS)
    else:
        print("[INFO] No API key found. Generating mock odds features.")
        df_odds = generate_mock_odds_features(TOURNAMENT_TEAMS)

    PROCESSED_ODDS_PATH.parent.mkdir(parents=True, exist_ok=True)
    df_odds.to_csv(PROCESSED_ODDS_PATH, index=False)
    print(f"[INFO] Odds features saved → {PROCESSED_ODDS_PATH} ({len(df_odds)} teams)")


if __name__ == "__main__":
    main()
