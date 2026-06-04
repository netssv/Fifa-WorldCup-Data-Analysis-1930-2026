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

def _load_models() -> bool:
    """Load RF models from disk. Returns True if successful."""
    global _home_model, _away_model, _label_encoder
    home_path = MODELS_DIR / "home_goal_model.pkl"
    away_path = MODELS_DIR / "away_goal_model.pkl"

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


def predict_with_model(team_a: str, team_b: str) -> tuple[float, float]:
    """
    Use the RF regressors to predict goals. Returns (goals_a, goals_b).
    Falls back to ELO if models are not loaded.
    """
    if not _models_loaded or _home_model is None:
        return predict_fallback_goals(team_a, team_b)

    try:
        enc_a = _encode_team(team_a)
        enc_b = _encode_team(team_b)
        X = pd.DataFrame(
            [[enc_a, enc_b, 2026]],
            columns=["HomeTeamEncoded", "AwayTeamEncoded", "Year"],
        )
        goals_a = float(_home_model.predict(X)[0])
        goals_b = float(_away_model.predict(X)[0])
        return max(0.0, goals_a), max(0.0, goals_b)
    except Exception as exc:
        print(f"[WARN] Model prediction failed: {exc}")
        return predict_fallback_goals(team_a, team_b)


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
