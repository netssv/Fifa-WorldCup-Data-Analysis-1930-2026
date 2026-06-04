import os
import numpy as np
import pandas as pd

def compute_xg_features(df_xg: pd.DataFrame) -> pd.DataFrame:
    """
    Computes aggregated xG statistics per team from match-by-match xG data.
    Expected columns in df_xg: team_name, xg_for, xg_against, goals_scored, goals_conceded
    """
    df_xg = df_xg.copy()
    
    # Match-level calculations
    df_xg["xg_diff"] = df_xg["xg_for"] - df_xg["xg_against"]
    df_xg["xg_overperform"] = df_xg["goals_scored"] - df_xg["xg_for"]
    df_xg["xg_efficiency"] = df_xg["goals_scored"] / df_xg["xg_for"].clip(lower=0.1)
    
    # Aggregate stats per team
    agg_df = df_xg.groupby("team_name").agg(
        xg_for_avg=("xg_for", "mean"),
        xg_against_avg=("xg_against", "mean"),
        xg_diff_avg=("xg_diff", "mean"),
        xg_overperform_avg=("xg_overperform", "mean"),
        xg_efficiency_avg=("xg_efficiency", "mean"),
        xg_consistency=("xg_for", "std")
    ).reset_index()
    
    # Consistency defaults to 0.0 if a team only has 1 match (avoiding NaN std)
    agg_df["xg_consistency"] = agg_df["xg_consistency"].fillna(0.0)
    
    return agg_df

def generate_mock_match_xg(team: str, eafc_rating: float, off_score: float, match_count: int = 10) -> list[dict]:
    """Generates realistic match-by-match xG data based on team rating and profile."""
    np.random.seed(42 + hash(team) % 1000)
    matches = []
    
    # Base expectations: higher rated teams create more and concede less xG
    base_xg_for = 1.0 + (eafc_rating - 68.0) * 0.08 + (off_score - 1.4) * 0.5
    base_xg_against = 2.0 - (eafc_rating - 68.0) * 0.07
    
    base_xg_for = max(0.4, base_xg_for)
    base_xg_against = max(0.4, base_xg_against)
    
    for _ in range(match_count):
        # Add random noise to simulate match variability
        xg_for = max(0.1, base_xg_for + np.random.normal(0, 0.4))
        xg_against = max(0.1, base_xg_against + np.random.normal(0, 0.4))
        
        # Goals scored follow Poisson around xG or have minor overperformance
        goals_scored = np.random.poisson(xg_for * 1.05)
        goals_conceded = np.random.poisson(xg_against * 0.95)
        
        matches.append({
            "team_name": team,
            "xg_for": round(xg_for, 2),
            "xg_against": round(xg_against, 2),
            "goals_scored": int(goals_scored),
            "goals_conceded": int(goals_conceded)
        })
    return matches

def ingest_xg_data(
    eafc_ratings_path: str = "data/processed/eafc_ratings_2026.csv",
    output_path: str = "data/processed/xg_features_2026.csv"
):
    """Ingests match-by-match xG data and computes features."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    from api.constants import FIFA_ELO_2026
    from src.constants_v3 import OFF_DEF_METRICS
    
    # Load EAFC ratings from CSV if it exists
    eafc_ratings = {}
    if os.path.exists(eafc_ratings_path):
        df_eafc = pd.read_csv(eafc_ratings_path)
        eafc_ratings = dict(zip(df_eafc["team_name"], df_eafc["avg_overall"]))
        
    all_matches = []
    for team in FIFA_ELO_2026.keys():
        overall = eafc_ratings.get(team, 75.0)
        off_score = OFF_DEF_METRICS.get(team, (1.4, 0.4))[0]
        team_matches = generate_mock_match_xg(team, overall, off_score)
        all_matches.extend(team_matches)
        
    df_raw = pd.DataFrame(all_matches)
    
    # Compute aggregate features using requested function
    df_features = compute_xg_features(df_raw)
    df_features.to_csv(output_path, index=False)
    print(f"Processed xG features saved to {output_path}")

if __name__ == "__main__":
    ingest_xg_data()
