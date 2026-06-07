"""
predictions.py
--------------
Core prediction helpers: Elo fallback, Poisson goal-to-probability converter,
RF-blended model prediction, and post-processing calibration pipeline.
"""
from __future__ import annotations

import math

from .constants import FIFA_ELO_2026, TEAM_FORM, H2H_WINS, STAGE_MULTIPLIER
from .model_loader import (
    _home_model, _away_model, _models_loaded,
    _squad_values, _eafc_ratings, _xg_features,
    _odds_features, _coach_features, _fatigue_features,
    _pressure_features, _macro_features,
)
from .feature_builder import build_feature_row

_prediction_cache: dict[tuple, tuple[float, float]] = {}

def clear_prediction_cache():
    """Clears the in-memory prediction cache. Call this before a new simulation batch."""
    _prediction_cache.clear()


def _get_elo(team: str) -> float:
    """Returns the Elo rating for a team, defaulting to 1400 for unknown teams."""
    return FIFA_ELO_2026.get(team, 1400.0)


def _get_form(team: str) -> float:
    """Returns recent form score (wins in last 10 games / 10), defaulting to 0.45."""
    return TEAM_FORM.get(team, 0.45)


def _get_h2h(team_a: str, team_b: str) -> int:
    """Returns head-to-head win count for team_a vs team_b."""
    return H2H_WINS.get((team_a, team_b), 0)


def _confidence_label(prob: float) -> str:
    """Maps a win probability to a human-readable confidence label."""
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
    """Elo-based expected goals fallback when RF models are unavailable."""
    elo_a = elo_a_override if elo_a_override is not None else _get_elo(team_a)
    elo_b = elo_b_override if elo_b_override is not None else _get_elo(team_b)
    scale = (elo_a - elo_b) / 400.0
    form_a = form_a_override if form_a_override is not None else _get_form(team_a)
    form_b = form_b_override if form_b_override is not None else _get_form(team_b)
    return max(0.1, 1.2 + scale * 0.6 + form_a * 0.4), max(0.1, 1.2 - scale * 0.6 + form_b * 0.4)


def goals_to_probs(goals_a: float, goals_b: float, stage: str = "group") -> tuple[float, float, float]:
    """Converts expected goals into win/draw/loss probabilities using a Poisson grid (0-6 goals)."""
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
    use_goldman: bool = True, use_klement: bool = True,
) -> tuple[float, float]:
    """Blends RF model predictions (35%) with Elo/Form fallback (65%), then applies all calibrations."""
    cache_key = (
        team_a, team_b, stage,
        elo_a_override, elo_b_override,
        form_a_override, form_b_override,
        penalty_a_override, penalty_b_override,
        big_match_a_override, big_match_b_override,
        knockout_a_override, knockout_b_override,
        use_goldman, use_klement
    )
    if cache_key in _prediction_cache:
        return _prediction_cache[cache_key]

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

        # Apply all post-processing calibrations from the dedicated calibrators module.
        from .calibrators import calibrate_goals
        goals_a, goals_b = calibrate_goals(
            goals_a, goals_b, team_a, team_b, stage,
            _pressure_features, _macro_features,
            penalty_a_override, penalty_b_override,
            big_match_a_override, big_match_b_override,
            knockout_a_override, knockout_b_override,
            use_goldman=use_goldman, use_klement=use_klement
        )

        res = max(0.1, goals_a), max(0.1, goals_b)
        _prediction_cache[cache_key] = res
        return res
    except Exception as exc:
        print(f"[WARN] Model prediction failed: {exc}")
        return elo_goals_a, elo_goals_b


def simulate_match(team_a: str, team_b: str, stage: str = "r32") -> str:
    """Returns the predicted winner (no draws in knockout)."""
    goals_a, goals_b = predict_with_model(team_a, team_b)
    p_a, _, p_b = goals_to_probs(goals_a, goals_b, stage)
    return team_a if p_a >= p_b else team_b
