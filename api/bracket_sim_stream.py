"""
bracket_sim_stream.py

Async generator that runs each tournament simulation one-by-one,
yielding SSE progress events so the frontend can display a real counter.

Yields dicts that become JSON in the SSE stream:
  {"type": "progress", "current": N, "total": M}
  {"type": "result",   ...full_bracket_data }
"""

from __future__ import annotations

import asyncio
import os
import warnings
from typing import AsyncGenerator, Any

from .constants import GROUPS_2026
from .bracket_sim import SimScope

SimScope = str  # re-export for clarity


def _prewarm_group_cache(boost_team: str | None, boost_amount: float, use_goldman: bool, use_klement: bool) -> None:
    """Pre-compute all 72 fixed group-stage match predictions into cache.

    Group teams never change between simulation runs, so this eliminates
    repeated RF model calls for the most frequent matchups.
    """
    from .predictions import predict_with_model
    for teams in GROUPS_2026.values():
        for i, ta in enumerate(teams):
            for tb in teams[i + 1:]:
                elo_a = None
                form_a = None
                elo_b = None
                form_b = None
                if boost_team:
                    from .bracket_sim import _get_elo, _get_form
                    if ta == boost_team:
                        elo_a  = _get_elo(ta) + boost_amount
                        form_a = min(0.99, _get_form(ta) + (boost_amount / 500.0))
                    if tb == boost_team:
                        elo_b  = _get_elo(tb) + boost_amount
                        form_b = min(0.99, _get_form(tb) + (boost_amount / 500.0))
                predict_with_model(
                    ta, tb, "group",
                    elo_a_override=elo_a, elo_b_override=elo_b,
                    form_a_override=form_a, form_b_override=form_b,
                    use_goldman=use_goldman,
                    use_klement=use_klement,
                )


async def simulate_bracket_stream(
    chaos_factor: float = 0.0,
    boost_team: str | None = None,
    boost_amount: float = 0.0,
    sim_runs: int = 1,
    scope: str = "all",
    use_goldman: bool = True,
    use_klement: bool = True,
    seed: int | None = None,
) -> AsyncGenerator[dict[str, Any], None]:
    """Async generator that streams simulation progress events then final result."""

    is_railway = "RAILWAY_STATIC_URL" in os.environ or "RAILWAY_ENVIRONMENT" in os.environ
    max_runs = 100 if is_railway else 1000000
    effective_runs = max(1, min(max_runs, sim_runs))

    # Suppress sklearn feature-name warnings — we intentionally use numpy arrays
    warnings.filterwarnings("ignore", message="X does not have valid feature names")

    from .predictions import clear_prediction_cache
    clear_prediction_cache()

    # Pre-warm cache for all fixed group-stage matchups before simulating
    _prewarm_group_cache(boost_team, boost_amount, use_goldman, use_klement)

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

    all_results: list[dict] = []

    # Yield progress every ~2% (at most 50 events) to prevent blocking/network overhead
    yield_interval = max(1, effective_runs // 50)

    for i in range(effective_runs):
        # Run one simulation synchronously (CPU-bound, but short per run)
        res = sim.run_single_simulation(stop_at=scope)
        all_results.append(res)

        current_run = i + 1
        # Yield progress event in batches
        if current_run % yield_interval == 0 or current_run == effective_runs:
            yield {"type": "progress", "current": current_run, "total": effective_runs}
            # Give the event loop a chance to flush and handle async tasks
            await asyncio.sleep(0)

    # ── Aggregate probabilities ────────────────────────────────────────
    probs: dict[str, float] = {}
    if scope == "groups":
        qualify_counts: dict[str, int] = {}
        for res in all_results:
            for qualifiers in res["groups"].values():
                for team in qualifiers:
                    qualify_counts[team] = qualify_counts.get(team, 0) + 1
        probs = {t: round(c / effective_runs, 4) for t, c in qualify_counts.items()}

    elif scope == "all":
        championship_wins: dict[str, int] = {}
        for res in all_results:
            winner = res["final"]
            championship_wins[winner] = championship_wins.get(winner, 0) + 1
        probs = {t: round(c / effective_runs, 4) for t, c in championship_wins.items()}

    else:
        round_counts: dict[str, int] = {}
        for res in all_results:
            teams_in_round = res[scope]
            if isinstance(teams_in_round, list):
                for team in teams_in_round:
                    if team:
                        round_counts[team] = round_counts.get(team, 0) + 1
            elif teams_in_round:
                round_counts[teams_in_round] = round_counts.get(teams_in_round, 0) + 1
        probs = {t: round(c / effective_runs, 4) for t, c in round_counts.items()}

    # ── Pick representative run ────────────────────────────────────────
    from .bracket_sim import find_most_representative_run
    rep_run = find_most_representative_run(all_results, scope)

    # ── Team stats from the simulator ─────────────────────────────────
    team_stats: dict[str, dict] = {}
    for team, stats in sim.goals_tracker.items():
        if stats["count"] > 0:
            avg_scored = stats["scored"] / stats["count"]
            avg_conceded = stats["conceded"] / stats["count"]
            team_stats[team] = {
                "avg_goals_scored": round(avg_scored, 2),
                "avg_goals_conceded": round(avg_conceded, 2),
                "avg_goal_diff": round(avg_scored - avg_conceded, 2),
            }

    # ── Final result event ─────────────────────────────────────────────
    yield {
        "type": "result",
        "groups": rep_run["groups"],
        "r32": rep_run["r32"],
        "r16": rep_run["r16"],
        "r8": rep_run["r8"],
        "semi": rep_run["semi"],
        "final": rep_run["final"],
        "win_probabilities": probs,
        "team_stats": team_stats,
    }
