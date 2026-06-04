"""
features_v3.py
──────────────
Builds the V3 feature matrix (48 features) using ELO, squad values,
EAFC ratings, altitude, pedigree, experience, climate, synergy,
off/def, xG, market odds, and coach metrics.

Merge utilities are in src/merge_helpers.py.
"""
import numpy as np
import pandas as pd

from src.constants import VENUE_ALTITUDE_2026, HIGH_ALTITUDE_THRESHOLD_M, HIGH_ALTITUDE_TEAMS
from src.constants_v3 import TEAM_PEDIGREE, SQUAD_EXPERIENCE, CLIMATE_TRAVEL, LEAGUE_SYNERGY, OFF_DEF_METRICS
from src.ingestion_coaches import build_coach_features
from src.merge_helpers import merge_squad_values, merge_eafc_ratings, merge_xg_features, merge_odds_features

import os


def get_team_stats_v3(team_name: str) -> dict:
    """Extract advanced stats for a single team with default fallbacks."""
    pedigree = TEAM_PEDIGREE.get(team_name, (0, 0, 1))
    experience = SQUAD_EXPERIENCE.get(team_name, (26.5, 25.0))
    climate = CLIMATE_TRAVEL.get(team_name, (8000.0, 0.65))
    synergy = LEAGUE_SYNERGY.get(team_name, (0.10, 0.40))
    off_def = OFF_DEF_METRICS.get(team_name, (1.4, 0.40))
    return {
        "titles": pedigree[0], "semis": pedigree[1], "appearances": pedigree[2],
        "avg_age": experience[0], "avg_caps": experience[1],
        "travel_dist": climate[0], "climate_compat": climate[1],
        "synergy": synergy[0], "top5_ratio": synergy[1],
        "goals_scored": off_def[0], "clean_sheets": off_def[1],
    }


def _apply_advanced_diff(df: pd.DataFrame) -> pd.DataFrame:
    """Vectorised computation of all V3 pedigree/experience/climate/synergy/off-def diffs."""
    home = pd.DataFrame([get_team_stats_v3(t) for t in df["home_team"]])
    away = pd.DataFrame([get_team_stats_v3(t) for t in df["away_team"]])
    diff_cols = ["titles", "semis", "appearances", "avg_age", "avg_caps",
                 "travel_dist", "climate_compat", "synergy", "top5_ratio",
                 "goals_scored", "clean_sheets"]
    rename = {c: f"{c}_diff" for c in diff_cols}
    for col in diff_cols:
        df[rename[col]] = home[col].values - away[col].values
    return df


#: Final 48-column feature list (must match model training order)
FEATURE_COLS_V3 = [
    "elo_diff", "goal_diff_avg", "home_form", "away_form", "h2h_wins", "is_knockout",
    "squad_value_ratio", "value_log_home", "value_log_away",
    "eafc_overall_diff", "eafc_physic_diff", "eafc_top5_avg_home",
    "venue_altitude_m", "is_high_altitude", "altitude_penalty",
    "titles_diff", "semis_diff", "appearances_diff",
    "avg_age_diff", "avg_caps_diff",
    "travel_dist_diff", "climate_compat_diff",
    "synergy_diff", "top5_ratio_diff",
    "goals_scored_diff", "clean_sheets_diff",
    "xg_for_avg_home", "xg_for_avg_away",
    "xg_against_avg_home", "xg_against_avg_away",
    "xg_diff_avg_home", "xg_diff_avg_away",
    "xg_overperform_avg_home", "xg_overperform_avg_away",
    "xg_efficiency_avg_home", "xg_efficiency_avg_away",
    "xg_consistency_home", "xg_consistency_away",
    "odds_implied_home_win", "odds_implied_away_win", "odds_implied_draw",
    "odds_market_confidence", "odds_margin",
    "coach_wc_editions", "coach_intl_win_rate", "coach_tournament_wins",
    "coach_experience_diff", "coach_knockout_edge",
]


def build_features_v3(
    df_matches: pd.DataFrame,
    df_squad_values: pd.DataFrame,
    df_eafc: pd.DataFrame,
    df_xg: pd.DataFrame | None = None,
    df_odds: pd.DataFrame | None = None,
    coaches_json_path: str = "data/coaches_wc2026.json",
    venue_col: str = "venue_city",
) -> pd.DataFrame:
    """Return the complete V3 feature matrix with 48 features + target column."""
    df = df_matches.copy()

    df = merge_squad_values(df, df_squad_values)
    df = merge_eafc_ratings(df, df_eafc)

    # Altitude features
    df["venue_altitude_m"] = df[venue_col].map(VENUE_ALTITUDE_2026).fillna(0)
    df["is_high_altitude"] = (df["venue_altitude_m"] > HIGH_ALTITUDE_THRESHOLD_M).astype(float)
    df["altitude_penalty"] = np.where(
        (df["is_high_altitude"] > 0.5) & ~df["home_team"].isin(HIGH_ALTITUDE_TEAMS), -0.1, 0.0
    )

    df = merge_xg_features(df, df_xg)
    df = _apply_advanced_diff(df)
    df = merge_odds_features(df, df_odds)

    # Coach features
    if os.path.exists(coaches_json_path):
        df_coach = build_coach_features(df_matches, json_path=coaches_json_path)
        for col in df_coach.columns:
            df[col] = df_coach[col].values

    assert len(FEATURE_COLS_V3) == 48, f"Expected 48 features, got {len(FEATURE_COLS_V3)}"
    for col in FEATURE_COLS_V3:
        df[col] = df[col].fillna(0.0)

    target_col = "target"
    if target_col not in df.columns:
        if "home_score" in df.columns and "away_score" in df.columns:
            df[target_col] = np.where(df["home_score"] > df["away_score"], 1, 0)
        elif "HomeGoals" in df.columns and "AwayGoals" in df.columns:
            df[target_col] = np.where(df["HomeGoals"] > df["AwayGoals"], 1, 0)
        else:
            df[target_col] = 0

    return df[FEATURE_COLS_V3 + [target_col]]
