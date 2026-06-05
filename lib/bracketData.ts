export interface GroupData {
  name: string;
  teams: string[];
}

export const TEAM_ISO_CODES: Record<string, string> = {
  // Group A
  "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Czech Republic": "cz",
  // Group B
  "Canada": "ca", "Bosnia and Herzegovina": "ba", "Qatar": "qa", "Switzerland": "ch",
  // Group C
  "Brazil": "br", "Morocco": "ma", "Haiti": "ht", "Scotland": "gb-sct",
  // Group D
  "United States": "us", "Paraguay": "py", "Australia": "au", "Turkiye": "tr",
  // Group E
  "Germany": "de", "Curaçao": "cw", "Ivory Coast": "ci", "Ecuador": "ec",
  // Group F
  "Netherlands": "nl", "Japan": "jp", "Sweden": "se", "Tunisia": "tn",
  // Group G
  "Belgium": "be", "Egypt": "eg", "Iran": "ir", "New Zealand": "nz",
  // Group H
  "Spain": "es", "Cape Verde": "cv", "Saudi Arabia": "sa", "Uruguay": "uy",
  // Group I
  "France": "fr", "Senegal": "sn", "Iraq": "iq", "Norway": "no",
  // Group J
  "Argentina": "ar", "Algeria": "dz", "Austria": "at", "Jordan": "jo",
  // Group K
  "Portugal": "pt", "DR Congo": "cd", "Uzbekistan": "uz", "Colombia": "co",
  // Group L
  "England": "gb-eng", "Croatia": "hr", "Ghana": "gh", "Panama": "pa"
};

export const getFlagUrl = (team: string) => 
  TEAM_ISO_CODES[team] ? `https://flagcdn.com/w40/${TEAM_ISO_CODES[team]}.png` : "";

export const GROUPS: GroupData[] = [
  { name: "Group A", teams: ["Mexico", "South Africa", "South Korea", "Czech Republic"] },
  { name: "Group B", teams: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"] },
  { name: "Group C", teams: ["Brazil", "Morocco", "Haiti", "Scotland"] },
  { name: "Group D", teams: ["United States", "Paraguay", "Australia", "Turkiye"] },
  { name: "Group E", teams: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"] },
  { name: "Group F", teams: ["Netherlands", "Japan", "Sweden", "Tunisia"] },
  { name: "Group G", teams: ["Belgium", "Egypt", "Iran", "New Zealand"] },
  { name: "Group H", teams: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"] },
  { name: "Group I", teams: ["France", "Senegal", "Iraq", "Norway"] },
  { name: "Group J", teams: ["Argentina", "Algeria", "Austria", "Jordan"] },
  { name: "Group K", teams: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"] },
  { name: "Group L", teams: ["England", "Croatia", "Ghana", "Panama"] }
];

export interface TeamStats {
  elo: number;
  overall: number;
  valueM: number;
}

export const TEAM_STATS: Record<string, TeamStats> = {
  "France": { elo: 1960, overall: 84.5, valueM: 1100 },
  "Argentina": { elo: 1980, overall: 84.0, valueM: 850 },
  "Brazil": { elo: 1940, overall: 83.5, valueM: 1000 },
  "England": { elo: 1900, overall: 84.0, valueM: 1200 },
  "Portugal": { elo: 1910, overall: 83.5, valueM: 900 },
  "Spain": { elo: 1950, overall: 83.8, valueM: 850 },
  "Germany": { elo: 1870, overall: 83.0, valueM: 750 },
  "Netherlands": { elo: 1860, overall: 82.5, valueM: 650 },
  "Belgium": { elo: 1820, overall: 80.5, valueM: 500 },
  "Norway": { elo: 1640, overall: 78.0, valueM: 450 },
  "Uruguay": { elo: 1720, overall: 80.0, valueM: 450 },
  "Morocco": { elo: 1700, overall: 79.0, valueM: 350 },
  "United States": { elo: 1640, overall: 78.0, valueM: 320 },
  "Colombia": { elo: 1700, overall: 78.5, valueM: 300 },
  "Croatia": { elo: 1750, overall: 79.5, valueM: 280 },
  "Senegal": { elo: 1660, overall: 77.0, valueM: 250 },
  "Japan": { elo: 1680, overall: 77.5, valueM: 250 },
  "Ivory Coast": { elo: 1490, overall: 77.5, valueM: 250 },
  "Switzerland": { elo: 1720, overall: 77.5, valueM: 240 },
  "Mexico": { elo: 1700, overall: 77.0, valueM: 220 },
  "Turkiye": { elo: 1600, overall: 77.5, valueM: 220 },
  "Sweden": { elo: 1660, overall: 77.0, valueM: 200 },
  "Ecuador": { elo: 1560, overall: 76.5, valueM: 200 },
  "South Korea": { elo: 1580, overall: 76.0, valueM: 180 },
  "Austria": { elo: 1620, overall: 77.0, valueM: 180 },
  "Ghana": { elo: 1470, overall: 75.5, valueM: 180 },
  "Algeria": { elo: 1550, overall: 76.0, valueM: 150 },
  "Czech Republic": { elo: 1560, overall: 75.8, valueM: 140 },
  "Egypt": { elo: 1530, overall: 74.5, valueM: 120 },
  "Paraguay": { elo: 1470, overall: 74.5, valueM: 120 },
  "Scotland": { elo: 1560, overall: 75.5, valueM: 120 },
  "Bosnia and Herzegovina": { elo: 1430, overall: 73.5, valueM: 90 },
  "Tunisia": { elo: 1490, overall: 72.5, valueM: 60 },
  "DR Congo": { elo: 1440, overall: 73.0, valueM: 60 },
  "Australia": { elo: 1540, overall: 72.0, valueM: 45 },
  "Iran": { elo: 1580, overall: 72.5, valueM: 45 },
  "South Africa": { elo: 1380, overall: 71.0, valueM: 40 },
  "Saudi Arabia": { elo: 1490, overall: 71.5, valueM: 35 },
  "Cape Verde": { elo: 1370, overall: 70.5, valueM: 30 },
  "Uzbekistan": { elo: 1380, overall: 70.0, valueM: 30 },
  "Panama": { elo: 1390, overall: 69.5, valueM: 25 },
  "New Zealand": { elo: 1380, overall: 69.0, valueM: 25 },
  "Qatar": { elo: 1310, overall: 68.5, valueM: 20 },
  "Iraq": { elo: 1390, overall: 67.5, valueM: 15 },
  "Jordan": { elo: 1360, overall: 67.5, valueM: 15 },
  "Curaçao": { elo: 1250, overall: 67.0, valueM: 15 },
  "Haiti": { elo: 1200, overall: 67.0, valueM: 15 }
};

export const TEAM_FLAGS: Record<string, string> = Object.keys(TEAM_ISO_CODES).reduce((acc, key) => {
  acc[key] = getFlagUrl(key);
  return acc;
}, {} as Record<string, string>);


