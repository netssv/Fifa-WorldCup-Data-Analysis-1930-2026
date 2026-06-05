from __future__ import annotations

import time
from typing import Any

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


import random

async def simulate_full_bracket(
    chaos_factor: float = 0.0,
    boost_team: str | None = None,
    boost_amount: float = 0.0,
    sim_runs: int = 1,
) -> dict:
    global _bracket_cache, _bracket_cache_ts

    is_custom = chaos_factor > 0.0 or (boost_team is not None and boost_amount > 0.0) or sim_runs > 1

    now = time.monotonic()
    if not is_custom and _bracket_cache and (now - _bracket_cache_ts) < _CACHE_TTL:
        return _bracket_cache

    def get_overrides(ta: str, tb: str):
        elo_a = _get_elo(ta) + boost_amount if ta == boost_team else None
        form_a = min(0.99, _get_form(ta) + (boost_amount / 500.0)) if ta == boost_team else None
        elo_b = _get_elo(tb) + boost_amount if tb == boost_team else None
        form_b = min(0.99, _get_form(tb) + (boost_amount / 500.0)) if tb == boost_team else None
        return elo_a, elo_b, form_a, form_b

    def sim_match(ta: str, tb: str, stage: str = "r32") -> str:
        elo_a, elo_b, form_a, form_b = get_overrides(ta, tb)
        goals_a, goals_b = predict_with_model(
            ta, tb, stage,
            elo_a_override=elo_a, elo_b_override=elo_b,
            form_a_override=form_a, form_b_override=form_b
        )
        p_a, _, p_b = goals_to_probs(goals_a, goals_b, stage)
        
        sum_p = p_a + p_b or 1.0
        p_a_norm = p_a / sum_p

        if sim_runs == 1 and chaos_factor == 0.0:
            return ta if p_a >= p_b else tb

        if chaos_factor > 0.0:
            p_a_norm = p_a_norm * (1 - chaos_factor) + 0.5 * chaos_factor

        return ta if random.random() < p_a_norm else tb

    def run_single_simulation():
        # ── Group stage ──────────────────────────
        groups_result = {}
        all_qualifiers = []

        for group_name, teams in GROUPS_2026.items():
            qualify_scores = {t: 0.0 for t in teams}
            for i, ta in enumerate(teams):
                for tb in teams[i + 1:]:
                    elo_a, elo_b, form_a, form_b = get_overrides(ta, tb)
                    goals_a, goals_b = predict_with_model(
                        ta, tb, "group",
                        elo_a_override=elo_a, elo_b_override=elo_b,
                        form_a_override=form_a, form_b_override=form_b
                    )
                    p_a, p_draw, p_b = goals_to_probs(goals_a, goals_b, "group")
                    qualify_scores[ta] += p_a + p_draw * 0.5
                    qualify_scores[tb] += p_b + p_draw * 0.5

            max_s = max(qualify_scores.values()) or 1.0
            
            if sim_runs == 1 and chaos_factor == 0.0:
                ranked = sorted(qualify_scores.items(), key=lambda x: x[1], reverse=True)
                qualifiers = [ranked[0][0], ranked[1][0]]
            else:
                team_probs = {t: (s / max_s) for t, s in qualify_scores.items()}
                if chaos_factor > 0.0:
                    team_probs = {t: p * (1 - chaos_factor) + 0.5 * chaos_factor for t, p in team_probs.items()}
                
                weights = list(team_probs.values())
                teams_list = list(team_probs.keys())
                
                t1_idx = random.choices(range(len(teams_list)), weights=weights, k=1)[0]
                t1 = teams_list[t1_idx]
                
                weights[t1_idx] = 0.0
                if sum(weights) == 0:
                    t2_idx = (t1_idx + 1) % len(teams_list)
                else:
                    t2_idx = random.choices(range(len(teams_list)), weights=weights, k=1)[0]
                t2 = teams_list[t2_idx]
                
                qualifiers = [t1, t2]

            all_qualifiers.extend(qualifiers)
            groups_result[group_name] = qualifiers

        # ── Knockout rounds ──────────────────────
        ranked_qualifiers = sorted(all_qualifiers, key=_get_elo, reverse=True)
        byes = ranked_qualifiers[:8]
        playoffs = ranked_qualifiers[8:]

        r32_winners = []
        for i in range(0, 16, 2):
            winner = sim_match(playoffs[i], playoffs[i + 1], "r32")
            r32_winners.append(winner)

        r32_selections = byes + r32_winners

        r16_selections = []
        for i in range(0, 16, 2):
            winner = sim_match(r32_selections[i], r32_selections[i + 1], "r16")
            r16_selections.append(winner)

        r8_selections = []
        for i in range(0, 8, 2):
            winner = sim_match(r16_selections[i], r16_selections[i + 1], "r8")
            r8_selections.append(winner)

        semi_selections = []
        for i in range(0, 4, 2):
            winner = sim_match(r8_selections[i], r8_selections[i + 1], "semi")
            semi_selections.append(winner)

        final_winner = sim_match(semi_selections[0], semi_selections[1], "final")

        return {
            "groups": groups_result,
            "r32": r32_selections,
            "r16": r16_selections,
            "r8": r8_selections,
            "semi": semi_selections,
            "final": final_winner,
        }

    # Execute simulations
    runs_to_do = max(1, min(1000, sim_runs))
    championship_wins = {}
    all_results = []

    for _ in range(runs_to_do):
        res = run_single_simulation()
        winner = res["final"]
        championship_wins[winner] = championship_wins.get(winner, 0) + 1
        all_results.append(res)

    # Find the most frequent winner
    top_winner = max(championship_wins.items(), key=lambda x: x[1])[0]
    # Pick a representative run that resulted in this winner
    rep_run = next((r for r in all_results if r["final"] == top_winner), all_results[0])

    # Win probabilities based on championship frequencies
    win_probs = {t: round(count / runs_to_do, 4) for t, count in sorted(championship_wins.items(), key=lambda x: -x[1])}

    result = {
        "groups": rep_run["groups"],
        "r32": rep_run["r32"],
        "r16": rep_run["r16"],
        "r8": rep_run["r8"],
        "semi": rep_run["semi"],
        "final": rep_run["final"],
        "win_probabilities": win_probs,
    }

    if not is_custom:
        _bracket_cache = result
        _bracket_cache_ts = now

    return result
