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
from typing import AsyncGenerator, Any

from .constants import GROUPS_2026
from .bracket_sim import SimScope

SimScope = str  # re-export for clarity


async def simulate_bracket_stream(
    chaos_factor: float = 0.0,
    boost_team: str | None = None,
    boost_amount: float = 0.0,
    sim_runs: int = 1,
    scope: str = "all",
) -> AsyncGenerator[dict[str, Any], None]:
    """Async generator that streams simulation progress events then final result."""

    is_railway = "RAILWAY_STATIC_URL" in os.environ or "RAILWAY_ENVIRONMENT" in os.environ
    max_runs = 100 if is_railway else 10_000
    effective_runs = max(1, min(max_runs, sim_runs))

    from .sim_runner import TournamentSimulator

    sim = TournamentSimulator(
        effective_runs=effective_runs,
        chaos_factor=chaos_factor,
        boost_team=boost_team,
        boost_amount=boost_amount,
    )

    all_results: list[dict] = []

    for i in range(effective_runs):
        # Run one simulation synchronously (CPU-bound, but short per run)
        res = sim.run_single_simulation(stop_at=scope)
        all_results.append(res)

        # Yield progress event
        yield {"type": "progress", "current": i + 1, "total": effective_runs}

        # Give the event loop a chance to flush every 5 runs (avoids blocking)
        if (i + 1) % 5 == 0:
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
