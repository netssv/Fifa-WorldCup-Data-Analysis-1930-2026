# FIFA 2026 Predictor - Tier 1 Fixes (Priority Implementation Guide)

**Estimated Time:** 2–3 hours  
**Expected Impact:** +5–10% improvement in metric validity

---

## Fix 1: Temporal Train/Val Split (30 minutes)

### CURRENT (WRONG):

**File:** `train.py` (lines 125–130)

```python
X_train, X_val, y_home_train, y_home_val, y_away_train, y_away_val = train_test_split(
    X, y_home, y_away, test_size=test_size, random_state=random_state
)
```

**Problem:** Random split mixes old and new data, causing data leakage

### FIXED:

```python
# Read year column from matches
df_matches_sorted = df_matches.sort_values('Year')
year_threshold = 2019  # Validate on 2019–2022

train_mask = df_matches_sorted['Year'] < year_threshold
val_mask = df_matches_sorted['Year'] >= year_threshold

X_train = X[train_mask]
X_val = X[val_mask]
y_home_train = y_home[train_mask]
y_home_val = y_home[val_mask]
y_away_train = y_away[train_mask]
y_away_val = y_away[val_mask]

print(f"Train set: {train_mask.sum()} matches (before {year_threshold})")
print(f"Val set: {val_mask.sum()} matches ({year_threshold}–2022)")
print(f"Train/Val ratio: {train_mask.sum() / val_mask.sum():.1f}:1")
```

### Validation:
```python
# Sanity check: no overlap
assert df_matches_sorted[train_mask]['Year'].max() < df_matches_sorted[val_mask]['Year'].min()
print("✓ Temporal split verified (no overlap)")
```

---

## Fix 2: Remove Target Leakage (15 minutes)

### CURRENT (WRONG):

**File:** `train.py` (line 98-99)

```python
feature_cols = [
    "elo_diff", "goal_diff_avg", ..., 
    "xg_efficiency_avg_home", "xg_efficiency_avg_away",  # ← DELETE
    "xg_consistency_home", "xg_consistency_away",          # ← DELETE
    ...
]
```

### FIXED:

```python
feature_cols = [
    "elo_diff", "goal_diff_avg", "home_form", "away_form", "h2h_wins", "is_knockout",
    "squad_value_ratio", "value_log_home", "value_log_away",
    "eafc_overall_diff", "eafc_physic_diff", "eafc_top5_avg_home",
    "venue_altitude_m", "is_high_altitude", "altitude_penalty",
    "titles_diff", "semis_diff", "appearances_diff",
    "avg_age_diff", "avg_caps_diff", "travel_dist_diff", "climate_compat_diff",
    "synergy_diff", "top5_ratio_diff", "goals_scored_diff", "clean_sheets_diff",
    "xg_for_avg_home", "xg_for_avg_away",
    "xg_against_avg_home", "xg_against_avg_away",
    "xg_diff_avg_home", "xg_diff_avg_away",
    "xg_overperform_avg_home", "xg_overperform_avg_away",
    # REMOVED: "xg_efficiency_avg_home", "xg_efficiency_avg_away",
    # REMOVED: "xg_consistency_home", "xg_consistency_away",
    "odds_implied_home_win", "odds_implied_away_win", "odds_implied_draw",
    "odds_market_confidence", "odds_margin",
    "coach_wc_editions", "coach_intl_win_rate", "coach_tournament_wins",
    "coach_experience_diff", "coach_knockout_edge",
    "fatigue_avg_club_matches_home", "fatigue_avg_club_matches_away",
    "fatigue_ucl_players_home", "fatigue_ucl_players_away",
    "fatigue_index_diff", "fatigue_days_since_last_match_diff"
]

print(f"Feature count: {len(feature_cols)} (removed 2 leakage features)")
assert len(feature_cols) == 52, f"Expected 52 features, got {len(feature_cols)}"
```

### In feature_builder.py (lines 84–85):

Also remove from feature construction:
```python
# REMOVE these two lines:
# "xg_efficiency_avg_home": xg_a.get("xg_efficiency_avg", 1.0),
# "xg_consistency_home": xg_a.get("xg_consistency", 0.5),
```

---

## Fix 3: Audit Odds Data Source (1 hour)

### ACTION:

**File:** `data/processed/odds_features_2026.csv` (examine first)

```python
import pandas as pd

df_odds = pd.read_csv("data/processed/odds_features_2026.csv")
print(df_odds.head())
print(df_odds.info())
```

### DOCUMENT:

Create file `data/odds_data_source.md`:

```markdown
# Odds Features Data Source

## File: odds_features_2026.csv

**Column Documentation:**
- `team_name`: International team name
- `implied_home_win_avg`: Average implied probability of home win
- `implied_away_win_avg`: Average implied probability of away win
- `implied_draw_avg`: Average implied probability of draw
- `market_confidence_avg`: Average market confidence (lower margin = higher confidence)
- `odds_margin_avg`: Average bookmaker margin

## Data Source & Timing:

**CRITICAL:** Document the following:
- [ ] Which bookmakers? (Pinnacle, Betfair, SBR aggregate?)
- [ ] When captured? (7 days pre-match, 24h, closing?)
- [ ] Historical odds only? (No live/in-play odds?)
- [ ] Turnover date? (Last updated when?)

## Validation:

- [ ] Do probabilities sum to ~1.0 + margin?
- [ ] Are favorites (lower odds) always home teams?
- [ ] Any obvious suspicious values?

## Usage in Model:

**CURRENT (RISKY):** Used in training features
**RECOMMENDED:** Use only for benchmarking, not training

```

### Then ADD TO train.py:

```python
# CAUTION: Odds features may contain post-kickoff information
# See data/odds_data_source.md for sourcing details

# Option A: RISKY — use in training (current)
# Option B: SAFE — exclude from training, use only in benchmarking
# Uncomment next line to exclude:
# feature_cols = [c for c in feature_cols if not c.startswith('odds_')]

use_odds_in_training = True  # SET TO False IF LEAKAGE SUSPECTED
if not use_odds_in_training:
    feature_cols = [c for c in feature_cols if not c.startswith('odds_')]
    print("[WARN] Odds features excluded from training to prevent leakage")
```

---

## Fix 4: Report Calibration Metrics (1 hour)

### CURRENT (WRONG):

**File:** `train.py` (lines 200–220)

Metrics are computed but not properly reported:

```python
print(f"  Model Brier score: {model_metrics['model_brier']:.4f}")
# This line exists but output format is incomplete
```

### FIXED:

Add this detailed reporting section:

```python
print("\n" + "="*70)
print("CALIBRATION & VALIDATION METRICS (20% Holdout Set)")
print("="*70)

# Model performance
model_brier = model_metrics.get('model_brier', None)
model_log_loss = model_metrics.get('model_log_loss', None)
model_ece = model_metrics.get('model_ece', None)

# Elo baseline
elo_brier = elo_metrics.get('elo_baseline_brier', None)
elo_log_loss = elo_metrics.get('elo_baseline_log_loss', None)
elo_ece = elo_metrics.get('elo_baseline_ece', None)

# Odds baseline (if available)
odds_brier = odds_metrics.get('odds_baseline_brier', None) if 'odds_metrics' in locals() else None

print("\n[ML Model Performance]")
print(f"  Brier Score:   {model_brier:.4f} {'✓ GOOD' if model_brier < 0.20 else '⚠ CHECK'}")
print(f"  Log Loss:      {model_log_loss:.4f} {'✓ GOOD' if model_log_loss < 0.60 else '⚠ CHECK'}")
print(f"  ECE:           {model_ece:.4f} {'✓ CALIBRATED' if model_ece < 0.10 else '⚠ POORLY CALIBRATED'}")

print("\n[ELO Baseline (Comparison)]")
print(f"  Brier Score:   {elo_brier:.4f} ({model_brier/elo_brier*100-100:+.1f}% vs model)")
print(f"  Log Loss:      {elo_log_loss:.4f}")
print(f"  ECE:           {elo_ece:.4f}")

if odds_brier:
    print("\n[Betting Odds Baseline (Comparison)]")
    print(f"  Brier Score:   {odds_brier:.4f} ({model_brier/odds_brier*100-100:+.1f}% vs model)")

print("\n[Interpretation]")
print(f"  Model beats ELO? {model_brier < elo_brier}")
print(f"  Model < 0.18 threshold? {model_brier < 0.18}")
print(f"  Model well-calibrated? {model_ece < 0.10}")

# Fail if metrics are worse than threshold
assert model_brier < 0.22, f"Brier score {model_brier} exceeds 0.22 threshold"
assert model_log_loss < 0.70, f"Log Loss {model_log_loss} exceeds 0.70 threshold"

print("\n✓ All metrics within acceptable ranges")
print("="*70)

# Save to JSON for API
metrics_export = {
    "model": {
        "brier": round(float(model_brier), 4),
        "log_loss": round(float(model_log_loss), 4),
        "ece": round(float(model_ece), 4),
    },
    "elo_baseline": {
        "brier": round(float(elo_brier), 4),
        "log_loss": round(float(elo_log_loss), 4),
        "ece": round(float(elo_ece), 4),
    },
}

with open("Predictions and Models Folder/calibration_metrics.json", "w") as f:
    json.dump(metrics_export, f, indent=2)
print(f"✓ Metrics saved to calibration_metrics.json")
```

### Then expose via API:

**File:** `api/main.py` (add new endpoint)

```python
@app.get("/model/calibration-metrics")
async def get_calibration_metrics():
    """Return model calibration metrics from validation set."""
    try:
        with open("Predictions and Models Folder/calibration_metrics.json", "r") as f:
            metrics = json.load(f)
        return {"calibration_metrics": metrics}
    except FileNotFoundError:
        return {"error": "Metrics not computed. Run train.py first."}
```

---

## Fix 5: Verify No Duplicate/Self Matches (30 minutes)

### NEW VALIDATION:

**File:** `train.py` (add near top of main)

```python
def validate_matches_data(df_matches: pd.DataFrame) -> None:
    """Validate matches dataset for integrity."""
    print("\n[Data Validation]")
    
    # Check for self-matches
    self_matches = df_matches[df_matches['HomeTeam'] == df_matches['AwayTeam']]
    assert len(self_matches) == 0, f"Found {len(self_matches)} self-matches (invalid)"
    print("✓ No self-matches")
    
    # Check for duplicates within same year
    duplicates = df_matches[df_matches.duplicated(
        subset=['HomeTeam', 'AwayTeam', 'Year'], keep=False
    )]
    if len(duplicates) > 0:
        print(f"⚠ Found {len(duplicates)} potential duplicates:")
        print(duplicates[['HomeTeam', 'AwayTeam', 'Year', 'HomeGoals', 'AwayGoals']])
    
    # Check temporal order
    years = df_matches['Year'].unique()
    print(f"✓ Year range: {years.min()}–{years.max()} ({len(years)} tournaments)")
    
    # Check for negative goals (shouldn't exist)
    negative_goals = df_matches[(df_matches['HomeGoals'] < 0) | (df_matches['AwayGoals'] < 0)]
    assert len(negative_goals) == 0, f"Found {len(negative_goals)} matches with negative goals"
    print("✓ No negative goal values")
    
    # Check goal distribution
    print(f"✓ Goal distribution:")
    print(f"  Home goals: μ={df_matches['HomeGoals'].mean():.2f}, σ={df_matches['HomeGoals'].std():.2f}")
    print(f"  Away goals: μ={df_matches['AwayGoals'].mean():.2f}, σ={df_matches['AwayGoals'].std():.2f}")

# Call in train_models():
validate_matches_data(df_matches)
```

---

## Implementation Checklist

- [ ] **Fix 1:** Temporal split (`train.py` lines 125–130)
- [ ] **Fix 2:** Remove xG efficiency features (`train.py` + `feature_builder.py`)
- [ ] **Fix 3:** Document odds source (`data/odds_data_source.md`)
- [ ] **Fix 4:** Report metrics (`train.py` + `api/main.py`)
- [ ] **Fix 5:** Validate data (`train.py` validation)

---

## Testing After Fixes

### 1. Retrain models:
```bash
python train.py
```

### 2. Check output:
- Metrics should be printed clearly
- Should see temporal split confirmation
- Should see feature count = 52 (not 54)

### 3. Verify API:
```bash
curl http://localhost:8000/model/calibration-metrics
```

### 4. Run predictions:
```bash
# Predictions should use 52 features (not 54)
```

---

## Expected Impact

After these Tier 1 fixes:

| Metric | Before | After | Reason |
|--------|--------|-------|--------|
| Brier Score | ~0.18–0.20 | ~0.20–0.22 | More realistic (no leakage) |
| ECE | ~0.08 | ~0.10–0.12 | Likely worse calibrated |
| Confidence | Unknown | Clear | Metrics now reported |
| Data Trust | Low | High | Temporal split correct |

**Note:** Metrics may appear to worsen (higher Brier, worse ECE) because they're now **honest** rather than inflated by leakage. This is good!

---

**Next:** After Tier 1 complete, proceed to Tier 2 fixes (hyperparameter tuning, calibration learning)
