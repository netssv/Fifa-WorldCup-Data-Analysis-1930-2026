"use client";
import React, { useState } from "react";

export const PARAM_TOOLTIPS: Record<string, { description: string; example: string; impact: "high" | "medium" | "low" }> = {
  "ELO Rating": {
    description: "A numerical measure of a team's overall historical strength, based on match results against other teams. Higher means stronger.",
    example: "Brazil: 1940 ELO · Argentina: 1980 ELO · Qatar: 1310 ELO",
    impact: "high",
  },
  "Recent Form": {
    description: "Win rate in the last 10 competitive matches. The ML model uses this to detect teams that are 'hot' or in a slump entering the tournament.",
    example: "75% = won 7.5 of last 10 matches on average",
    impact: "high",
  },
  "Penalty Win Rate": {
    description: "Historical win rate in penalty shootouts. Critical for knock-out stage draws. Teams like Germany are historically strong here.",
    example: "Germany: ~76% · England: historically low",
    impact: "medium",
  },
  "Big-Match Record": {
    description: "Win rate specifically in semi-finals and finals of major tournaments (World Cup, Euro, Copa America). Measures tournament mentality.",
    example: "A team with 80% means they win 4 out of 5 major tournament finals they reach.",
    impact: "medium",
  },
  "Knockout Win Rate": {
    description: "Overall win rate in all elimination-stage matches (Round of 16 onwards). Differentiates teams that perform under pressure.",
    example: "Argentina 2022: near 100% — won every elimination match including final.",
    impact: "high",
  },
};

interface TooltipProps {
  paramKey: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ paramKey }) => {
  const [visible, setVisible] = useState(false);
  const info = PARAM_TOOLTIPS[paramKey];
  if (!info) return null;

  const impactColors = {
    high: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    medium: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    low: "text-neutral-500 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
  };

  return (
    <div className="relative inline-flex items-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      <button
        type="button"
        className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-[10px] font-black flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors cursor-help flex-shrink-0"
        aria-label={`Info: ${paramKey}`}
      >
        ?
      </button>

      {visible && (
        <div className="absolute left-6 top-0 z-50 w-64 sm:w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-3 pointer-events-none animate-slide-down">
          <div className="font-bold text-xs text-neutral-800 dark:text-neutral-200 mb-1.5">{paramKey}</div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-2">
            {info.description}
          </p>

          {/* Example */}
          <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1.5 mb-2">
            <div className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 mb-0.5">Example</div>
            <div className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">{info.example}</div>
          </div>

          {/* ML Impact badge */}
          <div className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border ${impactColors[info.impact]}`}>
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            {info.impact} ML impact
          </div>

          {/* Arrow */}
          <div className="absolute -left-2 top-3 w-2 h-2 bg-white dark:bg-neutral-900 border-l border-t border-neutral-200 dark:border-neutral-700 rotate-[-45deg]" />
        </div>
      )}
    </div>
  );
};
