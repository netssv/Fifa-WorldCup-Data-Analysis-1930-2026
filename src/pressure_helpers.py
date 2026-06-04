import pandas as pd
from src.pressure_constants import TEAMS, TOP_20_FIFA_TEAMS


def get_top20_fifa_teams() -> list[str]:
    return TOP_20_FIFA_TEAMS


def compute_pressure_features(df_historical: pd.DataFrame) -> pd.DataFrame:
    """
    Computes Feature Set 8 from a historical results DataFrame.
    """
    df = df_historical.copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    # Normalise result_type column (handle both 'shootout' and 'penalty')
    if "result_type" in df.columns:
        df["result_type"] = df["result_type"].str.lower().str.strip()
    elif "stage" in df.columns:
        df["result_type"] = df["stage"].str.lower().str.strip()
    else:
        df["result_type"] = "normal"

    # ── 1. Penalty shootout win rate ──────────────────────────────────────
    shootouts = df[df["result_type"].isin(["shootout", "penalty"])].copy()

    penalty_wins: dict[str, int] = {t: 0 for t in TEAMS}
    penalty_total: dict[str, int] = {t: 0 for t in TEAMS}

    for _, row in shootouts.iterrows():
        home, away = row["home_team"], row["away_team"]
        winner = home if row["home_score"] > row["away_score"] else away

        for team in [home, away]:
            if team in penalty_total:
                penalty_total[team] += 1
                if team == winner:
                    penalty_wins[team] += 1

    penalty_win_rate = {
        t: round(penalty_wins[t] / penalty_total[t], 4)
        if penalty_total[t] > 0 else 0.50   # neutral prior if no data
        for t in TEAMS
    }

    # ── 2. Big-match win rate (vs top-20, since 2022-01-01) ──────────────
    top20 = set(get_top20_fifa_teams())
    cutoff = pd.Timestamp("2022-01-01")
    recent = df[df["date"] >= cutoff].copy()

    big_wins: dict[str, int] = {t: 0 for t in TEAMS}
    big_total: dict[str, int] = {t: 0 for t in TEAMS}

    for _, row in recent.iterrows():
        home, away = row["home_team"], row["away_team"]
        is_draw = row["home_score"] == row["away_score"]
        home_won = row["home_score"] > row["away_score"]

        # home team played a big match if opponent is top-20
        if home in TEAMS and away in top20:
            big_total[home] += 1
            if home_won:
                big_wins[home] += 1

        # away team played a big match if opponent is top-20
        if away in TEAMS and home in top20:
            big_total[away] += 1
            if not home_won and not is_draw:
                big_wins[away] += 1

    big_match_win_rate = {
        t: round(big_wins[t] / big_total[t], 4)
        if big_total[t] > 0 else 0.35   # realistic prior for non-top20 teams
        for t in TEAMS
    }

    # ── 3. Knockout win rate (all-time) ───────────────────────────────────
    knockout_keywords = [
        "round of 16", "quarter-final", "semi-final", "final",
        "knockout", "elimination", "r32", "r16", "r8", "semi", "third place",
    ]

    def is_knockout(row) -> bool:
        t = str(row.get("tournament", "")).lower()
        rt = str(row.get("result_type", "")).lower()
        return any(kw in t or kw in rt for kw in knockout_keywords)

    df["is_knockout_match"] = df.apply(is_knockout, axis=1)
    ko_matches = df[df["is_knockout_match"]].copy()

    ko_wins: dict[str, int] = {t: 0 for t in TEAMS}
    ko_total: dict[str, int] = {t: 0 for t in TEAMS}

    for _, row in ko_matches.iterrows():
        home, away = row["home_team"], row["away_team"]
        is_draw = row["home_score"] == row["away_score"]
        home_won = row["home_score"] > row["away_score"]

        if home in TEAMS:
            ko_total[home] += 1
            if home_won:
                ko_wins[home] += 1

        if away in TEAMS:
            ko_total[away] += 1
            if not home_won and not is_draw:
                ko_wins[away] += 1

    knockout_win_rate = {
        t: round(ko_wins[t] / ko_total[t], 4)
        if ko_total[t] > 0 else 0.40
        for t in TEAMS
    }

    # ── Assemble ──────────────────────────────────────────────────────────
    records = [
        {
            "team_name": t,
            "penalty_win_rate": penalty_win_rate[t],
            "big_match_win_rate": big_match_win_rate[t],
            "knockout_win_rate": knockout_win_rate[t],
        }
        for t in TEAMS
    ]
    return pd.DataFrame(records)
