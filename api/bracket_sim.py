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


def find_most_representative_run(all_results: list[dict], scope: str) -> dict:
    if not all_results:
        return {}

    group_freq: dict[str, dict[str, int]] = {}
    playoff_stages = ["r32", "r16", "r8", "semi", "final"]
    playoff_freq: dict[str, dict[str, int]] = {s: {} for s in playoff_stages}

    for r in all_results:
        for g_name, qualifiers in r.get("groups", {}).items():
            if g_name not in group_freq:
                group_freq[g_name] = {}
            for t in qualifiers:
                group_freq[g_name][t] = group_freq[g_name].get(t, 0) + 1
        for s in playoff_stages:
            val = r.get(s)
            if isinstance(val, list):
                for t in val:
                    if t:
                        playoff_freq[s][t] = playoff_freq[s].get(t, 0) + 1
            elif val:
                playoff_freq[s][val] = playoff_freq[s].get(val, 0) + 1

    best_run = all_results[0]
    best_score = -1.0

    for r in all_results:
        score = 0.0
        for g_name, qualifiers in r.get("groups", {}).items():
            for t in qualifiers:
                score += group_freq.get(g_name, {}).get(t, 0)
        for s in playoff_stages:
            val = r.get(s)
            if isinstance(val, list):
                for t in val:
                    if t:
                        score += playoff_freq[s].get(t, 0)
            elif val:
                score += playoff_freq[s].get(val, 0)

        if score > best_score:
            best_score = score
            best_run = r

    return best_run


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

    rep_run = find_most_representative_run(all_results, scope)

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
