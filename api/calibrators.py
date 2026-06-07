"""
calibrators.py
--------------
Post-processing calibrators applied to predicted goals.

Each calibrator is an independent adjustment on top of the RF/Elo blended output:
  8.  Competitive pressure (penalty kicks, big-match, knockout rates)
  9.  Macroeconomic & social factor (GDP per capita + population, weighted by football culture)
  10. Mentality (defending-champion penalty + debutant surprise boost)
  11. Host advantage for USA, Mexico, Canada
  12. Venue heat fatigue (June temperatures above 28C)
  13. Squad average age (youth inexperience penalty / veteran fatigue penalty)
  14. Top-league scorer talent (Goldman Sachs method: top-50 scorers in elite EU leagues, max 4)
"""
from __future__ import annotations
import math
from .constants import FOOTBALL_CULTURAL_IMPORTANCE, VENUE_TEMPERATURE_JUNE_2026
from src.constants_v3 import TEAM_PEDIGREE, CLIMATE_TRAVEL, SQUAD_EXPERIENCE

_PRESSURE_DEFAULTS = {"penalty_win_rate": 0.48, "big_match_win_rate": 0.37, "knockout_win_rate": 0.42}

# Goldman Sachs: count of players per national team among the top-50 scorers
# across Europe's elite leagues (PL, LaLiga, Bundesliga, Serie A, Ligue 1). Capped at 4.
TOP_LEAGUE_SCORER_COUNT: dict[str, int] = {
    "England": 4, "France": 4, "Brazil": 4, "Portugal": 4, "Argentina": 4,
    "Spain": 4, "Germany": 4, "Netherlands": 3, "Norway": 3, "Belgium": 2,
    "Croatia": 2, "Colombia": 2, "Uruguay": 2, "Morocco": 2, "Sweden": 1,
    "Austria": 1, "Senegal": 1, "Ivory Coast": 1, "Switzerland": 1, "Mexico": 1,
    "Japan": 1, "Ecuador": 1, "United States": 1, "Turkiye": 1,
    # All remaining teams: 0 players in the top 50
}


def _apply_pressure_calibration(
    goals_a: float, goals_b: float,
    team_a: str, team_b: str,
    pressure_features: dict,
    penalty_a: float | None, penalty_b: float | None,
    big_match_a: float | None, big_match_b: float | None,
    knockout_a: float | None, knockout_b: float | None,
) -> tuple[float, float]:
    """Calibrator 8: Adjusts goals based on each team's penalty/big-match/knockout pressure records."""
    press_a = {**_PRESSURE_DEFAULTS, **pressure_features.get(team_a, {})}
    press_b = {**_PRESSURE_DEFAULTS, **pressure_features.get(team_b, {})}
    if penalty_a is not None:   press_a["penalty_win_rate"]   = penalty_a
    if penalty_b is not None:   press_b["penalty_win_rate"]   = penalty_b
    if big_match_a is not None: press_a["big_match_win_rate"] = big_match_a
    if big_match_b is not None: press_b["big_match_win_rate"] = big_match_b
    if knockout_a is not None:  press_a["knockout_win_rate"]  = knockout_a
    if knockout_b is not None:  press_b["knockout_win_rate"]  = knockout_b

    score_a = sum(press_a[k] for k in _PRESSURE_DEFAULTS) / 3
    score_b = sum(press_b[k] for k in _PRESSURE_DEFAULTS) / 3
    pressure_boost = math.tanh((score_a - score_b) * 3) * 0.05
    return goals_a * (1 + pressure_boost), goals_b * (1 - pressure_boost)


def _apply_macro_calibration(
    goals_a: float, goals_b: float,
    team_a: str, team_b: str,
    macro_features: dict,
) -> tuple[float, float]:
    """Calibrator 9: Adjusts goals based on GDP per capita + population, weighted by football culture index."""
    macro_a = macro_features.get(team_a, {})
    macro_b = macro_features.get(team_b, {})
    gdp_a = math.log10(max(1.0, macro_a.get("gdp_per_capita_ppp", 15000.0)))
    gdp_b = math.log10(max(1.0, macro_b.get("gdp_per_capita_ppp", 15000.0)))
    pop_a = math.log10(max(1.0, macro_a.get("population", 20_000_000.0)))
    pop_b = math.log10(max(1.0, macro_b.get("population", 20_000_000.0)))
    cult_a = FOOTBALL_CULTURAL_IMPORTANCE.get(team_a, 0.75)
    cult_b = FOOTBALL_CULTURAL_IMPORTANCE.get(team_b, 0.75)

    macro_score_a = (0.7 * gdp_a + 0.3 * pop_a) * cult_a
    macro_score_b = (0.7 * gdp_b + 0.3 * pop_b) * cult_b
    macro_boost = math.tanh((macro_score_a - macro_score_b) * 0.8) * 0.03
    return goals_a * (1 + macro_boost), goals_b * (1 - macro_boost)


def _apply_mentality_calibration(
    goals_a: float, goals_b: float,
    team_a: str, team_b: str, stage: str,
) -> tuple[float, float]:
    """Calibrator 10: Defending-champion -5% penalty in knockouts; debutant +5% surprise boost in groups."""
    DEFENDING_CHAMPION = "Argentina"
    is_knockout = stage != "group"

    if is_knockout and team_a == DEFENDING_CHAMPION:
        goals_a *= 0.95
    elif is_knockout and team_b == DEFENDING_CHAMPION:
        goals_b *= 0.95

    if not is_knockout:
        appear_a = TEAM_PEDIGREE.get(team_a, (0, 0, 1))[2]
        appear_b = TEAM_PEDIGREE.get(team_b, (0, 0, 1))[2]
        if appear_a <= 2: goals_a *= 1.05
        if appear_b <= 2: goals_b *= 1.05

    return goals_a, goals_b


def _apply_host_advantage(
    goals_a: float, goals_b: float, team_a: str, team_b: str,
) -> tuple[float, float]:
    """Calibrator 11: Home-nation advantage for the 2026 host countries (+7% goals)."""
    HOSTS = {"United States", "Mexico", "Canada"}
    if team_a in HOSTS and team_b not in HOSTS:
        goals_a *= 1.07
    elif team_b in HOSTS and team_a not in HOSTS:
        goals_b *= 1.07
    return goals_a, goals_b


def _apply_heat_fatigue(
    goals_a: float, goals_b: float, team_a: str, team_b: str,
) -> tuple[float, float]:
    """Calibrator 12: -4% penalty for cold-climate teams playing in high-heat venues (>28C in June)."""
    city_map = {"Mexico": "Mexico City", "Canada": "Toronto", "United States": "Dallas"}
    city = city_map.get(team_a) or city_map.get(team_b, "neutral")
    venue_temp = VENUE_TEMPERATURE_JUNE_2026.get(city, 22.0)

    if venue_temp > 28.0:
        compat_a = CLIMATE_TRAVEL.get(team_a, (8000.0, 0.65))[1]
        compat_b = CLIMATE_TRAVEL.get(team_b, (8000.0, 0.65))[1]
        if compat_a <= 0.65: goals_a *= 0.96
        if compat_b <= 0.65: goals_b *= 0.96

    return goals_a, goals_b, venue_temp


def _apply_squad_age_calibration(
    goals_a: float, goals_b: float,
    team_a: str, team_b: str, stage: str, venue_temp: float,
) -> tuple[float, float]:
    """Calibrator 13: Young squads (<25y avg) -2% in knockouts; veteran squads (>28y avg) -2% in heat."""
    age_a = SQUAD_EXPERIENCE.get(team_a, (26.5, 25.0))[0]
    age_b = SQUAD_EXPERIENCE.get(team_b, (26.5, 25.0))[0]
    is_knockout = stage != "group"

    if is_knockout:
        if age_a < 25.0: goals_a *= 0.98
        if age_b < 25.0: goals_b *= 0.98

    if venue_temp > 28.0:
        if age_a > 28.0: goals_a *= 0.98
        if age_b > 28.0: goals_b *= 0.98

    return goals_a, goals_b


def _apply_top_league_scorer_boost(
    goals_a: float, goals_b: float, team_a: str, team_b: str,
) -> tuple[float, float]:
    """Calibrator 14 (Goldman Sachs): Elite attacking talent based on count of top-50 EU league scorers.
    Each qualifying player contributes ~+1.5% to expected goals. Cap = 4 players = max +6%.
    """
    scorers_a = min(TOP_LEAGUE_SCORER_COUNT.get(team_a, 0), 4)
    scorers_b = min(TOP_LEAGUE_SCORER_COUNT.get(team_b, 0), 4)
    boost_a = scorers_a * 0.015
    boost_b = scorers_b * 0.015
    return goals_a * (1 + boost_a), goals_b * (1 + boost_b)


def calibrate_goals(
    goals_a: float, goals_b: float,
    team_a: str, team_b: str, stage: str,
    pressure_features: dict, macro_features: dict,
    penalty_a_override: float | None = None, penalty_b_override: float | None = None,
    big_match_a_override: float | None = None, big_match_b_override: float | None = None,
    knockout_a_override: float | None = None, knockout_b_override: float | None = None,
    use_goldman: bool = True, use_klement: bool = True,
) -> tuple[float, float]:
    """Orchestrator: applies all post-processing calibrators sequentially."""
    goals_a, goals_b = _apply_pressure_calibration(
        goals_a, goals_b, team_a, team_b, pressure_features,
        penalty_a_override, penalty_b_override,
        big_match_a_override, big_match_b_override,
        knockout_a_override, knockout_b_override,
    )
    if use_klement:
        goals_a, goals_b = _apply_macro_calibration(goals_a, goals_b, team_a, team_b, macro_features)
    goals_a, goals_b = _apply_mentality_calibration(goals_a, goals_b, team_a, team_b, stage)
    goals_a, goals_b = _apply_host_advantage(goals_a, goals_b, team_a, team_b)
    goals_a, goals_b, venue_temp = _apply_heat_fatigue(goals_a, goals_b, team_a, team_b)
    goals_a, goals_b = _apply_squad_age_calibration(goals_a, goals_b, team_a, team_b, stage, venue_temp)
    if use_goldman:
        goals_a, goals_b = _apply_top_league_scorer_boost(goals_a, goals_b, team_a, team_b)
    return goals_a, goals_b
