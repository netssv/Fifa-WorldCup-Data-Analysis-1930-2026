"""
feature_builder.py
──────────────────
Builds the feature DataFrame row that is fed into the RF models.
Extracted from predictions.py to keep every module under 200 lines.
"""
from __future__ import annotations

import math
import pandas as pd

from src.constants import VENUE_ALTITUDE_2026, HIGH_ALTITUDE_THRESHOLD_M, HIGH_ALTITUDE_TEAMS
from src.constants_v3 import TEAM_PEDIGREE, SQUAD_EXPERIENCE, CLIMATE_TRAVEL, LEAGUE_SYNERGY, OFF_DEF_METRICS

_XG_DEFAULTS: dict = {
    "xg_for_avg": 1.35, "xg_against_avg": 1.35, "xg_diff_avg": 0.0,
    "xg_overperform_avg": 0.0, "xg_efficiency_avg": 1.0, "xg_consistency": 0.5,
}

_ODDS_DEFAULTS: dict = {
    "implied_home_win": 0.333, "implied_away_win": 0.333, "implied_draw": 0.334,
    "market_confidence": 0.5, "odds_margin": 0.05,
}


def _venue_altitude(team_a: str) -> tuple[float, float, float]:
    """Return (altitude_m, is_high, penalty) for team_a's likely venue."""
    city_map = {"Mexico": "Mexico City", "Canada": "Toronto", "United States": "Dallas"}
    city = city_map.get(team_a, "neutral")
    alt = VENUE_ALTITUDE_2026.get(city, 0.0)
    high = 1.0 if alt > HIGH_ALTITUDE_THRESHOLD_M else 0.0
    penalty = -0.1 if (high and team_a not in HIGH_ALTITUDE_TEAMS) else 0.0
    return alt, high, penalty


def _pedigree_diff(team_a: str, team_b: str) -> tuple[int, int, int]:
    pa = TEAM_PEDIGREE.get(team_a, (0, 0, 1))
    pb = TEAM_PEDIGREE.get(team_b, (0, 0, 1))
    return pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]


def _experience_diff(team_a: str, team_b: str) -> tuple[float, float]:
    ea = SQUAD_EXPERIENCE.get(team_a, (26.5, 25.0))
    eb = SQUAD_EXPERIENCE.get(team_b, (26.5, 25.0))
    return ea[0] - eb[0], ea[1] - eb[1]


def _climate_diff(team_a: str, team_b: str) -> tuple[float, float]:
    ca = CLIMATE_TRAVEL.get(team_a, (8000.0, 0.65))
    cb = CLIMATE_TRAVEL.get(team_b, (8000.0, 0.65))
    return ca[0] - cb[0], ca[1] - cb[1]


def _synergy_diff(team_a: str, team_b: str) -> tuple[float, float]:
    sa = LEAGUE_SYNERGY.get(team_a, (0.10, 0.40))
    sb = LEAGUE_SYNERGY.get(team_b, (0.10, 0.40))
    return sa[0] - sb[0], sa[1] - sb[1]


def _offdef_diff(team_a: str, team_b: str) -> tuple[float, float]:
    oa = OFF_DEF_METRICS.get(team_a, (1.4, 0.40))
    ob = OFF_DEF_METRICS.get(team_b, (1.4, 0.40))
    return oa[0] - ob[0], oa[1] - ob[1]


def build_feature_row(
    *,
    team_a: str,
    team_b: str,
    stage: str,
    elo_diff: float,
    goal_diff_avg: float,
    home_form: float,
    away_form: float,
    h2h_wins: int,
    squad_values: dict,
    eafc_ratings: dict,
    xg_features: dict,
    odds_features: dict,
    coach_features: dict,
    fatigue_features: dict,
) -> pd.DataFrame:
    """Return a single-row DataFrame with all model features."""
    sq_a = squad_values.get(team_a, {"total": 50e6, "avg": 2e6, "top11": 30e6})
    sq_b = squad_values.get(team_b, {"total": 50e6, "avg": 2e6, "top11": 30e6})
    squad_ratio = sq_a["total"] / max(1.0, sq_b["total"])

    fc_a = eafc_ratings.get(team_a, {"overall": 70.0, "pace": 70.0, "defending": 70.0, "physic": 70.0, "top5": 70.0})
    fc_b = eafc_ratings.get(team_b, {"overall": 70.0, "pace": 70.0, "defending": 70.0, "physic": 70.0, "top5": 70.0})

    alt, is_high, alt_pen = _venue_altitude(team_a)
    titles_d, semis_d, appear_d = _pedigree_diff(team_a, team_b)
    age_d, caps_d = _experience_diff(team_a, team_b)
    travel_d, climate_d = _climate_diff(team_a, team_b)
    syn_d, top5_d = _synergy_diff(team_a, team_b)
    goals_d, sheets_d = _offdef_diff(team_a, team_b)

    xg_a = xg_features.get(team_a, _XG_DEFAULTS)
    xg_b = xg_features.get(team_b, _XG_DEFAULTS)
    od_a = odds_features.get(team_a, _ODDS_DEFAULTS)
    od_b = odds_features.get(team_b, _ODDS_DEFAULTS)
    co_a = coach_features.get(team_a, {})
    co_b = coach_features.get(team_b, {})
    fa_a = fatigue_features.get(team_a, {})
    fa_b = fatigue_features.get(team_b, {})

    return pd.DataFrame([{
        "elo_diff": elo_diff, "goal_diff_avg": goal_diff_avg,
        "home_form": home_form, "away_form": away_form,
        "h2h_wins": h2h_wins, "is_knockout": 1.0 if stage != "group" else 0.0,
        "squad_value_ratio": squad_ratio,
        "value_log_home": math.log10(max(1.0, sq_a["total"])),
        "value_log_away": math.log10(max(1.0, sq_b["total"])),
        "eafc_overall_diff": fc_a["overall"] - fc_b["overall"],
        "eafc_physic_diff": fc_a["physic"] - fc_b["physic"],
        "eafc_top5_avg_home": fc_a["top5"],
        "venue_altitude_m": alt, "is_high_altitude": is_high, "altitude_penalty": alt_pen,
        "titles_diff": titles_d, "semis_diff": semis_d, "appearances_diff": appear_d,
        "avg_age_diff": age_d, "avg_caps_diff": caps_d,
        "travel_dist_diff": travel_d, "climate_compat_diff": climate_d,
        "synergy_diff": syn_d, "top5_ratio_diff": top5_d,
        "goals_scored_diff": goals_d, "clean_sheets_diff": sheets_d,
        "xg_for_avg_home": xg_a.get("xg_for_avg", 1.35), "xg_for_avg_away": xg_b.get("xg_for_avg", 1.35),
        "xg_against_avg_home": xg_a.get("xg_against_avg", 1.35), "xg_against_avg_away": xg_b.get("xg_against_avg", 1.35),
        "xg_diff_avg_home": xg_a.get("xg_diff_avg", 0.0), "xg_diff_avg_away": xg_b.get("xg_diff_avg", 0.0),
        "xg_overperform_avg_home": xg_a.get("xg_overperform_avg", 0.0), "xg_overperform_avg_away": xg_b.get("xg_overperform_avg", 0.0),
        "xg_efficiency_avg_home": xg_a.get("xg_efficiency_avg", 1.0), "xg_efficiency_avg_away": xg_b.get("xg_efficiency_avg", 1.0),
        "xg_consistency_home": xg_a.get("xg_consistency", 0.5), "xg_consistency_away": xg_b.get("xg_consistency", 0.5),
        "odds_implied_home_win": od_a.get("implied_home_win", 0.333),
        "odds_implied_away_win": od_b.get("implied_away_win", 0.333),
        "odds_implied_draw": od_a.get("implied_draw", 0.334),
        "odds_market_confidence": (od_a.get("market_confidence", 0.5) + od_b.get("market_confidence", 0.5)) / 2,
        "odds_margin": (od_a.get("odds_margin", 0.05) + od_b.get("odds_margin", 0.05)) / 2,
        "coach_wc_editions": float(co_a.get("wc_editions", 0)),
        "coach_intl_win_rate": float(co_a.get("intl_win_rate", 0.45)),
        "coach_tournament_wins": float(co_a.get("tournament_wins", 0)),
        "coach_experience_diff": float(co_a.get("wc_editions", 0) - co_b.get("wc_editions", 0)),
        "coach_knockout_edge": float(
            (1 if co_a.get("knockout_experience") else 0) - (1 if co_b.get("knockout_experience") else 0)
        ),
        "fatigue_avg_club_matches_home": float(fa_a.get("avg_club_matches", 25.0)),
        "fatigue_avg_club_matches_away": float(fa_b.get("avg_club_matches", 25.0)),
        "fatigue_ucl_players_home": float(fa_a.get("ucl_players_count", 0.0)),
        "fatigue_ucl_players_away": float(fa_b.get("ucl_players_count", 0.0)),
        "fatigue_index_diff": float(fa_a.get("fatigue_index", 25.0/38) - fa_b.get("fatigue_index", 25.0/38)),
        "fatigue_days_since_last_match_diff": float(fa_a.get("days_since_last_match", 18.0) - fa_b.get("days_since_last_match", 18.0)),
    }])
