from __future__ import annotations
import numpy as np
import pandas as pd
from src.odds_constants import MISSING_ODDS


def normalise_name(name: str) -> str:
    """Lower-case and strip extra whitespace for fuzzy name matching."""
    return name.lower().strip()


def find_event(events: list[dict], team_a: str, team_b: str) -> dict | None:
    """Return the first event whose home/away team names match the pair."""
    target_a = normalise_name(team_a)
    target_b = normalise_name(team_b)

    for event in events:
        home_name = normalise_name(event.get("home_team", ""))
        away_name = normalise_name(event.get("away_team", ""))

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


def extract_features_from_event(event: dict, home_team_name: str) -> dict:
    """
    Parse bookmaker outcomes and compute vig-free implied probabilities
    plus market meta-features.
    """
    bookmaker_entries = event.get("bookmakers", [])
    if not bookmaker_entries:
        return MISSING_ODDS.copy()

    home_name = normalise_name(event.get("home_team", ""))
    query_home = normalise_name(home_team_name)
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
        return MISSING_ODDS.copy()

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


def build_team_odds_features(events: list[dict]) -> pd.DataFrame:
    """
    Aggregate per-match odds into per-team averages suitable for
    merging into the feature matrix.
    """
    team_records: dict[str, list[dict]] = {}

    for event in events:
        home_team = event.get("home_team", "")
        away_team = event.get("away_team", "")
        if not home_team or not away_team:
            continue

        features_home = extract_features_from_event(event, home_team)
        features_away = extract_features_from_event(event, away_team)

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
