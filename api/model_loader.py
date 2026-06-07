from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from .constants import FIFA_ELO_2026

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
_fatigue_features: dict[str, dict] = {}
_pressure_features: dict[str, dict[str, float]] = {}
_macro_features: dict[str, dict[str, float]] = {}


def _load_extra_features() -> None:
    global _squad_values, _eafc_ratings, _xg_features, _odds_features, _coach_features, _fatigue_features, _pressure_features, _macro_features
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

    fatigue_path = BASE_DIR / "data" / "processed" / "fatigue_features.csv"
    if fatigue_path.exists():
        try:
            df = pd.read_csv(fatigue_path)
            for _, row in df.iterrows():
                _fatigue_features[row["team_name"]] = {
                    "avg_club_matches": float(row["avg_club_matches"]),
                    "ucl_players_count": float(row["ucl_players_count"]),
                    "days_since_last_match": float(row["days_since_last_match"]),
                    "fatigue_index": float(row["fatigue_index"]),
                }
        except Exception as exc:
            print(f"[WARN] Could not load fatigue features: {exc}")

    # ── Feature Set 8: Pressure / Key-Match ──────────────────────────────
    pressure_path = BASE_DIR / "data" / "processed" / "pressure_features.csv"
    if pressure_path.exists():
        try:
            df = pd.read_csv(pressure_path)
            for _, row in df.iterrows():
                _pressure_features[row["team_name"]] = {
                    "penalty_win_rate":    float(row["penalty_win_rate"]),
                    "big_match_win_rate":  float(row["big_match_win_rate"]),
                    "knockout_win_rate":   float(row["knockout_win_rate"]),
                }
            print(f"[INFO] Pressure features loaded: {len(_pressure_features)} teams")
        except Exception as exc:
            print(f"[WARN] Could not load pressure features: {exc}")

    macro_path = BASE_DIR / "data" / "raw" / "macroeconomics.csv"
    if macro_path.exists():
        try:
            df = pd.read_csv(macro_path)
            for _, row in df.iterrows():
                _macro_features[row["team_name"]] = {
                    "gdp_per_capita_ppp": float(row["gdp_per_capita_ppp"]),
                    "population": float(row["population"]),
                }
            print(f"[INFO] Macroeconomic features loaded: {len(_macro_features)} teams")
        except Exception as exc:
            print(f"[WARN] Could not load macroeconomic features: {exc}")


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
