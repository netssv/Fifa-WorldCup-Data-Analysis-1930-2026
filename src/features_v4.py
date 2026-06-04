import os
import numpy as np
import pandas as pd
from src.features_v3 import build_features_v3

def build_features_v4(
    df_matches: pd.DataFrame,
    df_squad_values: pd.DataFrame,
    df_eafc: pd.DataFrame,
    df_xg: pd.DataFrame = None,
    df_odds: pd.DataFrame = None,
    coaches_json_path: str = "data/coaches_wc2026.json",
    fatigue_path: str = "data/processed/fatigue_features.csv",
    venue_col: str = 'venue_city'
) -> pd.DataFrame:
    """
    Builds the V4 feature matrix containing:
      - 48 baseline features from V3
      - 6 Fatigue/Match Load features (Feature Set 7)
    Total: 54 features
    """
    # 1. Start with the V3 feature matrix (which already has target column)
    # To avoid losing target col, we run build_features_v3 first
    df_v3 = build_features_v3(
        df_matches, df_squad_values, df_eafc, df_xg, df_odds,
        coaches_json_path=coaches_json_path, venue_col=venue_col
    )
    
    # We need to merge with the match metadata columns from df_matches to align teams
    # because build_features_v3 only returns features + target.
    # So we copy df_matches first, run v3 features, and then append the new ones.
    df = df_matches.copy()
    
    # Load fatigue features
    if os.path.exists(fatigue_path):
        df_fatigue = pd.read_csv(fatigue_path)
    else:
        # Fallback empty dataframe
        df_fatigue = pd.DataFrame(columns=[
            "team_name", "avg_club_matches", "ucl_players_count", 
            "days_since_last_match", "fatigue_index"
        ])
        
    # Merge for home team
    df_fatigue_home = df_fatigue.rename(columns={
        "team_name": "home_team_ref",
        "avg_club_matches": "fatigue_avg_club_matches_home",
        "ucl_players_count": "fatigue_ucl_players_home",
        "days_since_last_match": "fatigue_days_since_last_match_home",
        "fatigue_index": "fatigue_index_home"
    })
    # Merge for away team
    df_fatigue_away = df_fatigue.rename(columns={
        "team_name": "away_team_ref",
        "avg_club_matches": "fatigue_avg_club_matches_away",
        "ucl_players_count": "fatigue_ucl_players_away",
        "days_since_last_match": "fatigue_days_since_last_match_away",
        "fatigue_index": "fatigue_index_away"
    })
    
    # Ensure columns match for merging
    if "home_team" not in df.columns and "HomeTeam" in df.columns:
        df = df.rename(columns={"HomeTeam": "home_team", "AwayTeam": "away_team"})
        
    df = df.merge(df_fatigue_home, left_on="home_team", right_on="home_team_ref", how="left")
    df = df.merge(df_fatigue_away, left_on="away_team", right_on="away_team_ref", how="left")
    
    # Fill defaults for missing teams (e.g. historical teams not in WC 2026 presets)
    # Default values based on dataset average: ~25.0 matches, 0 UCL players, 18 rest days, 0.65 index
    fill_defaults = {
        "fatigue_avg_club_matches_home": 25.0,
        "fatigue_avg_club_matches_away": 25.0,
        "fatigue_ucl_players_home": 0.0,
        "fatigue_ucl_players_away": 0.0,
        "fatigue_days_since_last_match_home": 18.0,
        "fatigue_days_since_last_match_away": 18.0,
        "fatigue_index_home": 25.0 / 38,
        "fatigue_index_away": 25.0 / 38
    }
    for col, val in fill_defaults.items():
        df[col] = df[col].fillna(val)
        
    # 2. Compute relative fatigue features
    df["fatigue_index_diff"] = df["fatigue_index_home"] - df["fatigue_index_away"]
    df["fatigue_days_since_last_match_diff"] = df["fatigue_days_since_last_match_home"] - df["fatigue_days_since_last_match_away"]
    
    # New fatigue feature list
    fatigue_cols = [
        "fatigue_avg_club_matches_home",
        "fatigue_avg_club_matches_away",
        "fatigue_ucl_players_home",
        "fatigue_ucl_players_away",
        "fatigue_index_diff",
        "fatigue_days_since_last_match_diff"
    ]
    
    # 3. Concatenate V3 features and fatigue features
    # Assert that lengths match
    assert len(df_v3) == len(df), "Mismatch between matches and feature alignment."
    
    # List of all features (V3 features list is 48 features)
    v3_cols = [c for c in df_v3.columns if c != "target"]
    assert len(v3_cols) == 48, f"Expected 48 V3 features, got {len(v3_cols)}"
    
    # Extract only the v3 features and new fatigue features
    X_v3 = df_v3[v3_cols].reset_index(drop=True)
    X_fatigue = df[fatigue_cols].reset_index(drop=True)
    y = df_v3["target"].reset_index(drop=True)
    
    df_v4 = pd.concat([X_v3, X_fatigue, y], axis=1)
    
    # Check total feature columns (54 features + 1 target)
    expected_total_cols = 54 + 1
    assert len(df_v4.columns) == expected_total_cols, f"Expected {expected_total_cols} columns, got {len(df_v4.columns)}"
    
    return df_v4

def main():
    squad_path = "data/processed/squad_values_2026.csv"
    eafc_path = "data/processed/eafc_ratings_2026.csv"
    xg_path = "data/processed/xg_features_2026.csv"
    matches_path = "Data/clean_fifa_worldcup_matches.csv"
    odds_path = "data/processed/odds_features_2026.csv"
    coaches_path = "data/coaches_wc2026.json"
    fatigue_path = "data/processed/fatigue_features.csv"

    if not (os.path.exists(squad_path) and os.path.exists(eafc_path) and os.path.exists(matches_path)):
        print("[WARN] Missing base datasets. Run setup first.")
        return

    df_matches = pd.read_csv(matches_path)
    df_squad = pd.read_csv(squad_path)
    df_eafc = pd.read_csv(eafc_path)
    df_xg = pd.read_csv(xg_path) if os.path.exists(xg_path) else None
    df_odds = pd.read_csv(odds_path) if os.path.exists(odds_path) else None

    # Rename original columns if needed
    if "home_team" not in df_matches.columns and "HomeTeam" in df_matches.columns:
        df_matches = df_matches.rename(columns={"HomeTeam": "home_team", "AwayTeam": "away_team"})

    # Set up basic columns
    df_matches["elo_diff"] = 0.0
    df_matches["goal_diff_avg"] = 0.0
    df_matches["home_form"] = 0.5
    df_matches["away_form"] = 0.5
    df_matches["h2h_wins"] = 0
    df_matches["is_knockout"] = 0
    if "venue_city" not in df_matches.columns:
        df_matches["venue_city"] = "neutral"

    df_features_v4 = build_features_v4(
        df_matches, df_squad, df_eafc, df_xg, df_odds,
        coaches_json_path=coaches_path, fatigue_path=fatigue_path
    )
    
    output_features_path = "data/processed/features_v4.csv"
    os.makedirs(os.path.dirname(output_features_path), exist_ok=True)
    df_features_v4.to_csv(output_features_path, index=False)
    print(f"Features V4 successfully created at {output_features_path}")
    print(f"Shape of feature matrix: {df_features_v4.shape}")

if __name__ == "__main__":
    main()
