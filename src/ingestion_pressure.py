"""
FEATURE SET 8 — PRESSURE & KEY MATCHES INGESTION
================================================
Sources:
  - Kaggle "International Football Results 1872–2026"

Outputs (data/processed/pressure_features.csv):
  team_name | penalty_win_rate | big_match_win_rate | knockout_win_rate
"""

import os
import numpy as np
import pandas as pd

from src.pressure_constants import (
    TEAMS,
    KNOWN_PENALTY_RATES,
    KNOWN_BIG_MATCH_RATES,
    KNOWN_KNOCKOUT_RATES,
)
from src.pressure_helpers import compute_pressure_features


def generate_mock_pressure_data() -> pd.DataFrame:
    """
    Generates realistic pressure features using research-backed base rates.
    """
    np.random.seed(7)
    records = []
    for team in TEAMS:
        pen = KNOWN_PENALTY_RATES.get(team, 0.48) + np.random.normal(0, 0.03)
        big = KNOWN_BIG_MATCH_RATES.get(team, 0.35) + np.random.normal(0, 0.02)
        ko = KNOWN_KNOCKOUT_RATES.get(team, 0.42) + np.random.normal(0, 0.02)

        records.append({
            "team_name":          team,
            "penalty_win_rate":   float(np.clip(round(pen, 4), 0.0, 1.0)),
            "big_match_win_rate": float(np.clip(round(big, 4), 0.0, 1.0)),
            "knockout_win_rate":  float(np.clip(round(ko, 4), 0.0, 1.0)),
        })
    return pd.DataFrame(records)


def ingest_pressure_features(
    historical_path: str = "Data/clean_fifa_worldcup_matches.csv",
    output_path: str = "data/processed/pressure_features.csv",
) -> None:
    """
    Ingests Feature Set 8 and saves CSV.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    if os.path.exists(historical_path):
        try:
            df_hist = pd.read_csv(historical_path, low_memory=False)

            # Normalise column names
            col_map = {}
            for c in df_hist.columns:
                lc = c.lower().replace(" ", "_")
                if lc in ("home_team", "hometeam"):
                    col_map[c] = "home_team"
                elif lc in ("away_team", "awayteam"):
                    col_map[c] = "away_team"
                elif lc in ("home_score",):
                    col_map[c] = "home_score"
                elif lc in ("away_score",):
                    col_map[c] = "away_score"
                elif lc == "result_type":
                    col_map[c] = "result_type"
                elif lc == "tournament":
                    col_map[c] = "tournament"
                elif lc == "date":
                    col_map[c] = "date"
            df_hist = df_hist.rename(columns=col_map)

            required = {"home_team", "away_team", "home_score", "away_score", "date"}
            if required.issubset(df_hist.columns):
                df_pressure = compute_pressure_features(df_hist)
                print("[INFO] Pressure features computed from historical dataset.")
            else:
                missing = required - set(df_hist.columns)
                print(f"[WARN] Missing columns {missing}. Using mock data.")
                df_pressure = generate_mock_pressure_data()
        except Exception as exc:
            print(f"[WARN] Could not parse historical file: {exc}. Using mock data.")
            df_pressure = generate_mock_pressure_data()
    else:
        print(f"[INFO] Historical file not found at '{historical_path}'. Using mock data.")
        df_pressure = generate_mock_pressure_data()

    df_pressure.to_csv(output_path, index=False)
    print(f"[INFO] Pressure features saved → {output_path}")


if __name__ == "__main__":
    ingest_pressure_features()
