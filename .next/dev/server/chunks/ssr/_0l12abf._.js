module.exports = [
"[project]/lib/bracketData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GROUPS",
    ()=>GROUPS,
    "TEAM_FLAGS",
    ()=>TEAM_FLAGS
]);
const TEAM_FLAGS = {
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
const GROUPS = [
    {
        name: "Group A",
        teams: [
            "Mexico",
            "South Africa",
            "South Korea",
            "Czech Republic"
        ]
    },
    {
        name: "Group B",
        teams: [
            "Canada",
            "Bosnia and Herzegovina",
            "Qatar",
            "Switzerland"
        ]
    },
    {
        name: "Group C",
        teams: [
            "Brazil",
            "Morocco",
            "Haiti",
            "Scotland"
        ]
    },
    {
        name: "Group D",
        teams: [
            "United States",
            "Paraguay",
            "Australia",
            "Turkiye"
        ]
    },
    {
        name: "Group E",
        teams: [
            "Germany",
            "Curaçao",
            "Ivory Coast",
            "Ecuador"
        ]
    },
    {
        name: "Group F",
        teams: [
            "Netherlands",
            "Japan",
            "Sweden",
            "Tunisia"
        ]
    },
    {
        name: "Group G",
        teams: [
            "Belgium",
            "Egypt",
            "Iran",
            "New Zealand"
        ]
    },
    {
        name: "Group H",
        teams: [
            "Spain",
            "Cape Verde",
            "Saudi Arabia",
            "Uruguay"
        ]
    },
    {
        name: "Group I",
        teams: [
            "France",
            "Senegal",
            "Iraq",
            "Norway"
        ]
    },
    {
        name: "Group J",
        teams: [
            "Argentina",
            "Algeria",
            "Austria",
            "Jordan"
        ]
    },
    {
        name: "Group K",
        teams: [
            "Portugal",
            "DR Congo",
            "Uzbekistan",
            "Colombia"
        ]
    },
    {
        name: "Group L",
        teams: [
            "England",
            "Croatia",
            "Ghana",
            "Panama"
        ]
    }
];
}),
"[project]/lib/bracketLogic.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INITIAL_STATE",
    ()=>INITIAL_STATE,
    "ROUND_LIMITS",
    ()=>ROUND_LIMITS,
    "ROUND_POINTS",
    ()=>ROUND_POINTS,
    "calculateMaxPoints",
    ()=>calculateMaxPoints,
    "canSelectTeam",
    ()=>canSelectTeam,
    "getAvailableTeams",
    ()=>getAvailableTeams,
    "isRoundComplete",
    ()=>isRoundComplete
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bracketData.ts [app-ssr] (ecmascript)");
;
const INITIAL_STATE = {
    groups: {},
    r32: [],
    r16: [],
    r8: [],
    semi: [],
    final: ""
};
const ROUND_LIMITS = {
    r32: 16,
    r16: 8,
    r8: 4,
    semi: 2,
    final: 1
};
const ROUND_POINTS = {
    groups: 1,
    r32: 2,
    r16: 4,
    r8: 6,
    semi: 8,
    final: 10
};
function isRoundComplete(state, round) {
    if (round === 'groups') {
        // There must be 12 groups, and each must have exactly 2 selections
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GROUPS"].every((g)=>(state.groups[g.name] || []).length === 2);
    }
    if (round === 'final') {
        return !!state.final;
    }
    return state[round].length === ROUND_LIMITS[round];
}
function getAvailableTeams(state, round) {
    if (round === 'groups') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GROUPS"].flatMap((g)=>g.teams);
    }
    if (round === 'r32') {
        return Object.values(state.groups).flat();
    }
    if (round === 'r16') {
        return state.r32;
    }
    if (round === 'r8') {
        return state.r16;
    }
    if (round === 'semi') {
        return state.r8;
    }
    if (round === 'final') {
        return state.semi;
    }
    return [];
}
function canSelectTeam(team, round, state) {
    if (round === 'groups') {
        return true;
    }
    const available = getAvailableTeams(state, round);
    return available.includes(team);
}
function calculateMaxPoints(state) {
    let points = 0;
    // Groups: 1pt per selected team
    const groupTeamsCount = Object.values(state.groups).flat().length;
    points += groupTeamsCount * ROUND_POINTS.groups;
    // Playoff rounds
    points += state.r32.length * ROUND_POINTS.r32;
    points += state.r16.length * ROUND_POINTS.r16;
    points += state.r8.length * ROUND_POINTS.r8;
    points += state.semi.length * ROUND_POINTS.semi;
    if (state.final) {
        points += 1 * ROUND_POINTS.final;
    }
    return points;
}
}),
"[project]/lib/bracketStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportBracket",
    ()=>exportBracket,
    "loadBracket",
    ()=>loadBracket,
    "saveBracket",
    ()=>saveBracket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bracketLogic.ts [app-ssr] (ecmascript)");
;
const STORAGE_KEY = "fifa2026_bracket";
function saveBracket(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Error saving bracket state to localStorage:", error);
    }
}
function loadBracket() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error loading bracket state from localStorage:", error);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_STATE"];
}
function exportBracket(userName, state) {
    const exportData = {
        userName: userName || "Anonymous",
        predictions: state,
        savedAt: new Date().toISOString()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `fifa_wc2026_predictions_${exportData.userName.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
}),
"[project]/components/GroupCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GroupCard",
    ()=>GroupCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bracketData.ts [app-ssr] (ecmascript)");
;
;
const GroupCard = ({ groupName, teams, selectedTeams = [], onSelectTeam })=>{
    const isSelected = (team)=>selectedTeams.includes(team);
    const reachedLimit = selectedTeams.length >= 2;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
                        children: groupName
                    }, void 0, false, {
                        fileName: "[project]/components/GroupCard.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium",
                        children: [
                            selectedTeams.length,
                            " / 2 selected"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GroupCard.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/GroupCard.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: teams.map((team)=>{
                    const selected = isSelected(team);
                    const disabled = !selected && reachedLimit;
                    const flag = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TEAM_FLAGS"][team] || "🏳️";
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onSelectTeam(team),
                        disabled: disabled,
                        className: `w-full flex items-center justify-between p-3 rounded-lg border text-left font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 ${selected ? "bg-green-600 border-green-600 text-white shadow-sm" : disabled ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-300 dark:text-slate-700 cursor-not-allowed hover:scale-100" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xl",
                                        role: "img",
                                        "aria-label": `${team} flag`,
                                        children: flag
                                    }, void 0, false, {
                                        fileName: "[project]/components/GroupCard.tsx",
                                        lineNumber: 52,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: team
                                    }, void 0, false, {
                                        fileName: "[project]/components/GroupCard.tsx",
                                        lineNumber: 55,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GroupCard.tsx",
                                lineNumber: 51,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-5 h-5 text-white",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M5 13l4 4L19 7"
                                }, void 0, false, {
                                    fileName: "[project]/components/GroupCard.tsx",
                                    lineNumber: 64,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/GroupCard.tsx",
                                lineNumber: 58,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, team, true, {
                        fileName: "[project]/components/GroupCard.tsx",
                        lineNumber: 39,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0));
                })
            }, void 0, false, {
                fileName: "[project]/components/GroupCard.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/GroupCard.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/components/RoundColumn.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RoundColumn",
    ()=>RoundColumn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bracketData.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bracketLogic.ts [app-ssr] (ecmascript)");
;
;
;
const RoundColumn = ({ round, roundTitle, previousRoundTeams = [], selectedTeams = [], onToggleTeam })=>{
    const limit = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROUND_LIMITS"][round];
    // Normalize string/array selectedTeams
    const selections = typeof selectedTeams === "string" ? selectedTeams ? [
        selectedTeams
    ] : [] : selectedTeams;
    const isSelected = (team)=>selections.includes(team);
    const reachedLimit = selections.length >= limit;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-bold text-slate-800 dark:text-white",
                                children: roundTitle
                            }, void 0, false, {
                                fileName: "[project]/components/RoundColumn.tsx",
                                lineNumber: 34,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-500 dark:text-slate-400 mt-0.5",
                                children: "Select the teams advancing to the next stage."
                            }, void 0, false, {
                                fileName: "[project]/components/RoundColumn.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/RoundColumn.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 font-semibold px-3.5 py-1.5 rounded-full text-sm",
                        children: [
                            selections.length,
                            " / ",
                            limit,
                            " slots filled"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/RoundColumn.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/RoundColumn.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",
                children: previousRoundTeams.map((team)=>{
                    const selected = isSelected(team);
                    const disabled = !selected && reachedLimit;
                    const flag = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TEAM_FLAGS"][team] || "🏳️";
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onToggleTeam(team),
                        disabled: disabled,
                        className: `flex items-center justify-between p-3.5 rounded-xl border text-left font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 ${selected ? "bg-green-600 border-green-600 text-white shadow-sm shadow-green-600/20" : disabled ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-300 dark:text-slate-700 cursor-not-allowed hover:scale-100" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-2.5 overflow-hidden",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xl shrink-0",
                                        role: "img",
                                        "aria-label": `${team} flag`,
                                        children: flag
                                    }, void 0, false, {
                                        fileName: "[project]/components/RoundColumn.tsx",
                                        lineNumber: 66,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate text-sm",
                                        children: team
                                    }, void 0, false, {
                                        fileName: "[project]/components/RoundColumn.tsx",
                                        lineNumber: 69,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RoundColumn.tsx",
                                lineNumber: 65,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4 text-white shrink-0 ml-1.5",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2.5,
                                    d: "M5 13l4 4L19 7"
                                }, void 0, false, {
                                    fileName: "[project]/components/RoundColumn.tsx",
                                    lineNumber: 78,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/RoundColumn.tsx",
                                lineNumber: 72,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, team, true, {
                        fileName: "[project]/components/RoundColumn.tsx",
                        lineNumber: 53,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0));
                })
            }, void 0, false, {
                fileName: "[project]/components/RoundColumn.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            previousRoundTeams.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-10 border-2 border-dashed border-gray-200 dark:border-slate-850 rounded-xl",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-slate-400 dark:text-slate-600 text-sm",
                    children: "Please complete selections in the previous round to unlock this stage."
                }, void 0, false, {
                    fileName: "[project]/components/RoundColumn.tsx",
                    lineNumber: 93,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/RoundColumn.tsx",
                lineNumber: 92,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/RoundColumn.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/components/BracketSummary.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BracketSummary",
    ()=>BracketSummary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bracketData.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bracketLogic.ts [app-ssr] (ecmascript)");
;
;
;
const BracketSummary = ({ state })=>{
    const maxPoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxPoints"])(state);
    const groupTeams = Object.values(state.groups).flat();
    const renderTeamItem = (team)=>{
        const flag = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TEAM_FLAGS"][team] || "🏳️";
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    role: "img",
                    "aria-label": `${team} flag`,
                    children: flag
                }, void 0, false, {
                    fileName: "[project]/components/BracketSummary.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "truncate",
                    children: team
                }, void 0, false, {
                    fileName: "[project]/components/BracketSummary.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, team, true, {
            fileName: "[project]/components/BracketSummary.tsx",
            lineNumber: 16,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-slate-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-bold text-slate-800 dark:text-white",
                                children: "Predictions Summary"
                            }, void 0, false, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 32,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-500 dark:text-slate-400 mt-0.5",
                                children: "Full overview of your predicted tournament path."
                            }, void 0, false, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 35,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BracketSummary.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-slate-900 dark:bg-slate-850 text-white rounded-xl px-5 py-3 text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs uppercase tracking-wider font-semibold text-slate-400 block",
                                children: "Max Potential Points"
                            }, void 0, false, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-3xl font-extrabold text-green-400",
                                children: [
                                    maxPoints,
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-lg font-normal text-slate-300",
                                        children: "/ 138"
                                    }, void 0, false, {
                                        fileName: "[project]/components/BracketSummary.tsx",
                                        lineNumber: 44,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 43,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BracketSummary.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/BracketSummary.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 min-w-[140px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800",
                                children: [
                                    "Groups (",
                                    groupTeams.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1.5 max-h-[450px] overflow-y-auto pr-1",
                                children: [
                                    groupTeams.map(renderTeamItem),
                                    groupTeams.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-400 italic",
                                        children: "No selections"
                                    }, void 0, false, {
                                        fileName: "[project]/components/BracketSummary.tsx",
                                        lineNumber: 58,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BracketSummary.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 min-w-[140px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800",
                                children: [
                                    "Round of 32 (",
                                    state.r32.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1.5 max-h-[450px] overflow-y-auto pr-1",
                                children: [
                                    state.r32.map(renderTeamItem),
                                    state.r32.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-400 italic",
                                        children: "No selections"
                                    }, void 0, false, {
                                        fileName: "[project]/components/BracketSummary.tsx",
                                        lineNumber: 71,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 68,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BracketSummary.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 min-w-[140px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800",
                                children: [
                                    "Round of 16 (",
                                    state.r16.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 78,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1.5 max-h-[450px] overflow-y-auto pr-1",
                                children: [
                                    state.r16.map(renderTeamItem),
                                    state.r16.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-400 italic",
                                        children: "No selections"
                                    }, void 0, false, {
                                        fileName: "[project]/components/BracketSummary.tsx",
                                        lineNumber: 84,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BracketSummary.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 min-w-[140px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800",
                                children: [
                                    "Quarterfinals (",
                                    state.r8.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1.5 max-h-[450px] overflow-y-auto pr-1",
                                children: [
                                    state.r8.map(renderTeamItem),
                                    state.r8.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-400 italic",
                                        children: "No selections"
                                    }, void 0, false, {
                                        fileName: "[project]/components/BracketSummary.tsx",
                                        lineNumber: 97,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BracketSummary.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 min-w-[140px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800",
                                children: [
                                    "Semifinals (",
                                    state.semi.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 104,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1.5 max-h-[450px] overflow-y-auto pr-1",
                                children: [
                                    state.semi.map(renderTeamItem),
                                    state.semi.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-400 italic",
                                        children: "No selections"
                                    }, void 0, false, {
                                        fileName: "[project]/components/BracketSummary.tsx",
                                        lineNumber: 110,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BracketSummary.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 min-w-[140px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800",
                                children: "Champion (1)"
                            }, void 0, false, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1.5 pr-1",
                                children: state.final ? renderTeamItem(state.final) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-slate-400 italic",
                                    children: "No winner"
                                }, void 0, false, {
                                    fileName: "[project]/components/BracketSummary.tsx",
                                    lineNumber: 124,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/BracketSummary.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/BracketSummary.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/BracketSummary.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/BracketSummary.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/components/FifaBracket.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FifaBracket",
    ()=>FifaBracket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bracketData.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bracketLogic.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/bracketStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GroupCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GroupCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RoundColumn$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/RoundColumn.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$BracketSummary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/BracketSummary.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
const FifaBracket = ()=>{
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_STATE"]);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("groups");
    const [userName, setUserName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [saveStatus, setSaveStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    // Load from localStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loaded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadBracket"])();
        setState(loaded);
    }, []);
    // Auto-save to localStorage whenever state changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (state !== __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_STATE"]) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveBracket"])(state);
        }
    }, [
        state
    ]);
    // Clean cascading dependencies if a selection is removed in an earlier round
    const cleanDependencies = (newState)=>{
        const cleanState = {
            ...newState
        };
        // Clean r32
        const groupTeams = Object.values(cleanState.groups).flat();
        cleanState.r32 = cleanState.r32.filter((t)=>groupTeams.includes(t));
        // Clean r16
        cleanState.r16 = cleanState.r16.filter((t)=>cleanState.r32.includes(t));
        // Clean r8
        cleanState.r8 = cleanState.r8.filter((t)=>cleanState.r16.includes(t));
        // Clean semi
        cleanState.semi = cleanState.semi.filter((t)=>cleanState.r8.includes(t));
        // Clean final
        if (cleanState.final && !cleanState.semi.includes(cleanState.final)) {
            cleanState.final = "";
        }
        return cleanState;
    };
    const handleGroupSelect = (groupName, teamName)=>{
        setState((prev)=>{
            const current = prev.groups[groupName] || [];
            let updated;
            if (current.includes(teamName)) {
                updated = current.filter((t)=>t !== teamName);
            } else {
                if (current.length >= 2) return prev; // Limit to 2
                updated = [
                    ...current,
                    teamName
                ];
            }
            const newState = {
                ...prev,
                groups: {
                    ...prev.groups,
                    [groupName]: updated
                }
            };
            return cleanDependencies(newState);
        });
    };
    const handlePlayoffSelect = (round, teamName)=>{
        setState((prev)=>{
            let newState;
            if (round === "final") {
                newState = {
                    ...prev,
                    final: prev.final === teamName ? "" : teamName
                };
            } else {
                const list = prev[round];
                const updated = list.includes(teamName) ? list.filter((t)=>t !== teamName) : [
                    ...list,
                    teamName
                ];
                if (updated.length > __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROUND_LIMITS"][round]) return prev;
                newState = {
                    ...prev,
                    [round]: updated
                };
            }
            return cleanDependencies(newState);
        });
    };
    const handleReset = ()=>{
        if (confirm("Are you sure you want to reset all your predictions?")) {
            setState(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_STATE"]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveBracket"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INITIAL_STATE"]);
            setActiveTab("groups");
        }
    };
    const handleManualSave = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveBracket"])(state);
        setSaveStatus("Saved successfully!");
        setTimeout(()=>setSaveStatus(""), 3000);
    };
    const handleExport = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportBracket"])(userName, state);
    };
    // Check which tabs are unlocked
    const rounds = [
        {
            id: "groups",
            label: "Groups"
        },
        {
            id: "r32",
            label: "Round of 32"
        },
        {
            id: "r16",
            label: "Round of 16"
        },
        {
            id: "r8",
            label: "Quarterfinals"
        },
        {
            id: "semi",
            label: "Semifinals"
        },
        {
            id: "final",
            label: "Final"
        },
        {
            id: "summary",
            label: "Summary"
        }
    ];
    const getTabUnlockedStatus = (tabId)=>{
        if (tabId === "groups") return true;
        if (tabId === "r32") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isRoundComplete"])(state, "groups");
        if (tabId === "r16") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isRoundComplete"])(state, "r32") && getTabUnlockedStatus("r32");
        if (tabId === "r8") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isRoundComplete"])(state, "r16") && getTabUnlockedStatus("r16");
        if (tabId === "semi") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isRoundComplete"])(state, "r8") && getTabUnlockedStatus("r8");
        if (tabId === "final") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isRoundComplete"])(state, "semi") && getTabUnlockedStatus("semi");
        if (tabId === "summary") return true; // Always allow summary viewing
        return false;
    };
    // Calculate completed rounds progress
    const roundKeys = [
        "groups",
        "r32",
        "r16",
        "r8",
        "semi",
        "final"
    ];
    const completedRoundsCount = roundKeys.filter((r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isRoundComplete"])(state, r)).length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-100",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 text-white rounded-2xl p-6 shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl sm:text-3xl font-extrabold tracking-tight",
                                children: "FIFA 2026 World Cup Bracket"
                            }, void 0, false, {
                                fileName: "[project]/components/FifaBracket.tsx",
                                lineNumber: 160,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-400 mt-1",
                                children: "Build your interactive predictions path from groups stage to the champions."
                            }, void 0, false, {
                                fileName: "[project]/components/FifaBracket.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FifaBracket.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-850 px-4 py-2 rounded-xl border border-slate-800 text-sm",
                                children: [
                                    "Progress: ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold text-green-400",
                                        children: [
                                            completedRoundsCount,
                                            " of 6"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/FifaBracket.tsx",
                                        lineNumber: 170,
                                        columnNumber: 23
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    " rounds complete"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/FifaBracket.tsx",
                                lineNumber: 169,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleManualSave,
                                className: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-150 text-sm",
                                children: "Save predictions"
                            }, void 0, false, {
                                fileName: "[project]/components/FifaBracket.tsx",
                                lineNumber: 172,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleReset,
                                className: "bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-2 px-4 rounded-xl transition duration-150 text-sm",
                                children: "Reset"
                            }, void 0, false, {
                                fileName: "[project]/components/FifaBracket.tsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FifaBracket.tsx",
                        lineNumber: 168,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/FifaBracket.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            saveStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-2.5 rounded-xl text-sm font-medium text-center animate-pulse",
                children: saveStatus
            }, void 0, false, {
                fileName: "[project]/components/FifaBracket.tsx",
                lineNumber: 189,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-gray-200 dark:border-slate-800 overflow-x-auto flex whitespace-nowrap scrollbar-hide",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    className: "flex space-x-2 p-1",
                    "aria-label": "Tabs",
                    children: rounds.map((tab)=>{
                        const unlocked = getTabUnlockedStatus(tab.id);
                        const active = activeTab === tab.id;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: !unlocked,
                            onClick: ()=>setActiveTab(tab.id),
                            className: `py-2 px-4 rounded-lg font-medium text-sm transition-all duration-150 ${active ? "bg-green-600 text-white" : unlocked ? "text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800" : "text-slate-300 dark:text-slate-700 cursor-not-allowed"}`,
                            children: tab.label
                        }, tab.id, false, {
                            fileName: "[project]/components/FifaBracket.tsx",
                            lineNumber: 202,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0));
                    })
                }, void 0, false, {
                    fileName: "[project]/components/FifaBracket.tsx",
                    lineNumber: 196,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/FifaBracket.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "mt-6",
                children: [
                    activeTab === "groups" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GROUPS"].map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GroupCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GroupCard"], {
                                groupName: group.name,
                                teams: group.teams,
                                selectedTeams: state.groups[group.name] || [],
                                onSelectTeam: (team)=>handleGroupSelect(group.name, team)
                            }, group.name, false, {
                                fileName: "[project]/components/FifaBracket.tsx",
                                lineNumber: 226,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/components/FifaBracket.tsx",
                        lineNumber: 224,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === "r32" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RoundColumn$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RoundColumn"], {
                        round: "r32",
                        roundTitle: "Round of 32 (Predictions)",
                        previousRoundTeams: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAvailableTeams"])(state, "r32"),
                        selectedTeams: state.r32,
                        onToggleTeam: (team)=>handlePlayoffSelect("r32", team)
                    }, void 0, false, {
                        fileName: "[project]/components/FifaBracket.tsx",
                        lineNumber: 238,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === "r16" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RoundColumn$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RoundColumn"], {
                        round: "r16",
                        roundTitle: "Round of 16 (Predictions)",
                        previousRoundTeams: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAvailableTeams"])(state, "r16"),
                        selectedTeams: state.r16,
                        onToggleTeam: (team)=>handlePlayoffSelect("r16", team)
                    }, void 0, false, {
                        fileName: "[project]/components/FifaBracket.tsx",
                        lineNumber: 248,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === "r8" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RoundColumn$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RoundColumn"], {
                        round: "r8",
                        roundTitle: "Quarterfinals (Predictions)",
                        previousRoundTeams: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAvailableTeams"])(state, "r8"),
                        selectedTeams: state.r8,
                        onToggleTeam: (team)=>handlePlayoffSelect("r8", team)
                    }, void 0, false, {
                        fileName: "[project]/components/FifaBracket.tsx",
                        lineNumber: 258,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === "semi" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RoundColumn$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RoundColumn"], {
                        round: "semi",
                        roundTitle: "Semifinals (Predictions)",
                        previousRoundTeams: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAvailableTeams"])(state, "semi"),
                        selectedTeams: state.semi,
                        onToggleTeam: (team)=>handlePlayoffSelect("semi", team)
                    }, void 0, false, {
                        fileName: "[project]/components/FifaBracket.tsx",
                        lineNumber: 268,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === "final" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RoundColumn$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RoundColumn"], {
                        round: "final",
                        roundTitle: "Grand Final Prediction",
                        previousRoundTeams: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$bracketLogic$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAvailableTeams"])(state, "final"),
                        selectedTeams: state.final,
                        onToggleTeam: (team)=>handlePlayoffSelect("final", team)
                    }, void 0, false, {
                        fileName: "[project]/components/FifaBracket.tsx",
                        lineNumber: 278,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === "summary" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$BracketSummary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BracketSummary"], {
                                state: state
                            }, void 0, false, {
                                fileName: "[project]/components/FifaBracket.tsx",
                                lineNumber: 289,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-bold text-slate-800 dark:text-white mb-2",
                                        children: "Export Predictions"
                                    }, void 0, false, {
                                        fileName: "[project]/components/FifaBracket.tsx",
                                        lineNumber: 293,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-slate-500 dark:text-slate-400 mb-4",
                                        children: "Export your predictions bracket as a JSON file to share."
                                    }, void 0, false, {
                                        fileName: "[project]/components/FifaBracket.tsx",
                                        lineNumber: 296,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col sm:flex-row gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Enter your name",
                                                value: userName,
                                                onChange: (e)=>setUserName(e.target.value),
                                                className: "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm flex-1 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                            }, void 0, false, {
                                                fileName: "[project]/components/FifaBracket.tsx",
                                                lineNumber: 300,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleExport,
                                                className: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition duration-150",
                                                children: "Export to JSON"
                                            }, void 0, false, {
                                                fileName: "[project]/components/FifaBracket.tsx",
                                                lineNumber: 307,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/FifaBracket.tsx",
                                        lineNumber: 299,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/FifaBracket.tsx",
                                lineNumber: 292,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FifaBracket.tsx",
                        lineNumber: 288,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/FifaBracket.tsx",
                lineNumber: 222,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/FifaBracket.tsx",
        lineNumber: 156,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FifaBracket$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/FifaBracket.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "py-6 px-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FifaBracket$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FifaBracket"], {}, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_0l12abf._.js.map