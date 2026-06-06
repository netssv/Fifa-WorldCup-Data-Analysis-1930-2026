import random
from typing import Any
from .constants import GROUPS_2026
from .predictions import predict_with_model, goals_to_probs
from .bracket_sim import ROUND_ORDER, _get_elo, _get_form

class TournamentSimulator:
    def __init__(self, effective_runs: int, chaos_factor: float, boost_team: str | None, boost_amount: float):
        self.effective_runs = effective_runs
        self.chaos_factor = chaos_factor
        self.boost_team = boost_team
        self.boost_amount = boost_amount
        self.goals_tracker = {}

    def record_match_goals(self, ta: str, tb: str, ga: float, gb: float):
        if ta not in self.goals_tracker:
            self.goals_tracker[ta] = {"scored": 0.0, "conceded": 0.0, "count": 0}
        if tb not in self.goals_tracker:
            self.goals_tracker[tb] = {"scored": 0.0, "conceded": 0.0, "count": 0}
        self.goals_tracker[ta]["scored"] += ga
        self.goals_tracker[ta]["conceded"] += gb
        self.goals_tracker[ta]["count"] += 1
        self.goals_tracker[tb]["scored"] += gb
        self.goals_tracker[tb]["conceded"] += ga
        self.goals_tracker[tb]["count"] += 1

    def get_overrides(self, ta: str, tb: str):
        elo_a = _get_elo(ta) + self.boost_amount if ta == self.boost_team else None
        form_a = min(0.99, _get_form(ta) + (self.boost_amount / 500.0)) if ta == self.boost_team else None
        elo_b = _get_elo(tb) + self.boost_amount if tb == self.boost_team else None
        form_b = min(0.99, _get_form(tb) + (self.boost_amount / 500.0)) if tb == self.boost_team else None
        return elo_a, elo_b, form_a, form_b

    def sim_match(self, ta: str, tb: str, stage: str = "r32") -> str:
        elo_a, elo_b, form_a, form_b = self.get_overrides(ta, tb)
        goals_a, goals_b = predict_with_model(
            ta, tb, stage,
            elo_a_override=elo_a, elo_b_override=elo_b,
            form_a_override=form_a, form_b_override=form_b
        )
        p_a, _, p_b = goals_to_probs(goals_a, goals_b, stage)
        self.record_match_goals(ta, tb, goals_a, goals_b)

        sum_p = p_a + p_b or 1.0
        p_a_norm = p_a / sum_p

        if self.effective_runs == 1 and self.chaos_factor == 0.0:
            return ta if p_a >= p_b else tb

        if self.chaos_factor > 0.0:
            p_a_norm = p_a_norm * (1 - self.chaos_factor) + 0.5 * self.chaos_factor

        return ta if random.random() < p_a_norm else tb

    def run_single_simulation(self, stop_at: str = "final"):
        stop_index = ROUND_ORDER.index(stop_at) if stop_at in ROUND_ORDER else len(ROUND_ORDER) - 1

        # ── Group stage ──────────────────────────────────────────────
        groups_result = {}
        all_qualifiers = []

        for group_name, teams in GROUPS_2026.items():
            qualify_scores = {t: 0.0 for t in teams}
            for i, ta in enumerate(teams):
                for tb in teams[i + 1:]:
                    elo_a, elo_b, form_a, form_b = self.get_overrides(ta, tb)
                    goals_a, goals_b = predict_with_model(
                        ta, tb, "group",
                        elo_a_override=elo_a, elo_b_override=elo_b,
                        form_a_override=form_a, form_b_override=form_b
                    )
                    self.record_match_goals(ta, tb, goals_a, goals_b)
                    
                    p_a, p_draw, p_b = goals_to_probs(goals_a, goals_b, "group")
                    qualify_scores[ta] += p_a + p_draw * 0.5
                    qualify_scores[tb] += p_b + p_draw * 0.5

            max_s = max(qualify_scores.values()) or 1.0

            if self.effective_runs == 1 and self.chaos_factor == 0.0:
                ranked = sorted(qualify_scores.items(), key=lambda x: x[1], reverse=True)
                qualifiers = [ranked[0][0], ranked[1][0]]
            else:
                team_probs = {t: (s / max_s) for t, s in qualify_scores.items()}
                if self.chaos_factor > 0.0:
                    team_probs = {t: p * (1 - self.chaos_factor) + 0.5 * self.chaos_factor for t, p in team_probs.items()}

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

        if stop_index == ROUND_ORDER.index("groups"):
            return {"groups": groups_result, "r32": [], "r16": [], "r8": [], "semi": [], "final": ""}

        # ── Round of 32 ──────────────────────────────────────────────
        ranked_qualifiers = sorted(all_qualifiers, key=_get_elo, reverse=True)
        byes = ranked_qualifiers[:8]
        playoffs = ranked_qualifiers[8:]

        r32_winners = []
        for i in range(0, 16, 2):
            winner = self.sim_match(playoffs[i], playoffs[i + 1], "r32")
            r32_winners.append(winner)

        r32_selections = byes + r32_winners

        if stop_index == ROUND_ORDER.index("r32"):
            return {"groups": groups_result, "r32": r32_selections, "r16": [], "r8": [], "semi": [], "final": ""}

        # ── Round of 16 ──────────────────────────────────────────────
        r16_selections = []
        for i in range(0, 16, 2):
            winner = self.sim_match(r32_selections[i], r32_selections[i + 1], "r16")
            r16_selections.append(winner)

        if stop_index == ROUND_ORDER.index("r16"):
            return {"groups": groups_result, "r32": r32_selections, "r16": r16_selections, "r8": [], "semi": [], "final": ""}

        # ── Quarterfinals ────────────────────────────────────────────
        r8_selections = []
        for i in range(0, 8, 2):
            winner = self.sim_match(r16_selections[i], r16_selections[i + 1], "r8")
            r8_selections.append(winner)

        if stop_index == ROUND_ORDER.index("r8"):
            return {"groups": groups_result, "r32": r32_selections, "r16": r16_selections, "r8": r8_selections, "semi": [], "final": ""}

        # ── Semifinals ───────────────────────────────────────────────
        semi_selections = []
        for i in range(0, 4, 2):
            winner = self.sim_match(r8_selections[i], r8_selections[i + 1], "semi")
            semi_selections.append(winner)

        if stop_index == ROUND_ORDER.index("semi"):
            return {"groups": groups_result, "r32": r32_selections, "r16": r16_selections, "r8": r8_selections, "semi": semi_selections, "final": ""}

        # ── Final ─────────────────────────────────────────────────────
        final_winner = self.sim_match(semi_selections[0], semi_selections[1], "final")

        return {
            "groups": groups_result,
            "r32": r32_selections,
            "r16": r16_selections,
            "r8": r8_selections,
            "semi": semi_selections,
            "final": final_winner,
        }
