"""
FIFA 2026 Prediction API
Endpoints:
  POST /predict/match       — single-match win probabilities
  POST /predict/group       — group-stage qualifying probabilities
  POST /predict/team-path   — round-by-round advancement probability
  GET  /predict/bracket/full — full simulated tournament bracket
                               ?scope=all|groups|r32|r16|r8|semi|final
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .model_loader import _models_loaded
from .predictions import predict_with_model, goals_to_probs, _get_elo, _get_form, _get_h2h, _confidence_label
from .constants import GROUPS_2026
from .bracket_sim import simulate_full_bracket
from .bracket_sim_stream import simulate_bracket_stream
from .team_path import compute_team_path
from .schemas import MatchRequest, GroupRequest, TeamPathRequest

import os
import json

app = FastAPI(
    title="FIFA 2026 Prediction API",
    description="ML-powered match and bracket predictions for FIFA World Cup 2026",
    version="1.0.0",
)

# ── CORS Configuration ────────────────────────────────────────────────
# In production (Vercel/cloud): set ALLOWED_ORIGINS env var to comma-separated list
#   e.g. ALLOWED_ORIGINS=https://your-app.vercel.app,https://custom-domain.com
# In local dev: defaults to allow all origins so any device on the LAN works
_env_origins = os.environ.get("ALLOWED_ORIGINS", "")
_allowed_origins: list[str] | str = (
    [o.strip() for o in _env_origins.split(",") if o.strip()]
    if _env_origins
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=_env_origins != "",  # credentials only when origins are specific
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "service": "FIFA 2026 Prediction API",
        "version": "1.0.0",
        "models_loaded": _models_loaded,
        "endpoints": ["/predict/match", "/predict/group", "/predict/bracket/full"],
    }


@app.get("/data-sources")
async def data_sources():
    """Returns which feature datasets are actually loaded and how many teams each covers."""
    from .model_loader import (
        _squad_values, _eafc_ratings, _xg_features,
        _odds_features, _coach_features, _fatigue_features, _pressure_features,
    )
    return {
        "squad_value":    {"loaded": len(_squad_values) > 0,   "teams": len(_squad_values),   "label": "Transfermarkt squad values"},
        "ea_fc_ratings":  {"loaded": len(_eafc_ratings) > 0,   "teams": len(_eafc_ratings),   "label": "EA FC top-23 player ratings"},
        "xg_stats":       {"loaded": len(_xg_features) > 0,    "teams": len(_xg_features),    "label": "Expected goals (xG) parameters"},
        "market_odds":    {"loaded": len(_odds_features) > 0,  "teams": len(_odds_features),  "label": "Bookmaker implied probabilities"},
        "coach_exp":      {"loaded": len(_coach_features) > 0, "teams": len(_coach_features), "label": "Coach tenure & tournament records"},
        "fatigue":        {"loaded": len(_fatigue_features) > 0,"teams": len(_fatigue_features),"label": "Match load & fatigue index"},
        "pressure":       {"loaded": len(_pressure_features) > 0,"teams": len(_pressure_features),"label": "Penalty & big-match pressure rate"},
        "models_loaded":  _models_loaded,
    }


@app.post("/predict/match")
async def predict_match(req: MatchRequest):
    team_a, team_b, stage = req.team_a.strip(), req.team_b.strip(), req.stage.lower()
    if team_a == team_b:
        raise HTTPException(status_code=400, detail="team_a and team_b must differ")

    goals_a, goals_b = predict_with_model(
        team_a, team_b, stage,
        elo_a_override=req.elo_a_override, elo_b_override=req.elo_b_override,
        form_a_override=req.form_a_override, form_b_override=req.form_b_override,
        penalty_a_override=req.penalty_a_override, penalty_b_override=req.penalty_b_override,
        big_match_a_override=req.big_match_a_override, big_match_b_override=req.big_match_b_override,
        knockout_a_override=req.knockout_a_override, knockout_b_override=req.knockout_b_override,
    )
    p_a, p_draw, p_b = goals_to_probs(goals_a, goals_b, stage)
    max_prob = max(p_a, p_b)
    winner = team_a if p_a >= p_b else team_b
    elo_a = req.elo_a_override if req.elo_a_override is not None else _get_elo(team_a)
    elo_b = req.elo_b_override if req.elo_b_override is not None else _get_elo(team_b)

    return {
        "team_a": team_a, "team_b": team_b,
        "team_a_win_prob": round(p_a, 4), "draw_prob": round(p_draw, 4), "team_b_win_prob": round(p_b, 4),
        "predicted_winner": winner,
        "confidence": _confidence_label(max_prob), "confidence_score": round(max_prob, 4),
        "goals_a": round(goals_a, 2), "goals_b": round(goals_b, 2),
        "model_features": {
            "elo_diff": round(elo_a - elo_b),
            "team_a_form": round(req.form_a_override if req.form_a_override is not None else _get_form(team_a), 2),
            "team_b_form": round(req.form_b_override if req.form_b_override is not None else _get_form(team_b), 2),
            "h2h_wins_a": _get_h2h(team_a, team_b),
        },
    }


@app.post("/predict/group")
async def predict_group(req: GroupRequest):
    teams = [t.strip() for t in req.teams]
    if len(teams) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 teams")

    qualify_scores: dict[str, float] = {t: 0.0 for t in teams}
    for i, ta in enumerate(teams):
        for tb in teams[i + 1:]:
            goals_a, goals_b = predict_with_model(ta, tb, "group")
            p_a, p_draw, p_b = goals_to_probs(goals_a, goals_b, "group")
            qualify_scores[ta] += p_a + p_draw * 0.5
            qualify_scores[tb] += p_b + p_draw * 0.5

    max_score = max(qualify_scores.values()) or 1.0
    qualify_probs = {t: min(0.99, s / max_score) for t, s in qualify_scores.items()}
    ranked = sorted(qualify_probs.items(), key=lambda x: x[1], reverse=True)

    return {
        "group": req.group_name,
        "rankings": [
            {"team": team, "qualify_prob": round(prob, 4), "rank": idx + 1}
            for idx, (team, prob) in enumerate(ranked)
        ],
        "suggested_qualifiers": [ranked[0][0], ranked[1][0]],
    }


@app.post("/predict/team-path")
async def predict_team_path(req: TeamPathRequest):
    try:
        return compute_team_path(req.team.strip())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/predict/bracket/full")
async def predict_bracket_full(
    chaos_factor: float = 0.0,
    boost_team: str | None = None,
    boost_amount: float = 0.0,
    sim_runs: int = 1,
    scope: str = "all",
):
    return await simulate_full_bracket(
        chaos_factor=chaos_factor,
        boost_team=boost_team,
        boost_amount=boost_amount,
        sim_runs=sim_runs,
        scope=scope,
    )


@app.get("/predict/bracket/stream")
async def predict_bracket_stream(
    chaos_factor: float = 0.0,
    boost_team: str | None = None,
    boost_amount: float = 0.0,
    sim_runs: int = 1,
    scope: str = "all",
):
    """Server-Sent Events endpoint that streams real per-run simulation progress.
    Yields: data: {"type":"progress","current":N,"total":M}
    Final:  data: {"type":"result", ...bracket_data}
    """
    async def event_generator():
        async for event in simulate_bracket_stream(
            chaos_factor=chaos_factor,
            boost_team=boost_team,
            boost_amount=boost_amount,
            sim_runs=sim_runs,
            scope=scope,
        ):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
