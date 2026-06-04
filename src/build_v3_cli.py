import os
import pandas as pd
from src.features_v3 import build_features_v3


def main():
    squad_path = "data/processed/squad_values_2026.csv"
    eafc_path = "data/processed/eafc_ratings_2026.csv"
    xg_path = "data/processed/xg_features_2026.csv"
    matches_path = "Data/clean_fifa_worldcup_matches.csv"

    if not (
        os.path.exists(squad_path)
        and os.path.exists(eafc_path)
        and os.path.exists(matches_path)
    ):
        print("[WARN] Missing base datasets. Run features_v2 setup first.")
        return

    df_matches = pd.read_csv(matches_path)
    df_squad = pd.read_csv(squad_path)
    df_eafc = pd.read_csv(eafc_path)
    df_xg = pd.read_csv(xg_path) if os.path.exists(xg_path) else None

    odds_path = "data/processed/odds_features_2026.csv"
    df_odds = pd.read_csv(odds_path) if os.path.exists(odds_path) else None
    coaches_path = "data/coaches_wc2026.json"

    # Rename original columns if needed
    if "home_team" not in df_matches.columns and "HomeTeam" in df_matches.columns:
        df_matches = df_matches.rename(
            columns={"HomeTeam": "home_team", "AwayTeam": "away_team"}
        )

    # Set up basic columns
    df_matches["elo_diff"] = 0.0
    df_matches["goal_diff_avg"] = 0.0
    df_matches["home_form"] = 0.5
    df_matches["away_form"] = 0.5
    df_matches["h2h_wins"] = 0
    df_matches["is_knockout"] = 0
    if "venue_city" not in df_matches.columns:
        df_matches["venue_city"] = "neutral"

    df_features = build_features_v3(
        df_matches,
        df_squad,
        df_eafc,
        df_xg,
        df_odds,
        coaches_json_path=coaches_path,
    )

    output_features_path = "data/processed/features_v3.csv"
    os.makedirs(os.path.dirname(output_features_path), exist_ok=True)
    df_features.to_csv(output_features_path, index=False)
    print(f"Features V3 successfully created at {output_features_path}")


if __name__ == "__main__":
    main()
