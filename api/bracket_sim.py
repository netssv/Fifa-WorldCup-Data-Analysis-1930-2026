from __future__ import annotations

import time
import os
from typing import Any, Literal

from .constants import GROUPS_2026, FIFA_ELO_2026
from .predictions import (
    predict_with_model,
    goals_to_probs,
    simulate_match,
    _get_elo,
    _get_form,
)

_bracket_cache: dict[str, Any] = {}
_bracket_cache_ts: float = 0.0
_CACHE_TTL = 3600  # 1 hour

ROUND_ORDER = ["groups", "r32", "r16", "r8", "semi", "final"]

SimScope = Literal["all", "groups", "r32", "r16", "r8", "semi", "final"]


async def simulate_full_bracket(
    chaos_factor: float = 0.0,
    boost_team: str | None = None,
    boost_amount: float = 0.0,
    sim_runs: int = 1,
    scope: SimScope = "all",
    use_goldman: bool = True,
    use_klement: bool = True,
    seed: int | None = None,
) -> dict:
    global _bracket_cache, _bracket_cache_ts

    is_partial_scope = scope != "all"
    is_custom = chaos_factor > 0.0 or (boost_team is not None and boost_amount > 0.0) or sim_runs > 1

    is_railway = "RAILWAY_STATIC_URL" in os.environ or "RAILWAY_ENVIRONMENT" in os.environ
    max_runs = 100 if is_railway else 1000000
    effective_runs = max(1, min(max_runs, sim_runs))

    now = time.monotonic()
    if not is_custom and not is_partial_scope and _bracket_cache and (now - _bracket_cache_ts) < _CACHE_TTL:
        return _bracket_cache

    from .sim_runner import TournamentSimulator
    sim = TournamentSimulator(
        effective_runs=effective_runs,
        chaos_factor=chaos_factor,
        boost_team=boost_team,
        boost_amount=boost_amount,
        use_goldman=use_goldman,
        use_klement=use_klement,
        seed=seed,
    )

    all_results = []
    for _ in range(effective_runs):
        res = sim.run_single_simulation(stop_at=scope)
        all_results.append(res)

    probs = {}
    if scope == "groups":
        qualify_counts = {}
        for res in all_results:
            for group_name, qualifiers in res["groups"].items():
                for team in qualifiers:
                    qualify_counts[team] = qualify_counts.get(team, 0) + 1
        probs = {t: round(count / effective_runs, 4) for t, count in qualify_counts.items()}
    elif scope == "all":
        championship_wins = {}
        for res in all_results:
            winner = res["final"]
            championship_wins[winner] = championship_wins.get(winner, 0) + 1
        probs = {t: round(count / effective_runs, 4) for t, count in championship_wins.items()}
    else:
        round_counts = {}
        for res in all_results:
            teams_in_round = res[scope]
            if isinstance(teams_in_round, list):
                for team in teams_in_round:
                    if team:
                        round_counts[team] = round_counts.get(team, 0) + 1
            else:
                if teams_in_round:
                    round_counts[teams_in_round] = round_counts.get(teams_in_round, 0) + 1
        probs = {t: round(count / effective_runs, 4) for t, count in round_counts.items()}

    if scope == "all":
        top_winner = max(probs.items(), key=lambda x: x[1])[0] if probs else all_results[0]["final"]
        rep_run = next((r for r in all_results if r["final"] == top_winner), all_results[0])
    elif scope == "groups":
        rep_run = all_results[0]
    else:
        if probs:
            top_team = max(probs.items(), key=lambda x: x[1])[0]
            rep_run = next((r for r in all_results if top_team in r[scope]), all_results[0])
        else:
            rep_run = all_results[0]

    team_stats = {}
    for team, stats in sim.goals_tracker.items():
        if stats["count"] > 0:
            avg_scored = stats["scored"] / stats["count"]
            avg_conceded = stats["conceded"] / stats["count"]
            team_stats[team] = {
                "avg_goals_scored": round(avg_scored, 2),
                "avg_goals_conceded": round(avg_conceded, 2),
                "avg_goal_diff": round(avg_scored - avg_conceded, 2)
            }

    result = {
        "groups": rep_run["groups"],
        "r32": rep_run["r32"],
        "r16": rep_run["r16"],
        "r8": rep_run["r8"],
        "semi": rep_run["semi"],
        "final": rep_run["final"],
        "win_probabilities": probs,
        "team_stats": team_stats,
    }

    if not is_custom and not is_partial_scope:
        _bracket_cache = result
        _bracket_cache_ts = now

    return result
