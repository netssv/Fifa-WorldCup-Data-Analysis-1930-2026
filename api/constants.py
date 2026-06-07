# FIFA 2026 Elo ratings (approximated from latest FIFA world rankings)
# Scale: top teams ~1900+, weakest ~1200

FIFA_ELO_2026: dict[str, float] = {
    # Group A
    "Mexico":           1860.0,
    "South Africa":     1524.0,
    "South Korea":      1752.0,
    "Czech Republic":   1726.0,
    # Group B
    "Canada":           1784.0,
    "Bosnia and Herzegovina": 1594.0,
    "Qatar":            1425.0,
    "Switzerland":      1889.0,
    # Group C
    "Brazil":           1984.0,
    "Morocco":          1822.0,
    "Haiti":            1532.0,
    "Scotland":         1767.0,
    # Group D
    "United States":    1721.0,
    "Paraguay":         1833.0,
    "Australia":        1783.0,
    "Turkiye":          1902.0,
    # Group E
    "Germany":          1923.0,
    "Curaçao":          1436.0,
    "Ivory Coast":      1676.0,
    "Ecuador":          1933.0,
    # Group F
    "Netherlands":      1961.0,
    "Japan":            1904.0,
    "Sweden":           1719.0,
    "Tunisia":          1636.0,
    # Group G
    "Belgium":          1867.0,
    "Egypt":            1689.0,
    "Iran":             1760.0,
    "New Zealand":      1585.0,
    # Group H
    "Spain":            2165.0,
    "Cape Verde":       1549.0,
    "Saudi Arabia":     1568.0,
    "Uruguay":          1892.0,
    # Group I
    "France":           2081.0,
    "Senegal":          1878.0,
    "Iraq":             1607.0,
    "Norway":           1912.0,
    # Group J
    "Argentina":        2113.0,
    "Algeria":          1743.0,
    "Austria":          1827.0,
    "Jordan":           1690.0,
    # Group K
    "Portugal":         1984.0,
    "DR Congo":         1655.0,
    "Uzbekistan":       1727.0,
    "Colombia":         1975.0,
    # Group L
    "England":          2020.0,
    "Croatia":          1930.0,
    "Ghana":            1503.0,
    "Panama":           1737.0,
}

# Historical head-to-head wins (simplified recent record — last 10 meetings)
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

# Recent form score 0-1 (win rate in last 10 official matches)
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

# Stage goal multipliers — knockout pressure amplifies expected goal volume
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

# Football Cultural Importance Score per nation (0.0 to 1.0).
# Reflects passion, grassroots depth, and historical significance of football in the country.
FOOTBALL_CULTURAL_IMPORTANCE: dict[str, float] = {
    "Argentina": 1.0, "Brazil": 1.0, "Uruguay": 1.0, "England": 0.98, "Spain": 0.98,
    "Germany": 0.95, "France": 0.92, "Portugal": 0.95, "Netherlands": 0.92,
    "Croatia": 0.90, "Morocco": 0.95, "Senegal": 0.90, "Mexico": 0.95, "Colombia": 0.92,
    "Ecuador": 0.88, "Turkiye": 0.95, "Sweden": 0.82, "Norway": 0.80, "Austria": 0.80,
    "Switzerland": 0.82, "Czech Republic": 0.82, "Belgium": 0.85, "Japan": 0.75,
    "South Korea": 0.78, "Saudi Arabia": 0.85, "Egypt": 0.92, "Algeria": 0.92,
    "Tunisia": 0.88, "Ivory Coast": 0.88, "Ghana": 0.88, "DR Congo": 0.85,
    "South Africa": 0.65, "Australia": 0.55, "United States": 0.45, "Canada": 0.45,
    "Haiti": 0.75, "Panama": 0.70, "Paraguay": 0.85, "Bosnia and Herzegovina": 0.85,
    "Qatar": 0.50, "Iraq": 0.85, "New Zealand": 0.40, "Cape Verde": 0.75,
    "Uzbekistan": 0.75, "Jordan": 0.75, "Curaçao": 0.70, "Scotland": 0.92, "Iran": 0.85
}

# Average June temperatures (°C) in the World Cup 2026 host cities/venues
VENUE_TEMPERATURE_JUNE_2026: dict[str, float] = {
    "Mexico City": 22.0,
    "Guadalajara": 30.0,
    "Monterrey": 35.0,
    "Kansas City": 29.0,
    "Dallas": 34.0,
    "Houston": 33.0,
    "Los Angeles": 23.0,
    "San Francisco": 19.0,
    "Seattle": 21.0,
    "New York": 26.0,
    "Miami": 31.0,
    "Philadelphia": 27.0,
    "Boston": 24.0,
    "Atlanta": 30.0,
    "Toronto": 22.0,
    "Vancouver": 18.0,
    "neutral": 22.0
}

