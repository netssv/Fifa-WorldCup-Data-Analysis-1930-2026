export interface GroupData {
  name: string;
  teams: string[];
}

export const TEAM_FLAGS: Record<string, string> = {
  // Group A
  "Mexico": "🇲🇽",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  "Czech Republic": "🇨🇿",
  // Group B
  "Canada": "🇨🇦",
  "Bosnia and Herzegovina": "🇧🇦",
  "Qatar": "🇶🇦",
  "Switzerland": "🇨🇭",
  // Group C
  "Brazil": "🇧🇷",
  "Morocco": "🇲🇦",
  "Haiti": "🇭🇹",
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  // Group D
  "United States": "🇺🇸",
  "Paraguay": "🇵🇾",
  "Australia": "🇦🇺",
  "Turkiye": "🇹🇷",
  // Group E
  "Germany": "🇩🇪",
  "Curaçao": "🇨🇼",
  "Ivory Coast": "🇨🇮",
  "Ecuador": "🇪🇨",
  // Group F
  "Netherlands": "🇳🇱",
  "Japan": "🇯🇵",
  "Sweden": "🇸🇪",
  "Tunisia": "🇹🇳",
  // Group G
  "Belgium": "🇧🇪",
  "Egypt": "🇪🇬",
  "Iran": "🇮🇷",
  "New Zealand": "🇳🇿",
  // Group H
  "Spain": "🇪🇸",
  "Cape Verde": "🇨🇻",
  "Saudi Arabia": "🇸🇦",
  "Uruguay": "🇺🇾",
  // Group I
  "France": "🇫🇷",
  "Senegal": "🇸🇳",
  "Iraq": "🇮🇶",
  "Norway": "🇳🇴",
  // Group J
  "Argentina": "🇦🇷",
  "Algeria": "🇩🇿",
  "Austria": "🇦🇹",
  "Jordan": "🇯🇴",
  // Group K
  "Portugal": "🇵🇹",
  "DR Congo": "🇨🇩",
  "Uzbekistan": "🇺🇿",
  "Colombia": "🇨🇴",
  // Group L
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Croatia": "🇭🇷",
  "Ghana": "🇬🇭",
  "Panama": "🇵🇦"
};

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
