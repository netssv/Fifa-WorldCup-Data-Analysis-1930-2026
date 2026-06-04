import os
import numpy as np
import pandas as pd
from src.constants import VENUE_ALTITUDE_2026, HIGH_ALTITUDE_THRESHOLD_M, HIGH_ALTITUDE_TEAMS
from src.constants_v3 import TEAM_PEDIGREE, SQUAD_EXPERIENCE, CLIMATE_TRAVEL, LEAGUE_SYNERGY, OFF_DEF_METRICS
from src.ingestion_coaches import build_coach_features

def get_team_stats_v3(team_name: str) -> dict:
    """Helper to extract advanced stats for a single team with default fallbacks."""
    pedigree = TEAM_PEDIGREE.get(team_name, (0, 0, 1))
    experience = SQUAD_EXPERIENCE.get(team_name, (26.5, 25.0))
    climate = CLIMATE_TRAVEL.get(team_name, (8000.0, 0.65))
    synergy = LEAGUE_SYNERGY.get(team_name, (0.10, 0.40))
    off_def = OFF_DEF_METRICS.get(team_name, (1.4, 0.40))

    return {
        "titles": pedigree[0],
        "semis": pedigree[1],
        "appearances": pedigree[2],
        "avg_age": experience[0],
        "avg_caps": experience[1],
        "travel_dist": climate[0],
        "climate_compat": climate[1],
        "synergy": synergy[0],
        "top5_ratio": synergy[1],
        "goals_scored": off_def[0],
        "clean_sheets": off_def[1]
    }

def build_features_v3(
    df_matches: pd.DataFrame,
    df_squad_values: pd.DataFrame,
    df_eafc: pd.DataFrame,
    df_xg: pd.DataFrame = None,
    df_odds: pd.DataFrame = None,
    coaches_json_path: str = "data/coaches_wc2026.json",
    venue_col: str = 'venue_city'
) -> pd.DataFrame:
    """
    Builds the complete V3 feature matrix (48 features) containing:
      - ELO, Squad Values, EA FC ratings, Venue Altitude          (15 cols)
      - Pedigree, Experience, Climate, Synergy, Off/Def           (11 cols)
      - Expected Goals xG (home + away)                           (12 cols)
      - Market Odds — Feature Set 5                                (5 cols)
      - Coach Experience — Feature Set 6                           (5 cols)
    """
    df = df_matches.copy()

    # 1. Rename and merge Squad Market Values
    df_squad_home = df_squad_values.rename(columns={"squad_total_eur": "squad_total_eur_home", "team_name": "team_name_home"})
    df_squad_away = df_squad_values.rename(columns={"squad_total_eur": "squad_total_eur_away", "team_name": "team_name_away"})
    df = df.merge(df_squad_home[["team_name_home", "squad_total_eur_home"]], left_on="home_team", right_on="team_name_home", how="left")
    df = df.merge(df_squad_away[["team_name_away", "squad_total_eur_away"]], left_on="away_team", right_on="team_name_away", how="left")

    for col in ["squad_total_eur_home", "squad_total_eur_away"]:
        df[col] = df[col].fillna(50_000_000)

    df["squad_value_ratio"] = df["squad_total_eur_home"] / df["squad_total_eur_away"].clip(lower=1)
    df["value_log_home"] = np.log10(df["squad_total_eur_home"].clip(lower=1))
    df["value_log_away"] = np.log10(df["squad_total_eur_away"].clip(lower=1))

    # 2. Rename and merge EA FC Ratings
    df_eafc_home = df_eafc.rename(columns={"avg_overall": "avg_overall_home", "avg_physic": "avg_physic_home", "top5_avg": "eafc_top5_avg_home", "team_name": "team_name_home"})
    df_eafc_away = df_eafc.rename(columns={"avg_overall": "avg_overall_away", "avg_physic": "avg_physic_away", "team_name": "team_name_away"})
    df = df.merge(df_eafc_home[["team_name_home", "avg_overall_home", "avg_physic_home", "eafc_top5_avg_home"]], left_on="home_team", right_on="team_name_home", how="left")
    df = df.merge(df_eafc_away[["team_name_away", "avg_overall_away", "avg_physic_away"]], left_on="away_team", right_on="team_name_away", how="left")

    for col in ["avg_overall_home", "avg_overall_away", "avg_physic_home", "avg_physic_away", "eafc_top5_avg_home"]:
        df[col] = df[col].fillna(70.0)

    df["eafc_overall_diff"] = df["avg_overall_home"] - df["avg_overall_away"]
    df["eafc_physic_diff"] = df["avg_physic_home"] - df["avg_physic_away"]

    # 3. Altitude and stadium physical factors
    df["venue_altitude_m"] = df[venue_col].map(VENUE_ALTITUDE_2026).fillna(0)
    df["is_high_altitude"] = (df["venue_altitude_m"] > HIGH_ALTITUDE_THRESHOLD_M).astype(float)
    df["altitude_penalty"] = np.where((df["is_high_altitude"] > 0.5) & ~df["home_team"].isin(HIGH_ALTITUDE_TEAMS), -0.1, 0.0)

    # 3.5 Merge with xG features
    if df_xg is None:
        xg_path = "data/processed/xg_features_2026.csv"
        if os.path.exists(xg_path):
            df_xg = pd.read_csv(xg_path)
            
    if df_xg is not None:
        df_xg_home = df_xg.rename(columns={
            "xg_for_avg": "xg_for_avg_home",
            "xg_against_avg": "xg_against_avg_home",
            "xg_diff_avg": "xg_diff_avg_home",
            "xg_overperform_avg": "xg_overperform_avg_home",
            "xg_efficiency_avg": "xg_efficiency_avg_home",
            "xg_consistency": "xg_consistency_home",
            "team_name": "team_name_home"
        })
        df_xg_away = df_xg.rename(columns={
            "xg_for_avg": "xg_for_avg_away",
            "xg_against_avg": "xg_against_avg_away",
            "xg_diff_avg": "xg_diff_avg_away",
            "xg_overperform_avg": "xg_overperform_avg_away",
            "xg_efficiency_avg": "xg_efficiency_avg_away",
            "xg_consistency": "xg_consistency_away",
            "team_name": "team_name_away"
        })
        df = df.merge(df_xg_home, left_on="home_team", right_on="team_name_home", how="left")
        df = df.merge(df_xg_away, left_on="away_team", right_on="team_name_away", how="left")

    # 4. Ingest and merge the 5 advanced V3 categories
    home_advanced = pd.DataFrame([get_team_stats_v3(t) for t in df["home_team"]])
    away_advanced = pd.DataFrame([get_team_stats_v3(t) for t in df["away_team"]])

    df["titles_diff"] = home_advanced["titles"] - away_advanced["titles"]
    df["semis_diff"] = home_advanced["semis"] - away_advanced["semis"]
    df["appearances_diff"] = home_advanced["appearances"] - away_advanced["appearances"]
    df["avg_age_diff"] = home_advanced["avg_age"] - away_advanced["avg_age"]
    df["avg_caps_diff"] = home_advanced["avg_caps"] - away_advanced["avg_caps"]
    df["travel_dist_diff"] = home_advanced["travel_dist"] - away_advanced["travel_dist"]
    df["climate_compat_diff"] = home_advanced["climate_compat"] - away_advanced["climate_compat"]
    df["synergy_diff"] = home_advanced["synergy"] - away_advanced["synergy"]
    df["top5_ratio_diff"] = home_advanced["top5_ratio"] - away_advanced["top5_ratio"]
    df["goals_scored_diff"] = home_advanced["goals_scored"] - away_advanced["goals_scored"]
    df["clean_sheets_diff"] = home_advanced["clean_sheets"] - away_advanced["clean_sheets"]

    # 5. Market Odds features (Feature Set 5)
    if df_odds is None:
        odds_path = "data/processed/odds_features_2026.csv"
        if os.path.exists(odds_path):
            df_odds = pd.read_csv(odds_path)

    if df_odds is not None:
        df_odds_home = df_odds.rename(columns={
            "implied_home_win_avg": "odds_implied_home_win",
            "implied_draw_avg": "odds_implied_draw",
            "market_confidence_avg": "odds_market_confidence",
            "odds_margin_avg": "odds_margin",
            "team_name": "odds_home_ref",
        })
        df_odds_away = df_odds.rename(columns={
            "implied_away_win_avg": "odds_implied_away_win",
            "team_name": "odds_away_ref",
        })
        df = df.merge(
            df_odds_home[["odds_home_ref", "odds_implied_home_win", "odds_implied_draw",
                           "odds_market_confidence", "odds_margin"]],
            left_on="home_team", right_on="odds_home_ref", how="left"
        ).drop(columns=["odds_home_ref"], errors="ignore")
        df = df.merge(
            df_odds_away[["odds_away_ref", "odds_implied_away_win"]],
            left_on="away_team", right_on="odds_away_ref", how="left"
        ).drop(columns=["odds_away_ref"], errors="ignore")

    # 6. Coach Experience features (Feature Set 6)
    if os.path.exists(coaches_json_path):
        df_coach_features = build_coach_features(
            df_matches, json_path=coaches_json_path
        )
        for col in df_coach_features.columns:
            df[col] = df_coach_features[col].values

    # Final feature column list — 48 total
    feature_cols = [
        # ELO + form baseline (6)
        "elo_diff", "goal_diff_avg", "home_form", "away_form", "h2h_wins", "is_knockout",
        # Squad values (3)
        "squad_value_ratio", "value_log_home", "value_log_away",
        # EA FC ratings (3)
        "eafc_overall_diff", "eafc_physic_diff", "eafc_top5_avg_home",
        # Altitude/venue (3)
        "venue_altitude_m", "is_high_altitude", "altitude_penalty",
        # World Cup pedigree (3)
        "titles_diff", "semis_diff", "appearances_diff",
        # Squad experience (2)
        "avg_age_diff", "avg_caps_diff",
        # Climate & travel (2)
        "travel_dist_diff", "climate_compat_diff",
        # League synergy (2)
        "synergy_diff", "top5_ratio_diff",
        # Offensive / defensive metrics (2)
        "goals_scored_diff", "clean_sheets_diff",
        # xG — home & away (12)
        "xg_for_avg_home", "xg_for_avg_away",
        "xg_against_avg_home", "xg_against_avg_away",
        "xg_diff_avg_home", "xg_diff_avg_away",
        "xg_overperform_avg_home", "xg_overperform_avg_away",
        "xg_efficiency_avg_home", "xg_efficiency_avg_away",
        "xg_consistency_home", "xg_consistency_away",
        # Market odds (5)
        "odds_implied_home_win", "odds_implied_away_win", "odds_implied_draw",
        "odds_market_confidence", "odds_margin",
        # Coach experience (5)
        "coach_wc_editions", "coach_intl_win_rate", "coach_tournament_wins",
        "coach_experience_diff", "coach_knockout_edge",
    ]

    # Final feature column list — 48 total
    assert len(feature_cols) == 48, f"Expected 48 features, got {len(feature_cols)}"

    for col in feature_cols:
        df[col] = df[col].fillna(0.0)

    target_col = "target"
    if target_col not in df.columns:
        if "home_score" in df.columns and "away_score" in df.columns:
            df[target_col] = np.where(df["home_score"] > df["away_score"], 1, 0)
        elif "HomeGoals" in df.columns and "AwayGoals" in df.columns:
            df[target_col] = np.where(df["HomeGoals"] > df["AwayGoals"], 1, 0)
        else:
            df[target_col] = 0

    return df[feature_cols + [target_col]]

def main():
    squad_path = "data/processed/squad_values_2026.csv"
    eafc_path = "data/processed/eafc_ratings_2026.csv"
    xg_path = "data/processed/xg_features_2026.csv"
    matches_path = "Data/clean_fifa_worldcup_matches.csv"
    
    if not (os.path.exists(squad_path) and os.path.exists(eafc_path) and os.path.exists(matches_path)):
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

    df_features = build_features_v3(
        df_matches, df_squad, df_eafc, df_xg, df_odds,
        coaches_json_path=coaches_path
    )
    
    output_features_path = "data/processed/features_v3.csv"
    os.makedirs(os.path.dirname(output_features_path), exist_ok=True)
    df_features.to_csv(output_features_path, index=False)
    print(f"Features V3 successfully created at {output_features_path}")

if __name__ == "__main__":
    main()
