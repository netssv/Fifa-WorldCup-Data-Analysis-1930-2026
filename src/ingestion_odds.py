"""
src/ingestion_odds.py
─────────────────────────────────────────────────────────────────────
FEATURE SET 5 — Market Odds (The Odds API)

Source  : https://the-odds-api.com/
Endpoint: GET /v4/sports/soccer_fifa_world_cup/odds
Params  : regions=eu, markets=h2h, oddsFormat=decimal

Derived features per match-pair:
  implied_prob_home   — implied probability of home win (vig-free)
  implied_prob_draw   — implied probability of draw
  implied_prob_away   — implied probability of away win
  market_confidence   — inverse of bookie disagreement (std across books)
  books_count         — number of bookmakers sampled
  odds_margin         — average overround across all books

Team-level aggregate features written to data/processed/odds_features_2026.csv:
  implied_home_win_avg, implied_away_win_avg, implied_draw_avg,
  market_confidence_avg, odds_margin_avg
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import requests

# ─────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────
RAW_ODDS_PATH = Path("data/raw/match_odds_2026.json")
PROCESSED_ODDS_PATH = Path("data/processed/odds_features_2026.csv")

# The Odds API base URL
ODDS_API_BASE = "https://api.the-odds-api.com"
SPORT_KEY = "soccer_fifa_world_cup"
DEFAULT_REGIONS = "eu"
DEFAULT_MARKETS = "h2h"

# Sentinel for missing odds
_MISSING_ODDS = {
    "implied_prob_home": 0.333,
    "implied_prob_draw": 0.333,
    "implied_prob_away": 0.334,
    "market_confidence": 0.5,
    "books_count": 0,
    "odds_margin": 0.05,
}


# ─────────────────────────────────────────────
# Core fetch
# ─────────────────────────────────────────────

def fetch_match_odds(team_a: str, team_b: str, api_key: str) -> dict:
    """
    Fetch live h2h odds for a single match from The Odds API.

    Normalises decimal odds from all available EU bookmakers into
    vig-free implied probabilities and computes market meta-features.

    Returns a dict with keys:
        implied_prob_home, implied_prob_draw, implied_prob_away,
        market_confidence, books_count, odds_margin
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
        return _MISSING_ODDS.copy()

    all_matches: list[dict] = response.json()

    # Find the specific match among returned events
    matched_event = _find_event(all_matches, team_a, team_b)
    if matched_event is None:
        print(f"[WARN] No odds found for {team_a} vs {team_b}")
        return _MISSING_ODDS.copy()

    return _extract_features_from_event(matched_event, team_a)


def fetch_all_tournament_odds(api_key: str) -> list[dict]:
    """
    Fetch all available odds for the FIFA World Cup tournament
    and save the raw response to data/raw/match_odds_2026.json.

    Returns the raw event list.
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


# ─────────────────────────────────────────────
# Event search & feature extraction
# ─────────────────────────────────────────────

def _normalise_name(name: str) -> str:
    """Lower-case and strip extra whitespace for fuzzy name matching."""
    return name.lower().strip()


def _find_event(events: list[dict], team_a: str, team_b: str) -> dict | None:
    """Return the first event whose home/away team names match the pair."""
    target_a = _normalise_name(team_a)
    target_b = _normalise_name(team_b)

    for event in events:
        home_name = _normalise_name(event.get("home_team", ""))
        away_name = _normalise_name(event.get("away_team", ""))

        names_match = (
            (target_a in home_name or home_name in target_a) and
            (target_b in away_name or away_name in target_b)
        ) or (
            (target_b in home_name or home_name in target_b) and
            (target_a in away_name or away_name in target_a)
        )

        if names_match:
            return event

    return None


def _extract_features_from_event(event: dict, home_team_name: str) -> dict:
    """
    Parse bookmaker outcomes and compute vig-free implied probabilities
    plus market meta-features.
    """
    bookmaker_entries = event.get("bookmakers", [])
    if not bookmaker_entries:
        return _MISSING_ODDS.copy()

    home_name = _normalise_name(event.get("home_team", ""))
    query_home = _normalise_name(home_team_name)
    is_queried_home = query_home in home_name or home_name in query_home

    # Collect per-book implied probs (before vig removal)
    per_book_probs: list[tuple[float, float, float]] = []
    per_book_margins: list[float] = []

    for bookmaker in bookmaker_entries:
        for market in bookmaker.get("markets", []):
            if market.get("key") != "h2h":
                continue

            outcomes = {o["name"]: o["price"] for o in market.get("outcomes", [])}

            home_team_api = event.get("home_team", "")
            away_team_api = event.get("away_team", "")
            draw_key = "Draw"

            home_odd = outcomes.get(home_team_api, 0.0)
            away_odd = outcomes.get(away_team_api, 0.0)
            draw_odd = outcomes.get(draw_key, 0.0)

            if not (home_odd > 1 and away_odd > 1 and draw_odd > 1):
                continue

            # Raw implied probs (include vig)
            raw_home = 1 / home_odd
            raw_draw = 1 / draw_odd
            raw_away = 1 / away_odd
            overround = raw_home + raw_draw + raw_away

            # Vig-free normalised probs
            vig_free_home = raw_home / overround
            vig_free_draw = raw_draw / overround
            vig_free_away = raw_away / overround

            if is_queried_home:
                per_book_probs.append((vig_free_home, vig_free_draw, vig_free_away))
            else:
                # Swap home/away if team_a was listed as away_team in API
                per_book_probs.append((vig_free_away, vig_free_draw, vig_free_home))

            per_book_margins.append(overround - 1.0)

    if not per_book_probs:
        return _MISSING_ODDS.copy()

    probs_array = np.array(per_book_probs)

    avg_home = float(np.mean(probs_array[:, 0]))
    avg_draw = float(np.mean(probs_array[:, 1]))
    avg_away = float(np.mean(probs_array[:, 2]))

    # Market confidence: low standard deviation → bookmakers agree → high confidence
    bookie_std = float(np.mean(np.std(probs_array, axis=0)))
    market_confidence = float(np.clip(1.0 - bookie_std * 10, 0.0, 1.0))

    return {
        "implied_prob_home": round(avg_home, 4),
        "implied_prob_draw": round(avg_draw, 4),
        "implied_prob_away": round(avg_away, 4),
        "market_confidence": round(market_confidence, 4),
        "books_count": len(per_book_probs),
        "odds_margin": round(float(np.mean(per_book_margins)), 4),
    }


# ─────────────────────────────────────────────
# Aggregate team-level features
# ─────────────────────────────────────────────

def build_team_odds_features(events: list[dict]) -> pd.DataFrame:
    """
    Aggregate per-match odds into per-team averages suitable for
    merging into the feature matrix via build_features_v3.

    Returns DataFrame with columns:
        team_name, implied_home_win_avg, implied_away_win_avg,
        implied_draw_avg, market_confidence_avg, odds_margin_avg
    """
    team_records: dict[str, list[dict]] = {}

    for event in events:
        home_team = event.get("home_team", "")
        away_team = event.get("away_team", "")
        if not home_team or not away_team:
            continue

        features_home = _extract_features_from_event(event, home_team)
        features_away = _extract_features_from_event(event, away_team)

        for team, feats in [(home_team, features_home), (away_team, features_away)]:
            team_records.setdefault(team, []).append(feats)

    rows = []
    for team_name, match_list in team_records.items():
        if not match_list:
            continue
        rows.append({
            "team_name": team_name,
            "implied_home_win_avg": np.mean([m["implied_prob_home"] for m in match_list]),
            "implied_away_win_avg": np.mean([m["implied_prob_away"] for m in match_list]),
            "implied_draw_avg": np.mean([m["implied_prob_draw"] for m in match_list]),
            "market_confidence_avg": np.mean([m["market_confidence"] for m in match_list]),
            "odds_margin_avg": np.mean([m["odds_margin"] for m in match_list]),
        })

    return pd.DataFrame(rows)


# ─────────────────────────────────────────────
# Mock data generator (no API key required)
# ─────────────────────────────────────────────

def generate_mock_odds_features(team_names: list[str]) -> pd.DataFrame:
    """
    Generate realistic synthetic odds features when The Odds API
    is unavailable (e.g. during development or CI).

    Stronger teams (higher index = lower seed) get better implied odds.
    This keeps the model trainable without a live API key.
    """
    np.random.seed(42)
    total_teams = len(team_names)

    rows = []
    for rank_index, team_name in enumerate(team_names):
        # Stronger teams have higher implied home win probability
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


# ─────────────────────────────────────────────
# CLI entry-point
# ─────────────────────────────────────────────

def main(api_key: str | None = None) -> None:
    """
    Run the full odds ingestion pipeline.

    If api_key is provided (or set in ODDS_API_KEY env var),
    fetches live data. Otherwise falls back to mock generation.
    """
    resolved_key = api_key or os.environ.get("ODDS_API_KEY", "")
    team_names = [
        "Brazil", "Argentina", "France", "England", "Spain", "Germany",
        "Portugal", "Netherlands", "Belgium", "Croatia", "Uruguay", "Denmark",
        "Switzerland", "Mexico", "United States", "Canada", "Japan", "South Korea",
        "Morocco", "Senegal", "Australia", "Poland", "Serbia", "Ecuador",
        "Colombia", "Chile", "Peru", "Venezuela", "Ghana", "Cameroon",
        "Nigeria", "Egypt", "Algeria", "Saudi Arabia", "Iran", "Qatar",
        "Wales", "Scotland", "Turkey", "Czech Republic", "Austria", "Hungary",
        "Sweden", "Norway", "Ukraine", "Romania", "Slovakia", "Slovenia",
    ]

    if resolved_key:
        print(f"[INFO] Fetching live odds from The Odds API...")
        events = fetch_all_tournament_odds(resolved_key)
        if events:
            df_odds = build_team_odds_features(events)
        else:
            print("[WARN] No events returned. Falling back to mock data.")
            df_odds = generate_mock_odds_features(team_names)
    else:
        print("[INFO] No API key found. Generating mock odds features.")
        df_odds = generate_mock_odds_features(team_names)

    PROCESSED_ODDS_PATH.parent.mkdir(parents=True, exist_ok=True)
    df_odds.to_csv(PROCESSED_ODDS_PATH, index=False)
    print(f"[INFO] Odds features saved → {PROCESSED_ODDS_PATH} ({len(df_odds)} teams)")


if __name__ == "__main__":
    main()
