import urllib.request
import json
import csv
import os

TEAMS = [
    "Mexico", "South Africa", "South Korea", "Czech Republic", "Canada",
    "Bosnia and Herzegovina", "Qatar", "Switzerland", "Brazil", "Morocco",
    "Haiti", "Scotland", "United States", "Paraguay", "Australia", "Turkiye",
    "Germany", "Curaçao", "Ivory Coast", "Ecuador", "Netherlands", "Japan",
    "Sweden", "Tunisia", "Belgium", "Egypt", "Iran", "New Zealand", "Spain",
    "Cape Verde", "Saudi Arabia", "Uruguay", "France", "Senegal", "Iraq",
    "Norway", "Argentina", "Algeria", "Austria", "Jordan", "Portugal",
    "DR Congo", "Uzbekistan", "Colombia", "England", "Croatia", "Ghana", "Panama"
]

# Mapping to World Bank country codes/names
# World Bank API allows getting by 3-letter ISO code
ISO_MAPPING = {
    "Mexico": "MEX", "South Africa": "ZAF", "South Korea": "KOR", "Czech Republic": "CZE", "Canada": "CAN",
    "Bosnia and Herzegovina": "BIH", "Qatar": "QAT", "Switzerland": "CHE", "Brazil": "BRA", "Morocco": "MAR",
    "Haiti": "HTI", "Scotland": "GBR", "United States": "USA", "Paraguay": "PRY", "Australia": "AUS", "Turkiye": "TUR",
    "Germany": "DEU", "Curaçao": "CUW", "Ivory Coast": "CIV", "Ecuador": "ECU", "Netherlands": "NLD", "Japan": "JPN",
    "Sweden": "SWE", "Tunisia": "TUN", "Belgium": "BEL", "Egypt": "EGY", "Iran": "IRN", "New Zealand": "NZL", "Spain": "ESP",
    "Cape Verde": "CPV", "Saudi Arabia": "SAU", "Uruguay": "URY", "France": "FRA", "Senegal": "SEN", "Iraq": "IRQ",
    "Norway": "NOR", "Argentina": "ARG", "Algeria": "DZA", "Austria": "AUT", "Jordan": "JOR", "Portugal": "PRT",
    "DR Congo": "COD", "Uzbekistan": "UZB", "Colombia": "COL", "England": "GBR", "Croatia": "HRV", "Ghana": "GHA", "Panama": "PAN"
}

def fetch_indicator(indicator_code, year=2023):
    url = f"http://api.worldbank.org/v2/country/all/indicator/{indicator_code}?format=json&date={year}&per_page=300"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if len(data) > 1:
                return {row['countryiso3code']: row['value'] for row in data[1] if row['countryiso3code']}
    except Exception as e:
        print(f"Error fetching {indicator_code}: {e}")
    return {}

def main():
    print("Fetching GDP per capita (PPP)...")
    gdp_data = fetch_indicator("NY.GDP.PCAP.PP.CD", 2023)
    
    print("Fetching Population...")
    pop_data = fetch_indicator("SP.POP.TOTL", 2023)
    
    os.makedirs("data/raw", exist_ok=True)
    out_path = "data/raw/macroeconomics.csv"
    
    with open(out_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["team_name", "gdp_per_capita_ppp", "population"])
        
        for team in TEAMS:
            iso = ISO_MAPPING.get(team)
            gdp = gdp_data.get(iso)
            pop = pop_data.get(iso)
            
            # Special population split for GBR (England/Scotland)
            if team == "England" and pop:
                pop = int(pop * 0.84) # ~84% of UK
            elif team == "Scotland" and pop:
                pop = int(pop * 0.084) # ~8.4% of UK
                
            # Default fallbacks if data is missing
            if gdp is None:
                # Fallback approximations for teams like Curacao
                if team == "Curaçao": gdp = 22000.0
                else: gdp = 10000.0
            if pop is None:
                if team == "Curaçao": pop = 150000
                else: pop = 10000000
                
            writer.writerow([team, round(gdp, 2), int(pop)])
            
    print(f"Saved macroeconomic data to {out_path}")

if __name__ == "__main__":
    main()
