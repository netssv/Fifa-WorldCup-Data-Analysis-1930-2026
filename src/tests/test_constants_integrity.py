"""
test_constants_integrity.py
---------------------------
Suite de tests para verificar la integridad de los datos en api/constants.py.
Ejecutar con: .venv/bin/python -m pytest src/tests/ -v

Cubre:
  - Cobertura de ELO y FORM para los 48 equipos del torneo
  - Sin equipos duplicados entre grupos
  - Rangos numéricos válidos (ELO 1300-2300, FORM 0-1)
  - Jerarquía mínima esperada (top vs. débiles)
  - Coherencia interna GROUPS / ELO / FORM
"""
import pytest
import sys
import os

# Asegurar que el módulo api sea importable desde la raíz del proyecto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from api.constants import FIFA_ELO_2026, TEAM_FORM, GROUPS_2026, STAGE_MULTIPLIER


# ── Fixtures ───────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def all_group_teams() -> list[str]:
    return [team for teams in GROUPS_2026.values() for team in teams]


# ── Cobertura (48 equipos deben aparecer en todos los diccionarios) ────────────

def test_all_group_teams_have_elo(all_group_teams):
    """Todos los 48 equipos del torneo deben tener un ELO asignado."""
    missing = [t for t in all_group_teams if t not in FIFA_ELO_2026]
    assert missing == [], f"Equipos sin ELO: {missing}"


def test_all_group_teams_have_form(all_group_teams):
    """Todos los 48 equipos deben tener tasa de forma reciente."""
    missing = [t for t in all_group_teams if t not in TEAM_FORM]
    assert missing == [], f"Equipos sin FORM: {missing}"


# ── Estructura del torneo ──────────────────────────────────────────────────────

def test_exactly_48_teams(all_group_teams):
    """La Copa del Mundo 2026 debe tener exactamente 48 equipos."""
    assert len(all_group_teams) == 48, f"Se esperaban 48, hay {len(all_group_teams)}"


def test_exactly_12_groups():
    """Deben existir exactamente 12 grupos."""
    assert len(GROUPS_2026) == 12, f"Se esperaban 12 grupos, hay {len(GROUPS_2026)}"


def test_each_group_has_4_teams():
    """Cada grupo debe tener exactamente 4 equipos."""
    for group, teams in GROUPS_2026.items():
        assert len(teams) == 4, f"Grupo {group} tiene {len(teams)} equipos (esperados 4)"


def test_no_duplicate_teams_across_groups(all_group_teams):
    """Ningún equipo puede aparecer en más de un grupo."""
    seen = set()
    duplicates = []
    for team in all_group_teams:
        if team in seen:
            duplicates.append(team)
        seen.add(team)
    assert duplicates == [], f"Equipos duplicados entre grupos: {duplicates}"


# ── Rangos numéricos válidos ───────────────────────────────────────────────────

def test_elo_range_sanity():
    """Los ratings ELO deben estar en rango plausible (1300–2300)."""
    out_of_range = {
        team: elo for team, elo in FIFA_ELO_2026.items()
        if not (1300 <= elo <= 2300)
    }
    assert out_of_range == {}, f"ELO fuera de rango [1300,2300]: {out_of_range}"


def test_form_range_sanity():
    """Las tasas de forma deben estar en el intervalo [0.0, 1.0]."""
    out_of_range = {
        team: form for team, form in TEAM_FORM.items()
        if not (0.0 <= form <= 1.0)
    }
    assert out_of_range == {}, f"FORM fuera de rango [0,1]: {out_of_range}"


# ── Jerarquía mínima esperada ──────────────────────────────────────────────────

def test_elo_top_teams_above_threshold():
    """Las potencias mundiales deben superar 1950 ELO."""
    top_teams = {"Argentina", "France", "England", "Spain", "Brazil"}
    below_threshold = {
        team: FIFA_ELO_2026[team] for team in top_teams
        if FIFA_ELO_2026.get(team, 0) < 1950
    }
    assert below_threshold == {}, f"Top teams with ELO too low: {below_threshold}"


def test_elo_weak_teams_below_ceiling():
    """Equipos débiles conocidos no deben superar 1650 ELO."""
    known_weak = {"Qatar", "Haiti", "Curaçao", "New Zealand"}
    above_ceiling = {
        team: FIFA_ELO_2026[team] for team in known_weak
        if FIFA_ELO_2026.get(team, 9999) > 1650
    }
    assert above_ceiling == {}, f"Weak teams with ELO too high: {above_ceiling}"


def test_elo_spread_is_reasonable():
    """El rango total ELO (max-min) debe ser razonable (600–1100 puntos)."""
    elos = list(FIFA_ELO_2026.values())
    spread = max(elos) - min(elos)
    assert 600 <= spread <= 1100, f"ELO spread {spread:.0f} fuera del rango esperado [600, 1100]"


# ── Stage multipliers ──────────────────────────────────────────────────────────

def test_stage_multipliers_increase_monotonically():
    """Los multiplicadores de stage deben aumentar de grupo a final."""
    order = ["group", "r32", "r16", "r8", "semi", "final"]
    for i in range(len(order) - 1):
        assert STAGE_MULTIPLIER[order[i]] <= STAGE_MULTIPLIER[order[i + 1]], (
            f"Stage multiplier no es monótono entre {order[i]} y {order[i+1]}"
        )


def test_stage_multipliers_all_positive():
    """Todos los multiplicadores de stage deben ser positivos."""
    for stage, mult in STAGE_MULTIPLIER.items():
        assert mult > 0, f"Stage {stage!r} tiene multiplicador {mult} (esperado > 0)"


def test_group_stage_multiplier_is_baseline():
    """El multiplicador de la fase de grupos debe ser 1.0 (referencia)."""
    assert STAGE_MULTIPLIER.get("group") == 1.0, "El multiplicador de 'group' debe ser 1.0"
