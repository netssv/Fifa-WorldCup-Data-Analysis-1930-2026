"""
predictions.py
──────────────
Core prediction helpers: ELO fallback, Poisson goal-to-prob converter,
RF-blended model prediction, and pressure calibration.
"""
from __future__ import annotations

import math

from .constants import FIFA_ELO_2026, TEAM_FORM, H2H_WINS, STAGE_MULTIPLIER
from .model_loader import (
    _home_model, _away_model, _models_loaded,
    _squad_values, _eafc_ratings, _xg_features,
    _odds_features, _coach_features, _fatigue_features,
    _pressure_features,
)
from .feature_builder import build_feature_row

_PRESS_DEFAULTS = {"penalty_win_rate": 0.48, "big_match_win_rate": 0.37, "knockout_win_rate": 0.42}


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


def predict_fallback_goals(
    team_a: str, team_b: str,
    elo_a_override: float | None = None,
    elo_b_override: float | None = None,
    form_a_override: float | None = None,
    form_b_override: float | None = None,
) -> tuple[float, float]:
    """ELO-based expected goals fallback."""
    elo_a = elo_a_override if elo_a_override is not None else _get_elo(team_a)
    elo_b = elo_b_override if elo_b_override is not None else _get_elo(team_b)
    scale = (elo_a - elo_b) / 400.0
    form_a = form_a_override if form_a_override is not None else _get_form(team_a)
    form_b = form_b_override if form_b_override is not None else _get_form(team_b)
    return max(0.1, 1.2 + scale * 0.6 + form_a * 0.4), max(0.1, 1.2 - scale * 0.6 + form_b * 0.4)


def goals_to_probs(goals_a: float, goals_b: float, stage: str = "group") -> tuple[float, float, float]:
    """Convert expected goals into win/draw/loss probabilities using Poisson."""
    m = STAGE_MULTIPLIER.get(stage, 1.0)
    goals_a, goals_b = goals_a * m, goals_b * m

    def pmf(lam: float, k: int) -> float:
        return (lam ** k) * math.exp(-lam) / math.factorial(k)

    prob_a = prob_draw = prob_b = 0.0
    for i in range(7):
        for j in range(7):
            p = pmf(goals_a, i) * pmf(goals_b, j)
            if i > j:
                prob_a += p
            elif i == j:
                prob_draw += p
            else:
                prob_b += p
    total = prob_a + prob_draw + prob_b or 1.0
    return prob_a / total, prob_draw / total, prob_b / total


def predict_with_model(
    team_a: str, team_b: str, stage: str = "r32",
    elo_a_override: float | None = None, elo_b_override: float | None = None,
    form_a_override: float | None = None, form_b_override: float | None = None,
    penalty_a_override: float | None = None, penalty_b_override: float | None = None,
    big_match_a_override: float | None = None, big_match_b_override: float | None = None,
    knockout_a_override: float | None = None, knockout_b_override: float | None = None,
) -> tuple[float, float]:
    """Blends RF models with ELO/Form and pressure calibration."""
    elo_goals_a, elo_goals_b = predict_fallback_goals(
        team_a, team_b, elo_a_override, elo_b_override, form_a_override, form_b_override
    )
    if not _models_loaded or _home_model is None:
        return elo_goals_a, elo_goals_b

    try:
        elo_a = elo_a_override if elo_a_override is not None else _get_elo(team_a)
        elo_b = elo_b_override if elo_b_override is not None else _get_elo(team_b)
        elo_diff = elo_a - elo_b

        X = build_feature_row(
            team_a=team_a, team_b=team_b, stage=stage,
            elo_diff=elo_diff, goal_diff_avg=(elo_diff / 400.0) * 1.2,
            home_form=form_a_override if form_a_override is not None else _get_form(team_a),
            away_form=form_b_override if form_b_override is not None else _get_form(team_b),
            h2h_wins=_get_h2h(team_a, team_b),
            squad_values=_squad_values, eafc_ratings=_eafc_ratings,
            xg_features=_xg_features, odds_features=_odds_features,
            coach_features=_coach_features, fatigue_features=_fatigue_features,
        )

        rf_a = float(_home_model.predict(X)[0])
        rf_b = float(_away_model.predict(X)[0])
        goals_a = 0.35 * rf_a + 0.65 * elo_goals_a
        goals_b = 0.35 * rf_b + 0.65 * elo_goals_b

        # Feature Set 8: Pressure calibration
        press_a = {**_PRESS_DEFAULTS, **_pressure_features.get(team_a, {})}
        press_b = {**_PRESS_DEFAULTS, **_pressure_features.get(team_b, {})}
        if penalty_a_override is not None: press_a["penalty_win_rate"] = penalty_a_override
        if penalty_b_override is not None: press_b["penalty_win_rate"] = penalty_b_override
        if big_match_a_override is not None: press_a["big_match_win_rate"] = big_match_a_override
        if big_match_b_override is not None: press_b["big_match_win_rate"] = big_match_b_override
        if knockout_a_override is not None: press_a["knockout_win_rate"] = knockout_a_override
        if knockout_b_override is not None: press_b["knockout_win_rate"] = knockout_b_override

        score_a = sum(press_a[k] for k in _PRESS_DEFAULTS) / 3
        score_b = sum(press_b[k] for k in _PRESS_DEFAULTS) / 3
        boost = math.tanh((score_a - score_b) * 3) * 0.05
        return max(0.1, goals_a * (1 + boost)), max(0.1, goals_b * (1 - boost))
    except Exception as exc:
        print(f"[WARN] Model prediction failed: {exc}")
        return elo_goals_a, elo_goals_b


def simulate_match(team_a: str, team_b: str, stage: str = "r32") -> str:
    """Returns the predicted winner (no draws in knockout)."""
    goals_a, goals_b = predict_with_model(team_a, team_b)
    p_a, _, p_b = goals_to_probs(goals_a, goals_b, stage)
    return team_a if p_a >= p_b else team_b
