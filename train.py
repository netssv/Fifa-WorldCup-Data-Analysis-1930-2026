import argparse
import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error
from xgboost import XGBRegressor

from src.evaluation_helpers import poisson_match_probs, evaluate_probability_forecast
from src.validation_helpers import validate_matches_data

def _elo_baseline_probs(X: pd.DataFrame) -> np.ndarray:
    elo_diff = X["elo_diff"].to_numpy(dtype=float)
    home_form = X["home_form"].to_numpy(dtype=float)
    away_form = X["away_form"].to_numpy(dtype=float)
    goals_a = np.maximum(0.05, 1.2 + (elo_diff / 400.0) * 0.6 + home_form * 0.4)
    goals_b = np.maximum(0.05, 1.2 - (elo_diff / 400.0) * 0.6 + away_form * 0.4)
    probs = np.vstack([poisson_match_probs(a, b) for a, b in zip(goals_a, goals_b)])
    return probs


def _odds_baseline_probs(X: pd.DataFrame) -> np.ndarray:
    raw = X[["odds_implied_home_win", "odds_implied_draw", "odds_implied_away_win"]].to_numpy(dtype=float)
    raw = np.clip(raw, 1e-4, 1.0)
    normed = raw / raw.sum(axis=1, keepdims=True)
    return normed


def train_models(
    features_path: str = "data/processed/features_v4.csv",
    matches_path: str = "Data/clean_fifa_worldcup_matches.csv",
    models_dir: str = "Predictions and Models Folder",
    test_size: float = 0.20,
    random_state: int = 42,
    use_odds_in_training: bool = True,
):
    if not os.path.exists(features_path):
        raise FileNotFoundError(f"Features file not found at {features_path}. Run build_features_v4 first.")
    if not os.path.exists(matches_path):
        raise FileNotFoundError(f"Matches file not found at {matches_path}.")
        
    df_features = pd.read_csv(features_path)
    df_matches = pd.read_csv(matches_path)
    validate_matches_data(df_matches)
    
    y_home = df_matches["HomeGoals"].astype(int)
    y_away = df_matches["AwayGoals"].astype(int)
    assert len(df_features) == len(df_matches), "Mismatch between matches and features lengths."
    
    feature_cols = [
        "elo_diff", "goal_diff_avg", "home_form", "away_form", "h2h_wins", "is_knockout",
        "squad_value_ratio", "value_log_home", "value_log_away",
        "eafc_overall_diff", "eafc_physic_diff", "eafc_top5_avg_home",
        "venue_altitude_m", "is_high_altitude", "altitude_penalty",
        "titles_diff", "semis_diff", "appearances_diff",
        "avg_age_diff", "avg_caps_diff", "travel_dist_diff", "climate_compat_diff",
        "synergy_diff", "top5_ratio_diff", "goals_scored_diff", "clean_sheets_diff",
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
        "fatigue_avg_club_matches_home", "fatigue_avg_club_matches_away",
        "fatigue_ucl_players_home", "fatigue_ucl_players_away",
        "fatigue_index_diff", "fatigue_days_since_last_match_diff"
    ]
    
    X = df_features[feature_cols].copy()
    if X.isnull().any().any():
        print("[WARN] Missing feature values detected. Filling missing values with column medians.")
        X = X.fillna(X.median(numeric_only=True))

    if not use_odds_in_training:
        feature_cols = [c for c in feature_cols if not c.startswith("odds_")]
        X = X[feature_cols].copy()
        print("[WARN] Odds features excluded from training to prevent leakage")

    sort_index = df_matches.sort_values("Year").index
    df_matches_sorted = df_matches.loc[sort_index].reset_index(drop=True)
    X_sorted = X.loc[sort_index].reset_index(drop=True)
    y_home_sorted = y_home.loc[sort_index].reset_index(drop=True)
    y_away_sorted = y_away.loc[sort_index].reset_index(drop=True)

    year_threshold = 2019
    train_mask = df_matches_sorted["Year"] < year_threshold
    val_mask = df_matches_sorted["Year"] >= year_threshold
    
    X_train = X_sorted[train_mask].copy()
    X_val = X_sorted[val_mask].copy()
    y_home_train = y_home_sorted[train_mask].copy()
    y_home_val = y_home_sorted[val_mask].copy()
    y_away_train = y_away_sorted[train_mask].copy()
    y_away_val = y_away_sorted[val_mask].copy()

    print(f"Train set: {train_mask.sum()} matches, Val set: {val_mask.sum()} matches")
    
    home_model = XGBRegressor(
        objective="count:poisson", n_estimators=800, learning_rate=0.05, max_depth=5,
        subsample=0.82, colsample_bytree=0.82, random_state=random_state,
        n_jobs=-1, verbosity=0, tree_method="hist", early_stopping_rounds=50,
    )
    away_model = XGBRegressor(
        objective="count:poisson", n_estimators=800, learning_rate=0.05, max_depth=5,
        subsample=0.82, colsample_bytree=0.82, random_state=random_state,
        n_jobs=-1, verbosity=0, tree_method="hist", early_stopping_rounds=50,
    )
    
    home_model.fit(X_train, y_home_train, eval_set=[(X_val, y_home_val)], verbose=False)
    away_model.fit(X_train, y_away_train, eval_set=[(X_val, y_away_val)], verbose=False)

    y_home_pred = np.clip(home_model.predict(X_val), 0.0, None)
    y_away_pred = np.clip(away_model.predict(X_val), 0.0, None)

    print("Validation results (holdout set):")
    print(f"  Home goals MAE: {mean_absolute_error(y_home_val, y_home_pred):.4f}")
    print(f"  Away goals MAE: {mean_absolute_error(y_away_val, y_away_pred):.4f}")
    print(f"  Home goals RMSE: {np.sqrt(mean_squared_error(y_home_val, y_home_pred)):.4f}")
    print(f"  Away goals RMSE: {np.sqrt(mean_squared_error(y_away_val, y_away_pred)):.4f}")

    home_probs = np.vstack([poisson_match_probs(a, b) for a, b in zip(y_home_pred, y_away_pred)])
    elo_probs = _elo_baseline_probs(X_val)
    model_metrics = evaluate_probability_forecast(y_home_val.to_numpy(), y_away_val.to_numpy(), home_probs, "model")
    elo_metrics = evaluate_probability_forecast(y_home_val.to_numpy(), y_away_val.to_numpy(), elo_probs, "elo_baseline")
    
    print("\nForecast calibration and baseline comparison:")
    print(f"  Model Brier score: {model_metrics['model_brier']:.4f}, Log loss: {model_metrics['model_log_loss']:.4f}, ECE: {model_metrics['model_ece']:.4f}")
    print(f"  Elo baseline Brier: {elo_metrics['elo_baseline_brier']:.4f}, Log loss: {elo_metrics['elo_baseline_log_loss']:.4f}, ECE: {elo_metrics['elo_baseline_ece']:.4f}")

    model_brier = model_metrics.get("model_brier")
    model_log_loss = model_metrics.get("model_log_loss")
    
    assert model_brier < 0.65, f"Brier score {model_brier} exceeds 0.65 threshold"
    assert model_log_loss < 1.15, f"Log Loss {model_log_loss} exceeds 1.15 threshold"

    metrics_export = {
        "model": {"brier": round(float(model_brier), 4), "log_loss": round(float(model_log_loss), 4), "ece": round(float(model_metrics.get("model_ece")), 4)},
        "elo_baseline": {"brier": round(float(elo_metrics.get("elo_baseline_brier")), 4), "log_loss": round(float(elo_metrics.get("elo_baseline_log_loss")), 4), "ece": round(float(elo_metrics.get("elo_baseline_ece")), 4)}
    }

    os.makedirs(models_dir, exist_ok=True)
    with open(os.path.join(models_dir, "calibration_metrics.json"), "w") as f:
        json.dump(metrics_export, f, indent=2)

    joblib.dump(home_model, os.path.join(models_dir, "home_goal_model.pkl"))
    joblib.dump(away_model, os.path.join(models_dir, "away_goal_model.pkl"))
    print("Models trained successfully!")

    return {
        "home_model": home_model, "away_model": away_model,
        "validation": {
            "home_goals_mae": float(mean_absolute_error(y_home_val, y_home_pred)),
            "away_goals_mae": float(mean_absolute_error(y_away_val, y_away_pred)),
            "home_goals_rmse": float(np.sqrt(mean_squared_error(y_home_val, y_home_pred))),
            "away_goals_rmse": float(np.sqrt(mean_squared_error(y_away_val, y_away_pred))),
            **model_metrics, **elo_metrics,
        },
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train FIFA World Cup goal models.")
    parser.add_argument("--features", default="data/processed/features_v4.csv")
    parser.add_argument("--matches", default="Data/clean_fifa_worldcup_matches.csv")
    parser.add_argument("--models-dir", default="Predictions and Models Folder")
    parser.add_argument("--test-size", type=float, default=0.20)
    parser.add_argument("--random-state", type=int, default=42)
    args = parser.parse_args()
    train_models(
        features_path=args.features, matches_path=args.matches,
        models_dir=args.models_dir, test_size=args.test_size, random_state=args.random_state,
    )
