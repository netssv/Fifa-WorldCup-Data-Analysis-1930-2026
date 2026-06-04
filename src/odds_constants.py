from pathlib import Path

# Paths
RAW_ODDS_PATH = Path("data/raw/match_odds_2026.json")
PROCESSED_ODDS_PATH = Path("data/processed/odds_features_2026.csv")

# The Odds API configuration
ODDS_API_BASE = "https://api.the-odds-api.com"
SPORT_KEY = "soccer_fifa_world_cup"
DEFAULT_REGIONS = "eu"
DEFAULT_MARKETS = "h2h"

# Sentinel for missing odds
MISSING_ODDS = {
    "implied_prob_home": 0.333,
    "implied_prob_draw": 0.333,
    "implied_prob_away": 0.334,
    "market_confidence": 0.5,
    "books_count": 0,
    "odds_margin": 0.05,
}

# Qualified/participating team list
TOURNAMENT_TEAMS = [
    "Brazil", "Argentina", "France", "England", "Spain", "Germany",
    "Portugal", "Netherlands", "Belgium", "Croatia", "Uruguay", "Denmark",
    "Switzerland", "Mexico", "United States", "Canada", "Japan", "South Korea",
    "Morocco", "Senegal", "Australia", "Poland", "Serbia", "Ecuador",
    "Colombia", "Chile", "Peru", "Venezuela", "Ghana", "Cameroon",
    "Nigeria", "Egypt", "Algeria", "Saudi Arabia", "Iran", "Qatar",
    "Wales", "Scotland", "Turkey", "Czech Republic", "Austria", "Hungary",
    "Sweden", "Norway", "Ukraine", "Romania", "Slovakia", "Slovenia",
]
