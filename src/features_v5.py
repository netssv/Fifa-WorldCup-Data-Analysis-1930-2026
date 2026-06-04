import os
import numpy as np
import pandas as pd
from src.features_v4 import build_features_v4

# Pressure feature columns added in this version
PRESSURE_COLS_HOME = [
    "pressure_penalty_win_rate_home",
    "pressure_big_match_win_rate_home",
    "pressure_knockout_win_rate_home",
]
PRESSURE_COLS_AWAY = [
    "pressure_penalty_win_rate_away",
    "pressure_big_match_win_rate_away",
    "pressure_knockout_win_rate_away",
]
PRESSURE_DIFF_COLS = [
    "pressure_penalty_win_rate_diff",
    "pressure_big_match_win_rate_diff",
    "pressure_knockout_win_rate_diff",
]

# Default fallback values (league-average priors)
PRESSURE_DEFAULTS = {
    "penalty_win_rate":    0.48,
    "big_match_win_rate":  0.37,
    "knockout_win_rate":   0.42,
}


def build_features_v5(
    df_matches: pd.DataFrame,
    df_squad_values: pd.DataFrame,
    df_eafc: pd.DataFrame,
    df_xg: pd.DataFrame = None,
    df_odds: pd.DataFrame = None,
    coaches_json_path: str = "data/coaches_wc2026.json",
    fatigue_path: str = "data/processed/fatigue_features.csv",
    pressure_path: str = "data/processed/pressure_features.csv",
    venue_col: str = "venue_city",
) -> pd.DataFrame:
    """
    Builds the V5 feature matrix containing:
      - 54 baseline features from V4 (V3 + fatigue)
      - 9 Pressure / Key-Match features (Feature Set 8):
          · penalty_win_rate_home / _away / _diff
          · big_match_win_rate_home / _away / _diff
          · knockout_win_rate_home / _away / _diff
    Total: 63 features + 1 target
    """

    # ── 1. Build V4 base ─────────────────────────────────────────────────
    df_v4 = build_features_v4(
        df_matches, df_squad_values, df_eafc, df_xg, df_odds,
        coaches_json_path=coaches_json_path,
        fatigue_path=fatigue_path,
        venue_col=venue_col,
    )

    # ── 2. Load pressure features ────────────────────────────────────────
    if os.path.exists(pressure_path):
        df_pressure = pd.read_csv(pressure_path)
    else:
        # Build fallback DataFrame with default values for all teams
        df_pressure = pd.DataFrame([
            {
                "team_name":          team,
                "penalty_win_rate":   PRESSURE_DEFAULTS["penalty_win_rate"],
                "big_match_win_rate": PRESSURE_DEFAULTS["big_match_win_rate"],
                "knockout_win_rate":  PRESSURE_DEFAULTS["knockout_win_rate"],
            }
            for team in (
                df_matches["home_team"].dropna().unique().tolist()
                + df_matches["away_team"].dropna().unique().tolist()
            )
        ]).drop_duplicates("team_name")

    df_pressure = df_pressure.set_index("team_name")

    # ── 3. Merge onto match rows ─────────────────────────────────────────
    df = df_matches.copy()

    # Normalise team column names
    if "home_team" not in df.columns and "HomeTeam" in df.columns:
        df = df.rename(columns={"HomeTeam": "home_team", "AwayTeam": "away_team"})

    def _get(team: str, feat: str) -> float:
        try:
            return float(df_pressure.at[team, feat])
        except (KeyError, ValueError):
            return PRESSURE_DEFAULTS.get(feat, 0.0)

    # Vectorised lookup for home/away
    for feat in ["penalty_win_rate", "big_match_win_rate", "knockout_win_rate"]:
        df[f"pressure_{feat}_home"] = df["home_team"].map(
            lambda t, f=feat: _get(t, f)   # noqa: B023
        )
        df[f"pressure_{feat}_away"] = df["away_team"].map(
            lambda t, f=feat: _get(t, f)   # noqa: B023
        )
        df[f"pressure_{feat}_diff"] = (
            df[f"pressure_{feat}_home"] - df[f"pressure_{feat}_away"]
        )

    # ── 4. Collect new columns ───────────────────────────────────────────
    new_cols = PRESSURE_COLS_HOME + PRESSURE_COLS_AWAY + PRESSURE_DIFF_COLS

    # ── 5. Concatenate V4 + pressure ────────────────────────────────────
    assert len(df_v4) == len(df), "Row count mismatch between V4 features and matches."

    v4_feature_cols = [c for c in df_v4.columns if c != "target"]
    assert len(v4_feature_cols) == 54, (
        f"Expected 54 V4 feature cols, got {len(v4_feature_cols)}"
    )

    X_v4 = df_v4[v4_feature_cols].reset_index(drop=True)
    X_pressure = df[new_cols].reset_index(drop=True)
    y = df_v4["target"].reset_index(drop=True)

    df_v5 = pd.concat([X_v4, X_pressure, y], axis=1)

    expected_total = 63 + 1   # 63 features + 1 target
    assert len(df_v5.columns) == expected_total, (
        f"Expected {expected_total} columns, got {len(df_v5.columns)}"
    )

    return df_v5


def main():
    squad_path    = "data/processed/squad_values_2026.csv"
    eafc_path     = "data/processed/eafc_ratings_2026.csv"
    xg_path       = "data/processed/xg_features_2026.csv"
    matches_path  = "Data/clean_fifa_worldcup_matches.csv"
    odds_path     = "data/processed/odds_features_2026.csv"
    coaches_path  = "data/coaches_wc2026.json"
    fatigue_path  = "data/processed/fatigue_features.csv"
    pressure_path = "data/processed/pressure_features.csv"

    if not (
        os.path.exists(squad_path)
        and os.path.exists(eafc_path)
        and os.path.exists(matches_path)
    ):
        print("[WARN] Missing base datasets. Run setup first.")
        return

    df_matches = pd.read_csv(matches_path)
    df_squad   = pd.read_csv(squad_path)
    df_eafc    = pd.read_csv(eafc_path)
    df_xg      = pd.read_csv(xg_path)   if os.path.exists(xg_path)   else None
    df_odds    = pd.read_csv(odds_path) if os.path.exists(odds_path) else None

    if "home_team" not in df_matches.columns and "HomeTeam" in df_matches.columns:
        df_matches = df_matches.rename(
            columns={"HomeTeam": "home_team", "AwayTeam": "away_team"}
        )

    # Ensure required base columns exist
    for col, default in [
        ("elo_diff", 0.0), ("goal_diff_avg", 0.0),
        ("home_form", 0.5), ("away_form", 0.5),
        ("h2h_wins", 0),   ("is_knockout", 0),
    ]:
        if col not in df_matches.columns:
            df_matches[col] = default

    if "venue_city" not in df_matches.columns:
        df_matches["venue_city"] = "neutral"

    df_features_v5 = build_features_v5(
        df_matches, df_squad, df_eafc, df_xg, df_odds,
        coaches_json_path=coaches_path,
        fatigue_path=fatigue_path,
        pressure_path=pressure_path,
    )

    output_path = "data/processed/features_v5.csv"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df_features_v5.to_csv(output_path, index=False)
    print(f"[INFO] Features V5 saved → {output_path}")
    print(f"[INFO] Shape: {df_features_v5.shape}")
    print(f"[INFO] New columns: {PRESSURE_COLS_HOME + PRESSURE_COLS_AWAY + PRESSURE_DIFF_COLS}")


if __name__ == "__main__":
    main()
