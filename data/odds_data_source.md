# Odds Features Data Source

## File: data/processed/odds_features_2026.csv

**Column Documentation:**
- `team_name`: International team name
- `implied_home_win_avg`: Average implied probability of home win
- `implied_away_win_avg`: Average implied probability of away win
- `implied_draw_avg`: Average implied probability of draw
- `market_confidence_avg`: Average market confidence (lower margin = higher confidence)
- `odds_margin_avg`: Average bookmaker margin

## Data Source & Timing

**Critical questions to answer:**
- Which bookmakers were aggregated? (e.g. Pinnacle, Betfair, SBR, other)
- When were the odds captured? (7 days pre-match, 24h pre-match, closing odds?)
- Are these historical pre-match odds only? No live/in-play values?
- When was the file last updated?

## Validation Checklist

- [ ] Do implied probabilities sum to ~1.0 + margin?
- [ ] Are favorites (lower odds) consistently assigned to stronger teams?
- [ ] Are there suspicious values or zeros in the odds columns?

## Usage Recommendation

- Current training uses these features in the model.
- If there is any doubt about leakage, exclude them from training and use for benchmarking only.
- In `train.py`, set `use_odds_in_training = False` to remove odds features from the training set.
