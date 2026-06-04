"""
team_path.py
─────────────
Business logic for the /predict/team-path endpoint.
Computes a team's round-by-round advancement probabilities
using group-simulation + ELO-tier opponents at each knockout stage.
"""
from __future__ import annotations

from .constants import GROUPS_2026, FIFA_ELO_2026
from .predictions import predict_with_model, goals_to_probs, _get_elo, _get_form


def _win_prob_vs_tier(team_elo: float, team_form: float, opp_elo: float, stage: str) -> float:
    """Expected win probability against a median-tier opponent at a given stage."""
    scale = (team_elo - opp_elo) / 400.0
    goals_team = max(0.1, 1.2 + scale * 0.6 + team_form * 0.4)
    goals_opp  = max(0.1, 1.2 - scale * 0.6 + 0.55 * 0.4)
    p_win, _, p_lose = goals_to_probs(goals_team, goals_opp, stage)
    return p_win / (p_win + p_lose) if (p_win + p_lose) > 0 else 0.5


def _group_qualify_prob(team: str, group_teams: list[str]) -> float:
    """Simulate all round-robin matches and return team's normalised qualifying probability."""
    scores: dict[str, float] = {t: 0.0 for t in group_teams}
    for i, ta in enumerate(group_teams):
        for tb in group_teams[i + 1:]:
            goals_a, goals_b = predict_with_model(ta, tb, "group")
            p_a, p_draw, p_b = goals_to_probs(goals_a, goals_b, "group")
            scores[ta] += p_a + p_draw * 0.5
            scores[tb] += p_b + p_draw * 0.5
    max_s = max(scores.values()) or 1.0
    return min(0.99, scores[team] / max_s)


def compute_team_path(team: str) -> dict:
    """
    Returns a dict with group, ELO, form, path probabilities and per-round
    win probabilities for the given team.

    Raises ValueError if the team is not found in any group.
    """
    team_group = None
    group_teams: list[str] = []
    for group_name, teams in GROUPS_2026.items():
        if team in teams:
            team_group, group_teams = group_name, teams
            break
    if team_group is None:
        raise ValueError(f"Team '{team}' not found in any group")

    team_elo  = _get_elo(team)
    team_form = _get_form(team)
    all_elos  = sorted(FIFA_ELO_2026.values(), reverse=True)

    group_prob = _group_qualify_prob(team, group_teams)

    # Represent "typical opponent" at each round via percentile ELO
    win_r32   = _win_prob_vs_tier(team_elo, team_form, all_elos[len(all_elos) // 2], "r32")
    win_r16   = _win_prob_vs_tier(team_elo, team_form, all_elos[len(all_elos) // 3], "r16")
    win_qf    = _win_prob_vs_tier(team_elo, team_form, all_elos[len(all_elos) // 4], "r8")
    win_sf    = _win_prob_vs_tier(team_elo, team_form, all_elos[4], "semi")
    win_final = _win_prob_vs_tier(team_elo, team_form, all_elos[2], "final")

    p_r16    = group_prob * win_r32
    p_qf     = p_r16 * win_r16
    p_sf     = p_qf * win_qf
    p_final  = p_sf * win_sf
    p_champ  = p_final * win_final

    return {
        "team": team, "group": team_group,
        "elo": team_elo, "form": round(team_form, 2),
        "path": {
            "qualify_from_group": round(group_prob, 4),
            "reach_r16":           round(p_r16,   4),
            "reach_quarterfinals": round(p_qf,    4),
            "reach_semifinals":    round(p_sf,    4),
            "reach_final":         round(p_final, 4),
            "win_tournament":      round(p_champ, 4),
        },
        "rounds": {
            "group_stage":  round(group_prob, 4),
            "round_of_32":  round(win_r32,    4),
            "round_of_16":  round(win_r16,    4),
            "quarterfinals": round(win_qf,    4),
            "semifinals":   round(win_sf,     4),
            "final":        round(win_final,  4),
        },
    }
