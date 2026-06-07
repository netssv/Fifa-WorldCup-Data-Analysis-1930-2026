"""Evaluation helpers for model explainability and baseline comparison."""
from __future__ import annotations

from .predictions import predict_fallback_goals, goals_to_probs
from .model_loader import (
    _home_model, _away_model, _models_loaded, _odds_features,
)


def _normalize_prob_triplet(home: float, draw: float, away: float) -> tuple[float, float, float]:
    total = home + draw + away
    if total <= 0.0:
        return 1 / 3, 1 / 3, 1 / 3
    return home / total, draw / total, away / total


def compute_benchmark_probs(team_a: str, team_b: str, stage: str = "group") -> dict[str, float]:
    """Return benchmark probability estimates for Elo fallback and current odds features."""
    elo_goals_a, elo_goals_b = predict_fallback_goals(team_a, team_b)
    elo_probs = goals_to_probs(elo_goals_a, elo_goals_b, stage)

    odds_a = _odds_features.get(team_a)
    odds_b = _odds_features.get(team_b)
    if odds_a is None or odds_b is None:
        odds_probs = None
    else:
        implied_home = float(odds_a.get("implied_home_win", 0.33))
        implied_draw = float((odds_a.get("implied_draw", 0.33) + odds_b.get("implied_draw", 0.33)) / 2)
        implied_away = float(odds_b.get("implied_away_win", 0.33))
        home, draw, away = _normalize_prob_triplet(implied_home, implied_draw, implied_away)
        odds_probs = {
            "home": round(home, 4),
            "draw": round(draw, 4),
            "away": round(away, 4),
        }

    return {
        "elo_baseline": {
            "home": round(elo_probs[0], 4),
            "draw": round(elo_probs[1], 4),
            "away": round(elo_probs[2], 4),
        },
        "odds_baseline": odds_probs,
    }


def _load_feature_names(model: object) -> list[str] | None:
    if model is None:
        return None
    if hasattr(model, "feature_names_in_"):
        return list(model.feature_names_in_)
    if hasattr(model, "get_booster"):
        booster = model.get_booster()
        score = booster.get_score(importance_type="gain")
        return sorted(score.keys())
    return None


def _importance_from_model(model: object) -> dict[str, float]:
    if model is None or not hasattr(model, "get_booster"):
        return {}
    booster = model.get_booster()
    gain = booster.get_score(importance_type="gain")
    return {key: float(value) for key, value in gain.items()}


def get_feature_importance(top_n: int = 20) -> dict[str, object]:
    """Return combined feature importance from home and away goal models."""
    if not _models_loaded or _home_model is None or _away_model is None:
        return {
            "loaded": False,
            "features": [],
            "note": "Models are not loaded or unavailable.",
        }

    home_importance = _importance_from_model(_home_model)
    away_importance = _importance_from_model(_away_model)
    feature_names = _load_feature_names(_home_model) or []
    combined = {}
    if feature_names:
        for name in feature_names:
            combined[name] = {
                "home_gain": home_importance.get(name, 0.0),
                "away_gain": away_importance.get(name, 0.0),
            }
            combined[name]["average_gain"] = round(
                (combined[name]["home_gain"] + combined[name]["away_gain"]) / 2.0,
                6,
            )
    else:
        for name in set(home_importance) | set(away_importance):
            combined[name] = {
                "home_gain": home_importance.get(name, 0.0),
                "away_gain": away_importance.get(name, 0.0),
                "average_gain": round(
                    (home_importance.get(name, 0.0) + away_importance.get(name, 0.0)) / 2.0,
                    6,
                ),
            }

    sorted_features = sorted(
        [
            {"feature": name, **values}
            for name, values in combined.items()
        ],
        key=lambda row: row["average_gain"],
        reverse=True,
    )
    return {
        "loaded": True,
        "features": sorted_features[:top_n],
    }
