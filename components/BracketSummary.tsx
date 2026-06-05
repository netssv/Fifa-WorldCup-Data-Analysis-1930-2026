"use client";
import React, { forwardRef } from "react";
import { BracketState, Round } from "../lib/bracketLogic";
import { BracketColumn, BracketConnector, CenterTrophy } from "./BracketTreeComponents";
import { useBracketSummary, BracketSummaryHandle } from "../hooks/useBracketSummary";

interface BracketSummaryProps {
  state: BracketState;
  onPickWinner?: (round: Exclude<Round, "groups">, team: string) => void;
}

export type { BracketSummaryHandle };

// ── Main BracketSummary ───────────────────────────────────────────────
export const BracketSummary = forwardRef<BracketSummaryHandle, BracketSummaryProps>(
  ({ state, onPickWinner }, ref) => {
    const {
      bracketRef,
      maxPoints,
      leftR32,
      leftR16,
      leftR8,
      leftSemi,
      rightR32,
      rightR16,
      rightR8,
      rightSemi,
      semi,
      finalWinner,
      isComplete,
    } = useBracketSummary({ state, ref });

    return (
      <div ref={bracketRef} className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
              FIFA World Cup 2026 - Tournament Bracket
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Full visual tree of your predicted results.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Points score */}
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Points</div>
              <div className="text-2xl font-black text-emerald-500">
                {maxPoints}<span className="text-sm text-neutral-400 font-normal"> / 138</span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {!isComplete && (
          <div className="py-24 text-center">
            <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-bold text-neutral-400 dark:text-neutral-500 mb-2">No selections yet</h3>
            <p className="text-sm text-neutral-400 dark:text-neutral-600">
              Complete your bracket or press <strong className="text-emerald-500">Simulate</strong> to auto-fill.
            </p>
          </div>
        )}

        {/* ── Visual Bracket Tree ── */}
        {isComplete && (
          <div className="relative">
            {/* Swipe indicator helper for mobile devices */}
            <div className="md:hidden flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider select-none border-b border-neutral-100 dark:border-neutral-800">
              <svg className="w-3.5 h-3.5 animate-bounce-horizontal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Swipe left/right to view the full bracket tree
            </div>

            <div className="overflow-x-auto p-4 sm:p-6 bg-neutral-50 dark:bg-[#080f14] transition-colors duration-300">
              <div
                className="flex items-stretch gap-0 mx-auto"
                style={{ minWidth: "940px", width: "max-content" }}
              >
                {/* LEFT BRANCH — each column's onPickWinner targets the NEXT round */}
                <BracketColumn title="Round of 32" teams={leftR32} advancers={leftR16}
                  onPickWinner={onPickWinner ? (t) => onPickWinner("r16", t) : undefined} />
                <BracketConnector leftMatchCount={4} />
                <BracketColumn title="Round of 16" teams={leftR16} advancers={leftR8}
                  onPickWinner={onPickWinner ? (t) => onPickWinner("r8", t) : undefined} />
                <BracketConnector leftMatchCount={2} />
                <BracketColumn title="Quarters" teams={leftR8} advancers={leftSemi}
                  onPickWinner={onPickWinner ? (t) => onPickWinner("semi", t) : undefined} />
                <BracketConnector leftMatchCount={1} />
                <BracketColumn title="Semifinal" teams={[leftSemi[0] || "", ""]} advancers={semi}
                  onPickWinner={onPickWinner ? (t) => onPickWinner("final", t) : undefined} />

                {/* CENTER */}
                <CenterTrophy semi={semi} finalWinner={finalWinner}
                  onPickWinner={onPickWinner ? (t) => onPickWinner("final", t) : undefined} />

                {/* RIGHT BRANCH (mirrored) — connectors flip so they open toward the right */}
                <BracketColumn title="Semifinal" teams={[rightSemi[0] || "", ""]} advancers={semi}
                  onPickWinner={onPickWinner ? (t) => onPickWinner("final", t) : undefined} />
                <BracketConnector leftMatchCount={1} mirrored />
                <BracketColumn title="Quarters" teams={rightR8} advancers={rightSemi}
                  onPickWinner={onPickWinner ? (t) => onPickWinner("semi", t) : undefined} />
                <BracketConnector leftMatchCount={2} mirrored />
                <BracketColumn title="Round of 16" teams={rightR16} advancers={rightR8}
                  onPickWinner={onPickWinner ? (t) => onPickWinner("r8", t) : undefined} />
                <BracketConnector leftMatchCount={4} mirrored />
                <BracketColumn title="Round of 32" teams={rightR32} advancers={rightR16}
                  onPickWinner={onPickWinner ? (t) => onPickWinner("r16", t) : undefined} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

BracketSummary.displayName = "BracketSummary";

