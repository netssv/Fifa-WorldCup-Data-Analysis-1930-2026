import pandas as pd

def validate_matches_data(df_matches: pd.DataFrame) -> None:
    """Validate matches dataset for integrity before training."""
    print("\n[Data Validation]")

    self_matches = df_matches[df_matches["HomeTeam"] == df_matches["AwayTeam"]]
    assert len(self_matches) == 0, f"Found {len(self_matches)} self-matches (invalid)"
    print("✓ No self-matches")

    duplicates = df_matches[df_matches.duplicated(subset=["HomeTeam", "AwayTeam", "Year"], keep=False)]
    if len(duplicates) > 0:
        print(f"[WARN] Found {len(duplicates)} duplicate/repeated matches in the same year (e.g., replays or group+knockout stages)")
    else:
        print("✓ No duplicate matches in the same year")

    negative_goals = df_matches[(df_matches["HomeGoals"] < 0) | (df_matches["AwayGoals"] < 0)]
    assert len(negative_goals) == 0, f"Found {len(negative_goals)} matches with negative goals"
    print("✓ No negative goal values")

    years = df_matches["Year"].dropna().astype(int)
    print(f"✓ Year range: {years.min()}–{years.max()} ({years.nunique()} unique seasons)")
    print(f"  Home goals: μ={df_matches['HomeGoals'].mean():.2f}, σ={df_matches['HomeGoals'].std():.2f}")
    print(f"  Away goals: μ={df_matches['AwayGoals'].mean():.2f}, σ={df_matches['AwayGoals'].std():.2f}")
