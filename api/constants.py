# FIFA 2026 ELO ratings (approx. from latest FIFA world rankings)
# Scale: top teams ~1900+, weakest ~1200

FIFA_ELO_2026: dict[str, float] = {
    # Group A
    "Mexico":           1700.0,
    "South Africa":     1380.0,
    "South Korea":      1580.0,
    "Czech Republic":   1560.0,
    # Group B
    "Canada":           1560.0,
    "Bosnia and Herzegovina": 1430.0,
    "Qatar":            1310.0,
    "Switzerland":      1720.0,
    # Group C
    "Brazil":           1940.0,
    "Morocco":          1700.0,
    "Haiti":            1200.0,
    "Scotland":         1560.0,
    # Group D
    "United States":    1640.0,
    "Paraguay":         1470.0,
    "Australia":        1540.0,
    "Turkiye":          1600.0,
    # Group E
    "Germany":          1870.0,
    "Curaçao":          1250.0,
    "Ivory Coast":      1490.0,
    "Ecuador":          1560.0,
    # Group F
    "Netherlands":      1860.0,
    "Japan":            1680.0,
    "Sweden":           1660.0,
    "Tunisia":          1490.0,
    # Group G
    "Belgium":          1820.0,
    "Egypt":            1530.0,
    "Iran":             1580.0,
    "New Zealand":      1380.0,
    # Group H
    "Spain":            1950.0,
    "Cape Verde":       1370.0,
    "Saudi Arabia":     1490.0,
    "Uruguay":          1720.0,
    # Group I
    "France":           1960.0,
    "Senegal":          1660.0,
    "Iraq":             1390.0,
    "Norway":           1640.0,
    # Group J
    "Argentina":        1980.0,
    "Algeria":          1550.0,
    "Austria":          1620.0,
    "Jordan":           1360.0,
    # Group K
    "Portugal":         1910.0,
    "DR Congo":         1440.0,
    "Uzbekistan":       1380.0,
    "Colombia":         1700.0,
    # Group L
    "England":          1900.0,
    "Croatia":          1750.0,
    "Ghana":            1470.0,
    "Panama":           1390.0,
}

# Historical H2H wins (simplified recent record — last 10 meetings)
H2H_WINS: dict[tuple[str, str], int] = {
    ("Brazil", "Argentina"): 3,
    ("Argentina", "Brazil"): 4,
    ("France", "Germany"): 5,
    ("Germany", "France"): 3,
    ("Spain", "England"): 4,
    ("England", "Spain"): 3,
    ("Brazil", "Germany"): 5,
    ("Germany", "Brazil"): 2,
}

# Recent form score 0–1 (wins in last 10 games / 10)
TEAM_FORM: dict[str, float] = {
    "Argentina": 0.90,
    "France":    0.85,
    "Brazil":    0.80,
    "Spain":     0.80,
    "England":   0.75,
    "Portugal":  0.78,
    "Germany":   0.72,
    "Netherlands": 0.70,
    "Belgium":   0.68,
    "Morocco":   0.72,
    "Colombia":  0.68,
    "Uruguay":   0.65,
    "Japan":     0.62,
    "Croatia":   0.60,
    "Mexico":    0.58,
    "United States": 0.60,
    "Sweden":    0.62,
    "Norway":    0.58,
    "Senegal":   0.60,
    "South Korea": 0.55,
    "Turkiye":   0.55,
    "Austria":   0.55,
    "Ecuador":   0.52,
    "Australia": 0.50,
    "Algeria":   0.50,
    "Iran":      0.48,
    "Canada":    0.50,
    "Switzerland": 0.60,
    "Czech Republic": 0.50,
    "Egypt":     0.48,
    "Ghana":     0.45,
    "Ivory Coast": 0.50,
    "Tunisia":   0.45,
    "Saudi Arabia": 0.45,
    "Paraguay":  0.42,
    "Bolivia":   0.38,
    "DR Congo":  0.42,
    "Scotland":  0.45,
    "Panama":    0.40,
    "Cape Verde": 0.42,
    "Jordan":    0.38,
    "South Africa": 0.40,
    "New Zealand": 0.35,
    "Iraq":      0.38,
    "Qatar":     0.30,
    "Haiti":     0.28,
    "Curaçao":   0.28,
    "Uzbekistan": 0.35,
    "Bosnia and Herzegovina": 0.45,
}

# Stage multipliers — knockout pressure effect
STAGE_MULTIPLIER: dict[str, float] = {
    "group": 1.0,
    "r32":   1.05,
    "r16":   1.10,
    "r8":    1.15,
    "semi":  1.20,
    "final": 1.25,
}

GROUPS_2026: dict[str, list[str]] = {
    "Group A": ["Mexico", "South Africa", "South Korea", "Czech Republic"],
    "Group B": ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
    "Group C": ["Brazil", "Morocco", "Haiti", "Scotland"],
    "Group D": ["United States", "Paraguay", "Australia", "Turkiye"],
    "Group E": ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
    "Group F": ["Netherlands", "Japan", "Sweden", "Tunisia"],
    "Group G": ["Belgium", "Egypt", "Iran", "New Zealand"],
    "Group H": ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
    "Group I": ["France", "Senegal", "Iraq", "Norway"],
    "Group J": ["Argentina", "Algeria", "Austria", "Jordan"],
    "Group K": ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
    "Group L": ["England", "Croatia", "Ghana", "Panama"],
}
