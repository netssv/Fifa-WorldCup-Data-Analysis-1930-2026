import numpy as np
from typing import Any
from .constants import GROUPS_2026
from .predictions import predict_with_model, goals_to_probs
from .bracket_sim import ROUND_ORDER, _get_elo, _get_form

class TournamentSimulator:
    def __init__(
        self,
        effective_runs: int,
        chaos_factor: float,
        boost_team: str | None,
        boost_amount: float,
        use_goldman: bool = True,
        use_klement: bool = True,
        seed: int | None = None,
    ):
        self.effective_runs = effective_runs
        self.chaos_factor = chaos_factor
        self.boost_team = boost_team
        self.boost_amount = boost_amount
        self.use_goldman = use_goldman
        self.use_klement = use_klement
        self.goals_tracker = {}
        self.rng = np.random.default_rng(seed)

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

    def _apply_chaos(self, goals: float) -> float:
        if self.chaos_factor <= 0.0:
            return goals
        perturb = (self.rng.random() - 0.5) * self.chaos_factor
        return max(0.05, goals * (1.0 + perturb))

    def _sample_match_goals(self, goals_a: float, goals_b: float) -> tuple[int, int]:
        lam_a = max(0.05, goals_a)
        lam_b = max(0.05, goals_b)
        return int(self.rng.poisson(lam_a)), int(self.rng.poisson(lam_b))

    def _resolve_knockout_draw(
        self, ta: str, tb: str, goals_a: float, goals_b: float, stage: str
    ) -> str:
        penalty_prob = 0.5 + max(min(goals_a - goals_b, 1.0), -1.0) * 0.08
        penalty_prob = min(max(penalty_prob, 0.12), 0.88)
        return ta if self.rng.random() < penalty_prob else tb

    def sim_match(self, ta: str, tb: str, stage: str = "r32") -> str:
        elo_a, elo_b, form_a, form_b = self.get_overrides(ta, tb)
        goals_a, goals_b = predict_with_model(
            ta, tb, stage,
            elo_a_override=elo_a, elo_b_override=elo_b,
            form_a_override=form_a, form_b_override=form_b,
            use_goldman=self.use_goldman,
            use_klement=self.use_klement,
        )
        goals_a = self._apply_chaos(goals_a)
        goals_b = self._apply_chaos(goals_b)
        sampled_a, sampled_b = self._sample_match_goals(goals_a, goals_b)
        self.record_match_goals(ta, tb, sampled_a, sampled_b)

        if stage != "group" and sampled_a == sampled_b:
            return self._resolve_knockout_draw(ta, tb, goals_a, goals_b, stage)
        return ta if sampled_a >= sampled_b else tb

    def run_single_simulation(self, stop_at: str = "final"):
        stop_index = ROUND_ORDER.index(stop_at) if stop_at in ROUND_ORDER else len(ROUND_ORDER) - 1

        # ── Group stage ──────────────────────────────────────────────
        groups_result = {}
        all_qualifiers = []

        for group_name, teams in GROUPS_2026.items():
            group_stats = {
                t: {"points": 0, "gd": 0, "gf": 0} for t in teams
            }
            for i, ta in enumerate(teams):
                for tb in teams[i + 1:]:
                    elo_a, elo_b, form_a, form_b = self.get_overrides(ta, tb)
                    goals_a, goals_b = predict_with_model(
                        ta, tb, "group",
                        elo_a_override=elo_a, elo_b_override=elo_b,
                        form_a_override=form_a, form_b_override=form_b,
                        use_goldman=self.use_goldman,
                        use_klement=self.use_klement,
                    )
                    goals_a = self._apply_chaos(goals_a)
                    goals_b = self._apply_chaos(goals_b)
                    sampled_a, sampled_b = self._sample_match_goals(goals_a, goals_b)
                    self.record_match_goals(ta, tb, sampled_a, sampled_b)

                    if sampled_a > sampled_b:
                        group_stats[ta]["points"] += 3
                    elif sampled_a < sampled_b:
                        group_stats[tb]["points"] += 3
                    else:
                        group_stats[ta]["points"] += 1
                        group_stats[tb]["points"] += 1

                    group_stats[ta]["gd"] += sampled_a - sampled_b
                    group_stats[tb]["gd"] += sampled_b - sampled_a
                    group_stats[ta]["gf"] += sampled_a
                    group_stats[tb]["gf"] += sampled_b

            ranked = sorted(
                teams,
                key=lambda t: (
                    group_stats[t]["points"],
                    group_stats[t]["gd"],
                    group_stats[t]["gf"],
                    _get_elo(t),
                ),
                reverse=True,
            )
            qualifiers = ranked[:2]
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
