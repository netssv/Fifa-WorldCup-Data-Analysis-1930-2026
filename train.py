import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

def train_models(
    features_path: str = "data/processed/features_v4.csv",
    matches_path: str = "Data/clean_fifa_worldcup_matches.csv",
    models_dir: str = "Predictions and Models Folder"
):
    """
    Trains the home and away goal prediction models using features_v4.csv
    and saves the trained models to disk.
    """
    if not os.path.exists(features_path):
        raise FileNotFoundError(f"Features file not found at {features_path}. Run build_features_v4 first.")
    if not os.path.exists(matches_path):
        raise FileNotFoundError(f"Matches file not found at {matches_path}.")
        
    df_features = pd.read_csv(features_path)
    df_matches = pd.read_csv(matches_path)
    
    # Align target labels (HomeGoals/AwayGoals) from matches dataset
    y_home = df_matches["HomeGoals"]
    y_away = df_matches["AwayGoals"]
    
    # Confirm exact same number of entries
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
        # Market odds — Feature Set 5
        "odds_implied_home_win", "odds_implied_away_win", "odds_implied_draw",
        "odds_market_confidence", "odds_margin",
        # Coach experience — Feature Set 6
        "coach_wc_editions", "coach_intl_win_rate", "coach_tournament_wins",
        "coach_experience_diff", "coach_knockout_edge",
        # Fatigue and Match Load — Feature Set 7
        "fatigue_avg_club_matches_home", "fatigue_avg_club_matches_away",
        "fatigue_ucl_players_home", "fatigue_ucl_players_away",
        "fatigue_index_diff", "fatigue_days_since_last_match_diff"
    ]
    
    X = df_features[feature_cols]
    
    print(f"Training models with {X.shape[0]} matches and {len(feature_cols)} features...")
    
    home_model = RandomForestRegressor(n_estimators=100, random_state=42)
    away_model = RandomForestRegressor(n_estimators=100, random_state=42)
    
    home_model.fit(X, y_home)
    away_model.fit(X, y_away)
    
    os.makedirs(models_dir, exist_ok=True)
    home_model_path = os.path.join(models_dir, "home_goal_model.pkl")
    away_model_path = os.path.join(models_dir, "away_goal_model.pkl")
    
    joblib.dump(home_model, home_model_path)
    joblib.dump(away_model, away_model_path)
    
    print("Models trained successfully!")
    print(f"Saved: {home_model_path} and {away_model_path}")

if __name__ == "__main__":
    train_models()
