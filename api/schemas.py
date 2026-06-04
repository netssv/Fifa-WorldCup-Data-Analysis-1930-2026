from pydantic import BaseModel


class MatchRequest(BaseModel):
    team_a: str
    team_b: str
    stage: str = "group"
    # Custom AI Overrides
    elo_a_override: float | None = None
    elo_b_override: float | None = None
    form_a_override: float | None = None
    form_b_override: float | None = None
    penalty_a_override: float | None = None
    penalty_b_override: float | None = None
    big_match_a_override: float | None = None
    big_match_b_override: float | None = None
    knockout_a_override: float | None = None
    knockout_b_override: float | None = None


class GroupRequest(BaseModel):
    group_name: str
    teams: list[str]


class TeamPathRequest(BaseModel):
    team: str


class BracketSimRequest(BaseModel):
    chaos_factor: float = 0.0
    elo_weight: float = 0.65
    boost_team: str | None = None
    boost_amount: float = 0.0
    sim_runs: int = 1


