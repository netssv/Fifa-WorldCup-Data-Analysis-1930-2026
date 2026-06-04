import os
import numpy as np
import pandas as pd
from src.constants import VENUE_ALTITUDE_2026, HIGH_ALTITUDE_THRESHOLD_M, HIGH_ALTITUDE_TEAMS

def build_features_v2(
    df_matches: pd.DataFrame,
    df_squad_values: pd.DataFrame,
    df_eafc: pd.DataFrame,
    venue_col: str = 'venue_city'
) -> pd.DataFrame:
    """
    Merges match data with squad values, EA FC player ratings, and venue altitude.
    Calculates final features for training the ML prediction model.
    """
    df = df_matches.copy()

    # 1. Rename and merge Squad Market Values
    df_squad_home = df_squad_values.rename(columns={
        "squad_total_eur": "squad_total_eur_home",
        "squad_avg_eur": "squad_avg_eur_home",
        "top11_eur": "top11_eur_home",
        "team_name": "team_name_home"
    })
    df_squad_away = df_squad_values.rename(columns={
        "squad_total_eur": "squad_total_eur_away",
        "squad_avg_eur": "squad_avg_eur_away",
        "top11_eur": "top11_eur_away",
        "team_name": "team_name_away"
    })

    df = df.merge(df_squad_home, left_on="home_team", right_on="team_name_home", how="left")
    df = df.merge(df_squad_away, left_on="away_team", right_on="team_name_away", how="left")

    # Handle missing values
    for col in ["squad_total_eur_home", "squad_total_eur_away"]:
        df[col] = df[col].fillna(50_000_000)  # 50M default fallback

    df["squad_value_ratio"] = df["squad_total_eur_home"] / df["squad_total_eur_away"].clip(lower=1)
    df["value_log_home"] = np.log10(df["squad_total_eur_home"].clip(lower=1))
    df["value_log_away"] = np.log10(df["squad_total_eur_away"].clip(lower=1))

    # 2. Rename and merge EA FC Ratings
    df_eafc_home = df_eafc.rename(columns={
        "avg_overall": "avg_overall_home",
        "avg_pace": "avg_pace_home",
        "avg_defending": "avg_defending_home",
        "avg_physic": "avg_physic_home",
        "top5_avg": "eafc_top5_avg_home",
        "team_name": "team_name_home"
    })
    df_eafc_away = df_eafc.rename(columns={
        "avg_overall": "avg_overall_away",
        "avg_pace": "avg_pace_away",
        "avg_defending": "avg_defending_away",
        "avg_physic": "avg_physic_away",
        "top5_avg": "eafc_top5_avg_away",
        "team_name": "team_name_away"
    })

    df = df.merge(df_eafc_home, left_on="home_team", right_on="team_name_home", how="left")
    df = df.merge(df_eafc_away, left_on="away_team", right_on="team_name_away", how="left")

    # Handle missing values for ratings
    for col in ["avg_overall_home", "avg_overall_away", "avg_physic_home", "avg_physic_away", "eafc_top5_avg_home"]:
        df[col] = df[col].fillna(70.0)

    df["eafc_overall_diff"] = df["avg_overall_home"] - df["avg_overall_away"]
    df["eafc_physic_diff"] = df["avg_physic_home"] - df["avg_physic_away"]

    # 3. Altitude and stadium physical factors
    df["venue_altitude_m"] = df[venue_col].map(VENUE_ALTITUDE_2026).fillna(0)
    df["is_high_altitude"] = df["venue_altitude_m"] > HIGH_ALTITUDE_THRESHOLD_M
    
    # Altitude penalty: if high altitude and home team is not adapted to altitude
    df["altitude_penalty"] = np.where(
        df["is_high_altitude"] & ~df["home_team"].isin(HIGH_ALTITUDE_TEAMS),
        -0.1,
        0.0
    )

    # 4. Filter final columns
    original_cols = ["elo_diff", "goal_diff_avg", "home_form", "away_form", "h2h_wins", "is_knockout"]
    new_cols = [
        "squad_value_ratio", "value_log_home", "value_log_away",
        "eafc_overall_diff", "eafc_physic_diff", "eafc_top5_avg_home",
        "venue_altitude_m", "is_high_altitude", "altitude_penalty"
    ]
    
    # Make sure all required columns exist in the DataFrame
    all_cols = original_cols + new_cols
    for col in all_cols:
        if col not in df.columns:
            df[col] = 0.0

    target_col = "target"
    if target_col not in df.columns:
        # If target doesn't exist, calculate it or default it
        if "home_score" in df.columns and "away_score" in df.columns:
            df[target_col] = np.where(df["home_score"] > df["away_score"], 1, 0)
        else:
            df[target_col] = 0

    return df[all_cols + [target_col]]

def main():
    """Execution script to load matches and build final feature matrix."""
    # Ensure processed files are generated
    from src.ingestion_transfermarkt import ingest_transfermarkt_data
    from src.ingestion_eafc import ingest_eafc_ratings
    
    squad_path = "data/processed/squad_values_2026.csv"
    eafc_path = "data/processed/eafc_ratings_2026.csv"
    
    if not os.path.exists(squad_path):
        ingest_transfermarkt_data(squad_path)
    if not os.path.exists(eafc_path):
        ingest_eafc_ratings(output_path=eafc_path)
        
    df_squad = pd.read_csv(squad_path)
    df_eafc = pd.read_csv(eafc_path)
    
    # Load historical matches to construct feature matrix
    matches_path = "Data/clean_fifa_worldcup_matches.csv"
    if not os.path.exists(matches_path):
        # Create a simple placeholder dataframe of matches if not found
        print(f"[WARN] Matches file {matches_path} not found.")
        return
        
    df_matches = pd.read_csv(matches_path)
    
    # Add dummy original columns if they don't exist
    if "home_team" not in df_matches.columns and "HomeTeam" in df_matches.columns:
        df_matches = df_matches.rename(columns={"HomeTeam": "home_team", "AwayTeam": "away_team"})
    
    # Map or default original features
    if "elo_diff" not in df_matches.columns:
        df_matches["elo_diff"] = 0.0
    if "goal_diff_avg" not in df_matches.columns:
        df_matches["goal_diff_avg"] = 0.0
    if "home_form" not in df_matches.columns:
        df_matches["home_form"] = 0.5
    if "away_form" not in df_matches.columns:
        df_matches["away_form"] = 0.5
    if "h2h_wins" not in df_matches.columns:
        df_matches["h2h_wins"] = 0
    if "is_knockout" not in df_matches.columns:
        df_matches["is_knockout"] = 0
    if "venue_city" not in df_matches.columns:
        # Assign random venue from our list
        venues = list(VENUE_ALTITUDE_2026.keys())
        df_matches["venue_city"] = np.random.choice(venues, len(df_matches))
        
    df_features = build_features_v2(df_matches, df_squad, df_eafc)
    
    output_features_path = "data/processed/features_v2.csv"
    os.makedirs(os.path.dirname(output_features_path), exist_ok=True)
    df_features.to_csv(output_features_path, index=False)
    print(f"Features V2 successfully created at {output_features_path}")

if __name__ == "__main__":
    main()
