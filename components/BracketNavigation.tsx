"use client";

import React from "react";
import { Round } from "../lib/bracketLogic";

export const NAVIGATION_TABS: { id: Round | "summary" | "ai_lab"; label: string }[] = [
  { id: "groups", label: "Groups" },
  { id: "r32", label: "Round of 32" },
  { id: "r16", label: "Round of 16" },
  { id: "r8", label: "Quarters" },
  { id: "semi", label: "Semis" },
  { id: "final", label: "Final" },
  { id: "summary", label: "Summary" },
  { id: "ai_lab", label: "AI Lab" },
];

interface BracketNavigationProps {
  activeTab: Round | "summary" | "ai_lab";
  setActiveTab: (tab: Round | "summary" | "ai_lab") => void;
  getTabUnlockedStatus: (tabId: Round | "summary" | "ai_lab") => boolean;
}

export const BracketNavigation: React.FC<BracketNavigationProps> = ({
  activeTab,
  setActiveTab,
  getTabUnlockedStatus,
}) => {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto scrollbar-hide">
      <nav className="flex whitespace-nowrap" aria-label="Bracket Navigation">
        {NAVIGATION_TABS.map((tab) => {
          const isUnlocked = getTabUnlockedStatus(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              disabled={!isUnlocked}
              onClick={() => setActiveTab(tab.id)}
              className={`relative group flex items-center gap-1.5 py-3 px-4 sm:px-5 font-semibold text-sm transition-all duration-200 border-b-2 select-none ${
                isActive
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                  : isUnlocked
                  ? "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer"
                  : "border-transparent text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
