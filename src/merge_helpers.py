"""
merge_helpers.py
─────────────────
Reusable DataFrame merge utilities for V3/V4/V5 feature pipelines.
Each helper performs a left-join and returns the enriched DataFrame.
"""
from __future__ import annotations

import os
import numpy as np
import pandas as pd


def merge_squad_values(df: pd.DataFrame, df_squad: pd.DataFrame) -> pd.DataFrame:
    """Left-join squad market values for home and away teams."""
    df_h = df_squad.rename(columns={"squad_total_eur": "squad_total_eur_home", "team_name": "_sh"})
    df_a = df_squad.rename(columns={"squad_total_eur": "squad_total_eur_away", "team_name": "_sa"})
    df = df.merge(df_h[["_sh", "squad_total_eur_home"]], left_on="home_team", right_on="_sh", how="left").drop(columns=["_sh"], errors="ignore")
    df = df.merge(df_a[["_sa", "squad_total_eur_away"]], left_on="away_team", right_on="_sa", how="left").drop(columns=["_sa"], errors="ignore")
    for col in ["squad_total_eur_home", "squad_total_eur_away"]:
        df[col] = df[col].fillna(50_000_000)
    df["squad_value_ratio"] = df["squad_total_eur_home"] / df["squad_total_eur_away"].clip(lower=1)
    df["value_log_home"] = np.log10(df["squad_total_eur_home"].clip(lower=1))
    df["value_log_away"] = np.log10(df["squad_total_eur_away"].clip(lower=1))
    return df


def merge_eafc_ratings(df: pd.DataFrame, df_eafc: pd.DataFrame) -> pd.DataFrame:
    """Left-join EA FC player ratings for home and away teams."""
    df_h = df_eafc.rename(columns={
        "avg_overall": "avg_overall_home", "avg_physic": "avg_physic_home",
        "top5_avg": "eafc_top5_avg_home", "team_name": "_eh",
    })
    df_a = df_eafc.rename(columns={
        "avg_overall": "avg_overall_away", "avg_physic": "avg_physic_away",
        "team_name": "_ea",
    })
    df = df.merge(
        df_h[["_eh", "avg_overall_home", "avg_physic_home", "eafc_top5_avg_home"]],
        left_on="home_team", right_on="_eh", how="left"
    ).drop(columns=["_eh"], errors="ignore")
    df = df.merge(
        df_a[["_ea", "avg_overall_away", "avg_physic_away"]],
        left_on="away_team", right_on="_ea", how="left"
    ).drop(columns=["_ea"], errors="ignore")
    for col in ["avg_overall_home", "avg_overall_away", "avg_physic_home", "avg_physic_away", "eafc_top5_avg_home"]:
        df[col] = df[col].fillna(70.0)
    df["eafc_overall_diff"] = df["avg_overall_home"] - df["avg_overall_away"]
    df["eafc_physic_diff"] = df["avg_physic_home"] - df["avg_physic_away"]
    return df


def merge_xg_features(df: pd.DataFrame, df_xg: pd.DataFrame | None, path: str = "data/processed/xg_features_2026.csv") -> pd.DataFrame:
    """Left-join xG features for home and away teams (lazy-loads CSV if needed)."""
    if df_xg is None and os.path.exists(path):
        df_xg = pd.read_csv(path)
    if df_xg is None:
        return df
    cols = ["xg_for_avg", "xg_against_avg", "xg_diff_avg", "xg_overperform_avg", "xg_efficiency_avg", "xg_consistency"]
    df_h = df_xg.rename(columns={c: f"{c}_home" for c in cols} | {"team_name": "_xh"})
    df_a = df_xg.rename(columns={c: f"{c}_away" for c in cols} | {"team_name": "_xa"})
    df = df.merge(df_h[["_xh"] + [f"{c}_home" for c in cols]], left_on="home_team", right_on="_xh", how="left").drop(columns=["_xh"], errors="ignore")
    df = df.merge(df_a[["_xa"] + [f"{c}_away" for c in cols]], left_on="away_team", right_on="_xa", how="left").drop(columns=["_xa"], errors="ignore")
    return df


def merge_odds_features(df: pd.DataFrame, df_odds: pd.DataFrame | None, path: str = "data/processed/odds_features_2026.csv") -> pd.DataFrame:
    """Left-join market odds features for home and away teams (lazy-loads CSV if needed)."""
    if df_odds is None and os.path.exists(path):
        df_odds = pd.read_csv(path)
    if df_odds is None:
        return df
    df_h = df_odds.rename(columns={
        "implied_home_win_avg": "odds_implied_home_win",
        "implied_draw_avg": "odds_implied_draw",
        "market_confidence_avg": "odds_market_confidence",
        "odds_margin_avg": "odds_margin",
        "team_name": "_oh",
    })
    df_a = df_odds.rename(columns={"implied_away_win_avg": "odds_implied_away_win", "team_name": "_oa"})
    df = df.merge(
        df_h[["_oh", "odds_implied_home_win", "odds_implied_draw", "odds_market_confidence", "odds_margin"]],
        left_on="home_team", right_on="_oh", how="left"
    ).drop(columns=["_oh"], errors="ignore")
    df = df.merge(
        df_a[["_oa", "odds_implied_away_win"]],
        left_on="away_team", right_on="_oa", how="left"
    ).drop(columns=["_oa"], errors="ignore")
    return df
