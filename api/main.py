"""
FIFA 2026 Prediction API
Endpoints:
  POST /predict/match       — single-match win probabilities
  POST /predict/group       — group-stage qualifying probabilities
  GET  /predict/bracket/full — full simulated tournament bracket
"""

from __future__ import annotations

import math
import os
import time
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .constants import (
    FIFA_ELO_2026,
    TEAM_FORM,
    H2H_WINS,
    STAGE_MULTIPLIER,
    GROUPS_2026,
)

# ─────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────
app = FastAPI(
    title="FIFA 2026 Prediction API",
    description="ML-powered match and bracket predictions for FIFA World Cup 2026",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Model loading
# ─────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
MODELS_DIR = BASE_DIR / "Predictions and Models Folder"

_home_model: Any = None
_away_model: Any = None
_label_encoder: Any = None

_squad_values: dict[str, dict[str, float]] = {}
_eafc_ratings: dict[str, dict[str, float]] = {}
_xg_features: dict[str, dict[str, float]] = {}
_odds_features: dict[str, dict[str, float]] = {}
_coach_features: dict[str, dict] = {}

def _load_extra_features() -> None:
    global _squad_values, _eafc_ratings, _xg_features, _odds_features, _coach_features
    squad_path = BASE_DIR / "data" / "processed" / "squad_values_2026.csv"
    eafc_path = BASE_DIR / "data" / "processed" / "eafc_ratings_2026.csv"
    xg_path = BASE_DIR / "data" / "processed" / "xg_features_2026.csv"

    if squad_path.exists():
        try:
            df = pd.read_csv(squad_path)
            for _, row in df.iterrows():
                _squad_values[row["team_name"]] = {
                    "total": float(row["squad_total_eur"]),
                    "avg": float(row["squad_avg_eur"]),
                    "top11": float(row["top11_eur"]),
                }
        except Exception as exc:
            print(f"[WARN] Could not load squad values: {exc}")

    if eafc_path.exists():
        try:
            df = pd.read_csv(eafc_path)
            for _, row in df.iterrows():
                _eafc_ratings[row["team_name"]] = {
                    "overall": float(row["avg_overall"]),
                    "pace": float(row["avg_pace"]),
                    "defending": float(row["avg_defending"]),
                    "physic": float(row["avg_physic"]),
                    "top5": float(row["top5_avg"]),
                }
        except Exception as exc:
            print(f"[WARN] Could not load EA FC ratings: {exc}")

    if xg_path.exists():
        try:
            df = pd.read_csv(xg_path)
            for _, row in df.iterrows():
                _xg_features[row["team_name"]] = {
                    "xg_for_avg": float(row["xg_for_avg"]),
                    "xg_against_avg": float(row["xg_against_avg"]),
                    "xg_diff_avg": float(row["xg_diff_avg"]),
                    "xg_overperform_avg": float(row["xg_overperform_avg"]),
                    "xg_efficiency_avg": float(row["xg_efficiency_avg"]),
                    "xg_consistency": float(row["xg_consistency"]),
                }
        except Exception as exc:
            print(f"[WARN] Could not load xG features: {exc}")

    odds_path = BASE_DIR / "data" / "processed" / "odds_features_2026.csv"
    if odds_path.exists():
        try:
            df = pd.read_csv(odds_path)
            for _, row in df.iterrows():
                _odds_features[row["team_name"]] = {
                    "implied_home_win": float(row["implied_home_win_avg"]),
                    "implied_away_win": float(row["implied_away_win_avg"]),
                    "implied_draw": float(row["implied_draw_avg"]),
                    "market_confidence": float(row["market_confidence_avg"]),
                    "odds_margin": float(row["odds_margin_avg"]),
                }
        except Exception as exc:
            print(f"[WARN] Could not load odds features: {exc}")

    coaches_json_path = BASE_DIR / "data" / "coaches_wc2026.json"
    if coaches_json_path.exists():
        try:
            import json
            with open(coaches_json_path, encoding="utf-8") as fh:
                raw = json.load(fh)
            for team_name, stats in raw.items():
                if team_name.startswith("_"):          # skip _metadata
                    continue
                _coach_features[team_name] = {
                    "wc_editions": int(stats.get("wc_editions", 0)),
                    "intl_win_rate": float(stats.get("intl_win_rate", 0.45)),
                    "tournament_wins": int(stats.get("tournament_wins", 0)),
                    "knockout_experience": bool(stats.get("knockout_experience", False)),
                }
        except Exception as exc:
            print(f"[WARN] Could not load coach features: {exc}")

def _load_models() -> bool:
    """Load RF models from disk. Returns True if successful."""
    global _home_model, _away_model, _label_encoder
    home_path = MODELS_DIR / "home_goal_model.pkl"
    away_path = MODELS_DIR / "away_goal_model.pkl"

    _load_extra_features()

    if not (home_path.exists() and away_path.exists()):
        return False

    try:
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            _home_model = joblib.load(home_path)
            _away_model = joblib.load(away_path)

        # Fit a fresh encoder on all known teams for consistent encoding
        from sklearn.preprocessing import LabelEncoder
        _label_encoder = LabelEncoder()
        all_teams = list(FIFA_ELO_2026.keys())
        # Add historical teams to avoid unseen-label errors
        df = pd.read_csv(BASE_DIR / "Data" / "clean_fifa_worldcup_matches.csv")
        hist_teams = pd.concat([df["HomeTeam"], df["AwayTeam"]]).unique().tolist()
        _label_encoder.fit(list(set(all_teams + hist_teams)))
        return True
    except Exception as exc:
        print(f"[WARN] Could not load models: {exc}")
        return False


_models_loaded = _load_models()
print(f"[INFO] RF models loaded: {_models_loaded}")


# ─────────────────────────────────────────────
# Helper utilities
# ─────────────────────────────────────────────

def _get_elo(team: str) -> float:
    return FIFA_ELO_2026.get(team, 1400.0)

def _get_form(team: str) -> float:
    return TEAM_FORM.get(team, 0.45)

def _get_h2h(team_a: str, team_b: str) -> int:
    return H2H_WINS.get((team_a, team_b), 0)

def _confidence_label(prob: float) -> str:
    if prob > 0.60:
        return "high"
    if prob > 0.45:
        return "medium"
    return "low"

def _encode_team(team: str) -> int:
    if _label_encoder is None:
        return 0
    try:
        return int(_label_encoder.transform([team])[0])
    except Exception:
        return 0


def predict_with_model(team_a: str, team_b: str, stage: str = "r32") -> tuple[float, float]:
    """
    Blends the RF model predictions with ELO and Form statistics
    for a more robust, realistic prediction (ensemble method).
    """
    elo_goals_a, elo_goals_b = predict_fallback_goals(team_a, team_b)

    if not _models_loaded or _home_model is None:
        return elo_goals_a, elo_goals_b

    try:
        # Load constants for altitude checks
        from src.constants import VENUE_ALTITUDE_2026, HIGH_ALTITUDE_THRESHOLD_M, HIGH_ALTITUDE_TEAMS
        from src.constants_v3 import TEAM_PEDIGREE, SQUAD_EXPERIENCE, CLIMATE_TRAVEL, LEAGUE_SYNERGY, OFF_DEF_METRICS

        elo_a = _get_elo(team_a)
        elo_b = _get_elo(team_b)
        elo_diff = elo_a - elo_b
        goal_diff_avg = (elo_diff / 400.0) * 1.2

        home_form = _get_form(team_a)
        away_form = _get_form(team_b)
        h2h_wins = _get_h2h(team_a, team_b)
        is_knockout = 1.0 if stage != "group" else 0.0

        # Squad values
        sq_a = _squad_values.get(team_a, {"total": 50_000_000.0, "avg": 2_000_000.0, "top11": 30_000_000.0})
        sq_b = _squad_values.get(team_b, {"total": 50_000_000.0, "avg": 2_000_000.0, "top11": 30_000_000.0})

        squad_value_ratio = sq_a["total"] / max(1.0, sq_b["total"])
        value_log_home = math.log10(max(1.0, sq_a["total"]))
        value_log_away = math.log10(max(1.0, sq_b["total"]))

        # EA FC Ratings
        fc_a = _eafc_ratings.get(team_a, {"overall": 70.0, "pace": 70.0, "defending": 70.0, "physic": 70.0, "top5": 70.0})
        fc_b = _eafc_ratings.get(team_b, {"overall": 70.0, "pace": 70.0, "defending": 70.0, "physic": 70.0, "top5": 70.0})

        eafc_overall_diff = fc_a["overall"] - fc_b["overall"]
        eafc_physic_diff = fc_a["physic"] - fc_b["physic"]
        eafc_top5_avg_home = fc_a["top5"]

        # Default venue altitude mapping
        venue_city = "neutral"
        if team_a == "Mexico":
            venue_city = "Mexico City"
        elif team_a == "Canada":
            venue_city = "Toronto"
        elif team_a == "United States":
            venue_city = "Dallas"

        venue_altitude_m = VENUE_ALTITUDE_2026.get(venue_city, 0.0)
        is_high_altitude = 1.0 if venue_altitude_m > HIGH_ALTITUDE_THRESHOLD_M else 0.0
        altitude_penalty = -0.1 if (is_high_altitude and team_a not in HIGH_ALTITUDE_TEAMS) else 0.0

        # Advanced V3 features
        pedigree_a = TEAM_PEDIGREE.get(team_a, (0, 0, 1))
        pedigree_b = TEAM_PEDIGREE.get(team_b, (0, 0, 1))
        titles_diff = pedigree_a[0] - pedigree_b[0]
        semis_diff = pedigree_a[1] - pedigree_b[1]
        appearances_diff = pedigree_a[2] - pedigree_b[2]

        exp_a = SQUAD_EXPERIENCE.get(team_a, (26.5, 25.0))
        exp_b = SQUAD_EXPERIENCE.get(team_b, (26.5, 25.0))
        avg_age_diff = exp_a[0] - exp_b[0]
        avg_caps_diff = exp_a[1] - exp_b[1]

        clim_a = CLIMATE_TRAVEL.get(team_a, (8000.0, 0.65))
        clim_b = CLIMATE_TRAVEL.get(team_b, (8000.0, 0.65))
        travel_dist_diff = clim_a[0] - clim_b[0]
        climate_compat_diff = clim_a[1] - clim_b[1]

        syn_a = LEAGUE_SYNERGY.get(team_a, (0.10, 0.40))
        syn_b = LEAGUE_SYNERGY.get(team_b, (0.10, 0.40))
        synergy_diff = syn_a[0] - syn_b[0]
        top5_ratio_diff = syn_a[1] - syn_b[1]

        off_def_a = OFF_DEF_METRICS.get(team_a, (1.4, 0.40))
        off_def_b = OFF_DEF_METRICS.get(team_b, (1.4, 0.40))
        goals_scored_diff = off_def_a[0] - off_def_b[0]
        clean_sheets_diff = off_def_a[1] - off_def_b[1]

        # xG features — default to league-average values when data is absent
        _XG_DEFAULTS = {
            "xg_for_avg": 1.35,
            "xg_against_avg": 1.35,
            "xg_diff_avg": 0.0,
            "xg_overperform_avg": 0.0,
            "xg_efficiency_avg": 1.0,
            "xg_consistency": 0.5,
        }
        xg_a = _xg_features.get(team_a, _XG_DEFAULTS)
        xg_b = _xg_features.get(team_b, _XG_DEFAULTS)

        # Market odds features — default to equal probs (no market signal)
        _ODDS_DEFAULTS = {
            "implied_home_win": 0.333,
            "implied_away_win": 0.333,
            "implied_draw": 0.334,
            "market_confidence": 0.5,
            "odds_margin": 0.05,
        }
        odds_a = _odds_features.get(team_a, _ODDS_DEFAULTS)
        odds_b = _odds_features.get(team_b, _ODDS_DEFAULTS)

        # Construct feature vector matching exact 43-column training schema
        X = pd.DataFrame([{
            "elo_diff": elo_diff,
            "goal_diff_avg": goal_diff_avg,
            "home_form": home_form,
            "away_form": away_form,
            "h2h_wins": h2h_wins,
            "is_knockout": is_knockout,
            "squad_value_ratio": squad_value_ratio,
            "value_log_home": value_log_home,
            "value_log_away": value_log_away,
            "eafc_overall_diff": eafc_overall_diff,
            "eafc_physic_diff": eafc_physic_diff,
            "eafc_top5_avg_home": eafc_top5_avg_home,
            "venue_altitude_m": venue_altitude_m,
            "is_high_altitude": is_high_altitude,
            "altitude_penalty": altitude_penalty,
            "titles_diff": titles_diff,
            "semis_diff": semis_diff,
            "appearances_diff": appearances_diff,
            "avg_age_diff": avg_age_diff,
            "avg_caps_diff": avg_caps_diff,
            "travel_dist_diff": travel_dist_diff,
            "climate_compat_diff": climate_compat_diff,
            "synergy_diff": synergy_diff,
            "top5_ratio_diff": top5_ratio_diff,
            "goals_scored_diff": goals_scored_diff,
            "clean_sheets_diff": clean_sheets_diff,
            # xG columns — home team (team_a) / away team (team_b)
            "xg_for_avg_home": xg_a.get("xg_for_avg", 1.35),
            "xg_for_avg_away": xg_b.get("xg_for_avg", 1.35),
            "xg_against_avg_home": xg_a.get("xg_against_avg", 1.35),
            "xg_against_avg_away": xg_b.get("xg_against_avg", 1.35),
            "xg_diff_avg_home": xg_a.get("xg_diff_avg", 0.0),
            "xg_diff_avg_away": xg_b.get("xg_diff_avg", 0.0),
            "xg_overperform_avg_home": xg_a.get("xg_overperform_avg", 0.0),
            "xg_overperform_avg_away": xg_b.get("xg_overperform_avg", 0.0),
            "xg_efficiency_avg_home": xg_a.get("xg_efficiency_avg", 1.0),
            "xg_efficiency_avg_away": xg_b.get("xg_efficiency_avg", 1.0),
            "xg_consistency_home": xg_a.get("xg_consistency", 0.5),
            "xg_consistency_away": xg_b.get("xg_consistency", 0.5),
            # Market odds — team_a as home, team_b as away
            "odds_implied_home_win": odds_a.get("implied_home_win", 0.333),
            "odds_implied_away_win": odds_b.get("implied_away_win", 0.333),
            "odds_implied_draw": odds_a.get("implied_draw", 0.334),
            "odds_market_confidence": (odds_a.get("market_confidence", 0.5) + odds_b.get("market_confidence", 0.5)) / 2,
            "odds_margin": (odds_a.get("odds_margin", 0.05) + odds_b.get("odds_margin", 0.05)) / 2,
            # Coach experience — Feature Set 6
            # Defaults: 0 WC editions, 0.45 win rate, 0 trophies, no knockout exp
            "coach_wc_editions": float(_coach_features.get(team_a, {}).get("wc_editions", 0)),
            "coach_intl_win_rate": float(_coach_features.get(team_a, {}).get("intl_win_rate", 0.45)),
            "coach_tournament_wins": float(_coach_features.get(team_a, {}).get("tournament_wins", 0)),
            "coach_experience_diff": float(
                _coach_features.get(team_a, {}).get("wc_editions", 0) -
                _coach_features.get(team_b, {}).get("wc_editions", 0)
            ),
            "coach_knockout_edge": float(
                (1 if _coach_features.get(team_a, {}).get("knockout_experience", False) else 0) -
                (1 if _coach_features.get(team_b, {}).get("knockout_experience", False) else 0)
            ),
        }])

        rf_goals_a = float(_home_model.predict(X)[0])
        rf_goals_b = float(_away_model.predict(X)[0])
        
        # 35% Random Forest (historical goal trends), 65% ELO & Form (current strength)
        goals_a = 0.35 * rf_goals_a + 0.65 * elo_goals_a
        goals_b = 0.35 * rf_goals_b + 0.65 * elo_goals_b
        return max(0.1, goals_a), max(0.1, goals_b)
    except Exception as exc:
        print(f"[WARN] Model prediction failed: {exc}")
        return elo_goals_a, elo_goals_b



def predict_fallback_goals(team_a: str, team_b: str) -> tuple[float, float]:
    """ELO-based expected goals fallback."""
    elo_diff = _get_elo(team_a) - _get_elo(team_b)
    base = 1.2  # average goals per team
    scale = elo_diff / 400.0
    goals_a = base + scale * 0.6 + _get_form(team_a) * 0.4
    goals_b = base - scale * 0.6 + _get_form(team_b) * 0.4
    return max(0.1, goals_a), max(0.1, goals_b)


def goals_to_probs(
    goals_a: float, goals_b: float, stage: str = "group"
) -> tuple[float, float, float]:
    """
    Convert expected goals into win/draw/loss probabilities using a
    Poisson approximation, then apply stage multiplier.
    Returns (prob_a_win, prob_draw, prob_b_win).
    """
    multiplier = STAGE_MULTIPLIER.get(stage, 1.0)
    goals_a = goals_a * multiplier
    goals_b = goals_b * multiplier

    # Poisson mass for 0..6 goals
    MAX_G = 7

    def poisson_pmf(lam: float, k: int) -> float:
        return (lam ** k) * math.exp(-lam) / math.factorial(k)

    prob_a = 0.0
    prob_draw = 0.0
    prob_b = 0.0

    for i in range(MAX_G):
        for j in range(MAX_G):
            p = poisson_pmf(goals_a, i) * poisson_pmf(goals_b, j)
            if i > j:
                prob_a += p
            elif i == j:
                prob_draw += p
            else:
                prob_b += p

    total = prob_a + prob_draw + prob_b
    if total == 0:
        return 0.34, 0.33, 0.33
    return prob_a / total, prob_draw / total, prob_b / total


def simulate_match(team_a: str, team_b: str, stage: str = "r32") -> str:
    """Returns the predicted winner (no draws in knockout)."""
    goals_a, goals_b = predict_with_model(team_a, team_b)
    p_a, _, p_b = goals_to_probs(goals_a, goals_b, stage)
    return team_a if p_a >= p_b else team_b


# ─────────────────────────────────────────────
# Pydantic models
# ─────────────────────────────────────────────

class MatchRequest(BaseModel):
    team_a: str
    team_b: str
    stage: str = "group"


class GroupRequest(BaseModel):
    group_name: str
    teams: list[str]


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "FIFA 2026 Prediction API",
        "version": "1.0.0",
        "models_loaded": _models_loaded,
        "endpoints": ["/predict/match", "/predict/group", "/predict/bracket/full"],
    }


@app.post("/predict/match")
async def predict_match(req: MatchRequest):
    team_a = req.team_a.strip()
    team_b = req.team_b.strip()
    stage = req.stage.lower()

    if team_a == team_b:
        raise HTTPException(status_code=400, detail="team_a and team_b must differ")

    goals_a, goals_b = predict_with_model(team_a, team_b)
    p_a, p_draw, p_b = goals_to_probs(goals_a, goals_b, stage)

    max_prob = max(p_a, p_b)
    winner = team_a if p_a >= p_b else team_b

    elo_diff = round(_get_elo(team_a) - _get_elo(team_b))

    return {
        "team_a": team_a,
        "team_b": team_b,
        "team_a_win_prob": round(p_a, 4),
        "draw_prob": round(p_draw, 4),
        "team_b_win_prob": round(p_b, 4),
        "predicted_winner": winner,
        "confidence": _confidence_label(max_prob),
        "confidence_score": round(max_prob, 4),
        "model_features": {
            "elo_diff": elo_diff,
            "team_a_form": round(_get_form(team_a), 2),
            "team_b_form": round(_get_form(team_b), 2),
            "h2h_wins_a": _get_h2h(team_a, team_b),
        },
    }


@app.post("/predict/group")
async def predict_group(req: GroupRequest):
    teams = [t.strip() for t in req.teams]
    if len(teams) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 teams")

    # Simulate round-robin; accumulate win probabilities
    qualify_scores: dict[str, float] = {t: 0.0 for t in teams}

    for i, ta in enumerate(teams):
        for tb in teams[i + 1 :]:
            goals_a, goals_b = predict_with_model(ta, tb)
            p_a, p_draw, p_b = goals_to_probs(goals_a, goals_b, "group")
            qualify_scores[ta] += p_a + p_draw * 0.5
            qualify_scores[tb] += p_b + p_draw * 0.5

    # Normalize to probability of qualifying (top-2 out of n)
    max_score = max(qualify_scores.values()) or 1.0
    qualify_probs = {t: min(0.99, s / max_score) for t, s in qualify_scores.items()}

    ranked = sorted(qualify_probs.items(), key=lambda x: x[1], reverse=True)

    return {
        "group": req.group_name,
        "rankings": [
            {"team": team, "qualify_prob": round(prob, 4), "rank": idx + 1}
            for idx, (team, prob) in enumerate(ranked)
        ],
        "suggested_qualifiers": [ranked[0][0], ranked[1][0]],
    }


class TeamPathRequest(BaseModel):
    team: str


@app.post("/predict/team-path")
async def predict_team_path(req: TeamPathRequest):
    """Calculate round-by-round advancement probability for a team."""
    team = req.team.strip()

    # Find which group this team belongs to
    team_group = None
    group_teams: list[str] = []
    for group_name, teams in GROUPS_2026.items():
        if team in teams:
            team_group = group_name
            group_teams = teams
            break

    if team_group is None:
        raise HTTPException(status_code=400, detail=f"Team '{team}' not found in any group")

    # Group stage: qualify probability
    qualify_scores: dict[str, float] = {t: 0.0 for t in group_teams}
    for i, ta in enumerate(group_teams):
        for tb in group_teams[i + 1:]:
            goals_a, goals_b = predict_with_model(ta, tb)
            p_a, p_draw, p_b = goals_to_probs(goals_a, goals_b, "group")
            qualify_scores[ta] += p_a + p_draw * 0.5
            qualify_scores[tb] += p_b + p_draw * 0.5

    max_s = max(qualify_scores.values()) or 1.0
    group_qualify_prob = min(0.99, qualify_scores[team] / max_s)

    # Knockout stages: average win probability vs likely opponents at each stage
    # Use ELO to estimate strength of average opponent at each tier
    all_elos = sorted(FIFA_ELO_2026.values(), reverse=True)
    team_elo = _get_elo(team)
    team_form = _get_form(team)

    def _avg_win_prob_at_stage(opponent_elo_tier: float, stage: str) -> float:
        """Estimate win prob vs an opponent of given ELO at a stage."""
        diff = team_elo - opponent_elo_tier
        base_goals = 1.2
        scale = diff / 400.0
        goals_team = base_goals + scale * 0.6 + team_form * 0.4
        goals_opp = base_goals - scale * 0.6 + 0.55 * 0.4  # avg form ~0.55
        goals_team = max(0.1, goals_team)
        goals_opp = max(0.1, goals_opp)
        p_win, _, p_lose = goals_to_probs(goals_team, goals_opp, stage)
        return p_win / (p_win + p_lose) if (p_win + p_lose) > 0 else 0.5

    # Median ELO of teams in each tier bracket
    median_r32_elo = all_elos[len(all_elos) // 2]  # middle tier
    median_r16_elo = all_elos[len(all_elos) // 3]   # upper-middle tier
    median_qf_elo = all_elos[len(all_elos) // 4]    # top quarter
    median_sf_elo = all_elos[4]                       # top 5
    median_final_elo = all_elos[2]                    # top 3

    win_r32 = _avg_win_prob_at_stage(median_r32_elo, "r32")
    win_r16 = _avg_win_prob_at_stage(median_r16_elo, "r16")
    win_qf = _avg_win_prob_at_stage(median_qf_elo, "r8")
    win_sf = _avg_win_prob_at_stage(median_sf_elo, "semi")
    win_final = _avg_win_prob_at_stage(median_final_elo, "final")

    # Cumulative probabilities (each round requires passing all previous)
    prob_reach_r32 = group_qualify_prob
    prob_reach_r16 = prob_reach_r32 * win_r32
    prob_reach_qf = prob_reach_r16 * win_r16
    prob_reach_sf = prob_reach_qf * win_qf
    prob_reach_final = prob_reach_sf * win_sf
    prob_champion = prob_reach_final * win_final

    return {
        "team": team,
        "group": team_group,
        "elo": team_elo,
        "form": round(team_form, 2),
        "path": {
            "qualify_from_group": round(group_qualify_prob, 4),
            "reach_r16": round(prob_reach_r16, 4),
            "reach_quarterfinals": round(prob_reach_qf, 4),
            "reach_semifinals": round(prob_reach_sf, 4),
            "reach_final": round(prob_reach_final, 4),
            "win_tournament": round(prob_champion, 4),
        },
    }


# ─────────────────────────────────────────────
# Full bracket simulation (cached 1 hour)
# ─────────────────────────────────────────────

_bracket_cache: dict[str, Any] = {}
_bracket_cache_ts: float = 0.0
_CACHE_TTL = 3600  # 1 hour


async def _simulate_full_bracket() -> dict:
    global _bracket_cache, _bracket_cache_ts

    now = time.monotonic()
    if _bracket_cache and (now - _bracket_cache_ts) < _CACHE_TTL:
        return _bracket_cache

    # ── Group stage ──────────────────────────
    groups_result: dict[str, Any] = {}
    all_qualifiers: list[str] = []

    for group_name, teams in GROUPS_2026.items():
        qualify_scores: dict[str, float] = {t: 0.0 for t in teams}
        probs_detail: dict[str, dict] = {}

        for i, ta in enumerate(teams):
            for tb in teams[i + 1:]:
                goals_a, goals_b = predict_with_model(ta, tb)
                p_a, p_draw, p_b = goals_to_probs(goals_a, goals_b, "group")
                qualify_scores[ta] += p_a + p_draw * 0.5
                qualify_scores[tb] += p_b + p_draw * 0.5
                probs_detail[f"{ta} vs {tb}"] = {
                    "win_a": round(p_a, 3),
                    "draw": round(p_draw, 3),
                    "win_b": round(p_b, 3),
                }

        max_s = max(qualify_scores.values()) or 1.0
        ranked = sorted(qualify_scores.items(), key=lambda x: x[1], reverse=True)
        qualifiers = [ranked[0][0], ranked[1][0]]
        all_qualifiers.extend(qualifiers)

        groups_result[group_name] = {
            "qualifiers": qualifiers,
            "probs": {t: round(min(0.99, s / max_s), 4) for t, s in qualify_scores.items()},
            "match_probs": probs_detail,
        }

    # ── Knockout rounds ──────────────────────
    # We have 24 group qualifiers. We need to select 16 to advance from Round of 32.
    # To do this, we rank qualifiers by ELO: top 8 get a bye, remaining 16 play 8 matches.
    ranked_qualifiers = sorted(all_qualifiers, key=_get_elo, reverse=True)
    byes = ranked_qualifiers[:8]
    playoffs = ranked_qualifiers[8:]

    r32_winners = []
    for i in range(0, 16, 2):
        winner = simulate_match(playoffs[i], playoffs[i + 1], "r32")
        r32_winners.append(winner)

    r32_selections = byes + r32_winners  # Exactly 16 teams

    # Round of 16 (16 teams -> 8 winners)
    r16_selections = []
    for i in range(0, 16, 2):
        winner = simulate_match(r32_selections[i], r32_selections[i + 1], "r16")
        r16_selections.append(winner)

    # Quarterfinals (8 teams -> 4 winners)
    r8_selections = []
    for i in range(0, 8, 2):
        winner = simulate_match(r16_selections[i], r16_selections[i + 1], "r8")
        r8_selections.append(winner)

    # Semifinals (4 teams -> 2 finalists)
    semi_selections = []
    for i in range(0, 4, 2):
        winner = simulate_match(r8_selections[i], r8_selections[i + 1], "semi")
        semi_selections.append(winner)

    # Final (2 finalists -> 1 champion)
    final_winner = simulate_match(semi_selections[0], semi_selections[1], "final")

    # ── Tournament win probabilities ─────────
    win_probs: dict[str, float] = {}
    for team in all_qualifiers:
        elo = _get_elo(team)
        form = _get_form(team)
        raw = (elo / 1000) * form
        win_probs[team] = round(raw, 4)

    total = sum(win_probs.values()) or 1.0
    win_probs = {t: round(v / total, 4) for t, v in sorted(
        win_probs.items(), key=lambda x: x[1], reverse=True
    )}

    result = {
        "groups": {g: info["qualifiers"] for g, info in groups_result.items()},
        "r32": r32_selections,
        "r16": r16_selections,
        "r8": r8_selections,
        "semi": semi_selections,
        "final": final_winner,
        "win_probabilities": win_probs,
    }

    _bracket_cache = result
    _bracket_cache_ts = now
    return result


@app.get("/predict/bracket/full")
async def predict_bracket_full():
    return await _simulate_full_bracket()
