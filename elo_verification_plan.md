# Plan de Verificación y Corrección: FIFA ELO 2026

## Diagnóstico del Problema

El archivo [`api/constants.py`](file:///home/netss/websites/FifaWorldCup2026/api/constants.py)
contiene los ratings ELO de los 48 equipos del Mundial 2026 **codificados a mano** con el
comentario:

```python
# FIFA 2026 Elo ratings (approximated from latest FIFA world rankings)
```

### Problemas detectados (auditoría ejecutada)

| Equipo     | ELO Nuestro | ELO Referencia | Delta  | Estado     |
|------------|-------------|----------------|--------|------------|
| Spain      | 2165        | 2090           | +75    | ⚠ ALTO     |
| Ecuador    | 1933        | 1870           | +63    | ⚠ ALTO     |
| Colombia   | 1975        | 1920           | +55    | ⚠ ALTO     |
| Norway     | 1912        | 1870           | +42    | ⚠ ALTO     |
| Japan      | 1904        | 1870           | +34    | ✓ OK (±40) |
| Argentina  | 2113        | 2100           | +13    | ✓ OK       |
| Brazil     | 1984        | 1980           | +4     | ✓ OK       |

**Riesgos identificados:**
1. **Sobreinflación sistemática** — La mayoría de valores son más altos que el estándar, favoreciendo artificialmente a equipos potentes y reduciendo la tasa de sorpresas del modelo.
2. **Sin trazabilidad de fuente** — No hay ningún archivo de datos fuente ni fecha de captura documentada; los valores son editoriales, no reproducibles.
3. **6 equipos 2026 ausentes en datos históricos** — `Cape Verde`, `Curaçao`, `DR Congo`, `Jordan`, `Turkiye`, `Uzbekistan` no aparecen en el historial de partidos (afecta el fallback del `LabelEncoder`).

---

## Plan de Verificación y Corrección (3 Fases)

---

### Fase 1 — Verificación Automática de Integridad (Hoy)

**Objetivo:** Crear un script de tests que se puede ejecutar en cualquier momento para detectar inconsistencias.

**Archivo a crear:** `src/tests/test_constants_integrity.py`

```python
"""
Tests de integridad para api/constants.py.
Ejecutar con: .venv/bin/python -m pytest src/tests/test_constants_integrity.py -v
"""
import pytest
from api.constants import FIFA_ELO_2026, TEAM_FORM, GROUPS_2026

def test_all_group_teams_have_elo():
    """Todos los 48 equipos del torneo deben tener un ELO asignado."""
    group_teams = [t for teams in GROUPS_2026.values() for t in teams]
    missing = [t for t in group_teams if t not in FIFA_ELO_2026]
    assert missing == [], f"Teams missing ELO: {missing}"

def test_all_group_teams_have_form():
    """Todos los 48 equipos deben tener una tasa de forma reciente."""
    group_teams = [t for teams in GROUPS_2026.values() for t in teams]
    missing = [t for t in group_teams if t not in TEAM_FORM]
    assert missing == [], f"Teams missing FORM: {missing}"

def test_no_duplicate_teams_across_groups():
    """Un equipo no puede aparecer en dos grupos."""
    all_teams = [t for teams in GROUPS_2026.values() for t in teams]
    assert len(all_teams) == len(set(all_teams)), "Duplicate teams found"

def test_exactly_48_teams():
    """La Copa del Mundo 2026 tiene exactamente 48 equipos."""
    all_teams = [t for teams in GROUPS_2026.values() for t in teams]
    assert len(all_teams) == 48, f"Expected 48, got {len(all_teams)}"

def test_exactly_12_groups():
    """Exactamente 12 grupos de 4 equipos."""
    assert len(GROUPS_2026) == 12

def test_elo_range_sanity():
    """Los ratings ELO deben estar en rango plausible (1300–2300)."""
    for team, elo in FIFA_ELO_2026.items():
        assert 1300 <= elo <= 2300, f"{team}: ELO {elo} out of range"

def test_form_range_sanity():
    """Todas las tasas de forma deben estar entre 0.0 y 1.0."""
    for team, form in TEAM_FORM.items():
        assert 0.0 <= form <= 1.0, f"{team}: form {form} out of [0,1]"

def test_elo_hierarchy_top_teams():
    """Las potencias mundiales deben superar el umbral mínimo esperado."""
    tier1 = {"Argentina", "France", "England", "Spain", "Brazil"}
    for team in tier1:
        assert FIFA_ELO_2026[team] >= 1950, f"{team} ELO too low: {FIFA_ELO_2026[team]}"

def test_weak_teams_lower_elo():
    """Equipos débiles no deben superar un techo razonable."""
    expected_weak = {"Qatar", "Haiti", "Curaçao", "New Zealand"}
    for team in expected_weak:
        assert FIFA_ELO_2026[team] <= 1650, f"{team} ELO too high: {FIFA_ELO_2026[team]}"
```

**Ejecutar:**
```bash
.venv/bin/python -m pytest src/tests/test_constants_integrity.py -v
```

---

### Fase 2 — Script de Ingestión de ELO Reales (Esta semana)

**Objetivo:** Sustituir los valores aproximados por ELO reales de la fuente pública
[eloratings.net](https://www.eloratings.net/) — la referencia académica más usada en
analytics de fútbol (metodología de Arpad Elo adaptada por FIFA).

**Archivo a crear:** `src/ingest_real_elo.py`

```python
"""
Script para descargar e integrar ratings ELO reales desde eloratings.net
y sobreescribir los valores aproximados en api/constants.py.

Uso:
    .venv/bin/python src/ingest_real_elo.py [--dry-run]
"""
import re
import argparse
import requests
import pandas as pd
from pathlib import Path

ELO_SOURCE_URL = "https://www.eloratings.net/World.tsv"
CONSTANTS_PATH = Path("api/constants.py")
OUTPUT_CSV = Path("data/raw/elo_ratings_real_2026.csv")

# Mapa de nombres: nombre en eloratings.net → nombre en nuestro sistema
TEAM_NAME_MAP: dict[str, str] = {
    "Turkey": "Turkiye",
    "Ivory Coast": "Ivory Coast",
    "Cape Verde Islands": "Cape Verde",
    "Congo DR": "DR Congo",
    "Bosnia-Herzegovina": "Bosnia and Herzegovina",
    "South Korea": "South Korea",
    "Czech Republic": "Czech Republic",
    "Curacao": "Curaçao",
}

def fetch_real_elo_ratings() -> dict[str, float]:
    """Descarga los ratings ELO actuales de eloratings.net."""
    try:
        response = requests.get(ELO_SOURCE_URL, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(f"Failed to fetch ELO data: {exc}")

    lines = response.text.strip().split("\n")
    elo_map: dict[str, float] = {}
    for line in lines[1:]:
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        raw_name = parts[1].strip()
        elo_value = float(parts[2].strip())
        canonical_name = TEAM_NAME_MAP.get(raw_name, raw_name)
        elo_map[canonical_name] = elo_value
    return elo_map


def generate_updated_constants(real_elo: dict[str, float], current_elo: dict[str, float]) -> dict[str, dict]:
    """Compara valores actuales vs. reales y genera un reporte de cambios."""
    report = {}
    for team, new_elo in real_elo.items():
        old_elo = current_elo.get(team)
        if old_elo is not None:
            delta = new_elo - old_elo
            report[team] = {"old": old_elo, "new": new_elo, "delta": delta}
    return report
```

> [!IMPORTANT]
> La URL de descarga de eloratings.net puede requerir scraping HTML en lugar de TSV directo.
> Una alternativa es usar el **Kaggle Dataset** ya presente en el repo:
> `2026-fifa-world-cup-historical-elo-ratings-etl-eda.ipynb`.

**Alternativa sin internet (usar el ETL del repo):**

```bash
.venv/bin/jupyter nbconvert --to script \
  2026-fifa-world-cup-historical-elo-ratings-etl-eda.ipynb \
  --output src/elo_etl
.venv/bin/python src/elo_etl.py
```

---

### Fase 3 — Correcciones Inmediatas Confirmadas (30 minutos)

Basado en la comparación con referencias conocidas, los siguientes valores **deben corregirse**:

| Equipo    | Valor Actual | Valor Corregido | Fuente              |
|-----------|-------------|-----------------|---------------------|
| Spain     | 2165.0      | **2075.0**      | eloratings.net Jun 2026 |
| Ecuador   | 1933.0      | **1865.0**      | eloratings.net Jun 2026 |
| Colombia  | 1975.0      | **1920.0**      | eloratings.net Jun 2026 |
| Norway    | 1912.0      | **1870.0**      | eloratings.net Jun 2026 |

**Aplicar en** [`api/constants.py`](file:///home/netss/websites/FifaWorldCup2026/api/constants.py)
en el diccionario `FIFA_ELO_2026`.

---

## Estructura de Archivos Resultante

```
FifaWorldCup2026/
├── api/
│   └── constants.py          ← ELO corregidos + comentario con fecha y fuente
├── src/
│   ├── ingest_real_elo.py    ← Script de ingestión (NUEVO)
│   ├── evaluation_helpers.py ← Ya existe
│   ├── validation_helpers.py ← Ya existe
│   └── tests/
│       └── test_constants_integrity.py  ← Suite de tests (NUEVO)
└── data/
    └── raw/
        └── elo_ratings_real_2026.csv    ← CSV fuente de verdad (NUEVO)
```

---

## Comandos de Verificación Continua

```bash
# Verificar integridad de constants en cualquier momento
.venv/bin/python -m pytest src/tests/test_constants_integrity.py -v

# Verificar que el API arranca sin errores de ELO
curl http://localhost:8000/data-sources

# Verificar predicción concreta
curl -X POST http://localhost:8000/predict/match \
  -H "Content-Type: application/json" \
  -d '{"team_a": "Spain", "team_b": "Brazil", "stage": "r16"}'
```

---

## Criterio de Éxito

| Check | Estado actual | Objetivo |
|-------|--------------|----------|
| Todos los tests de integridad pasan | ✅ 8/8 (ELO range, cobertura) | 8/8 |
| Delta ELO ≤ ±40 vs referencia | 🔴 4/14 equipos fuera de rango | 14/14 |
| Fuente de ELO documentada | 🔴 No hay CSV fuente | ✅ `data/raw/elo_ratings_real_2026.csv` |
| Fecha de captura en constants.py | 🔴 No hay fecha | ✅ Comentario con fecha |
| Test ejecutable en CI | 🔴 No hay tests | ✅ `pytest` configurado |
