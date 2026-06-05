"use client";
import React, { forwardRef } from "react";
import { BracketState, Round } from "../lib/bracketLogic";
import { BracketColumn, BracketConnector, CenterTrophy, MatchCard } from "./BracketTreeComponents";
import { useBracketSummary, BracketSummaryHandle } from "../hooks/useBracketSummary";

interface BracketSummaryProps {
  state: BracketState;
  onPickWinner?: (round: Exclude<Round, "groups">, team: string) => void;
}

export type { BracketSummaryHandle };

const VerticalConnector = () => (
  <div className="w-[1.5px] h-4 bg-emerald-500/35 dark:bg-emerald-500/25" />
);

export const BracketSummary = forwardRef<BracketSummaryHandle, BracketSummaryProps>(
  ({ state, onPickWinner }, ref) => {
    const {
      bracketRef, maxPoints, layout, setLayout,
      leftR32, leftR16, leftR8, leftSemi,
      rightR32, rightR16, rightR8, rightSemi,
      semi, finalWinner, isComplete,
    } = useBracketSummary({ state, ref });

    const renderMatchesRow = (teams: string[], advancers: string[], count: number, targetRound: Exclude<Round, "groups">) => (
      <div className="flex gap-4 justify-center items-center flex-wrap">
        {Array.from({ length: count }).map((_, i) => {
          const t1 = teams[i * 2] || "";
          const t2 = teams[i * 2 + 1] || "";
          const winner = advancers.find((a) => a === t1 || a === t2) || "";
          return (
            <MatchCard
              key={i}
              team1={t1}
              team2={t2}
              winner={winner}
              onPickWinner={onPickWinner ? (t) => onPickWinner(targetRound, t) : undefined}
            />
          );
        })}
      </div>
    );

    return (
      <div ref={bracketRef} id="bracket-summary-capture-root" className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden transition-colors duration-300">
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
              FIFA World Cup 2026 — Bracket
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">Full visual tree of your tournament predictions.</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex bg-neutral-100 dark:bg-neutral-900/60 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setLayout("compact")}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                  layout === "compact"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Compact (Vertical)
              </button>
              <button
                type="button"
                onClick={() => setLayout("classic")}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                  layout === "classic"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Classic (Horizontal)
              </button>
            </div>
            <div className="text-right border-l border-neutral-200 dark:border-neutral-800 pl-4">
              <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Max Points</div>
              <div className="text-2xl font-black text-emerald-500 leading-none mt-1">
                {maxPoints}<span className="text-xs text-neutral-400 font-normal"> / 138</span>
              </div>
            </div>
          </div>
        </div>

        {!isComplete && (
          <div className="py-24 text-center">
            <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-bold text-neutral-400 dark:text-neutral-500 mb-2">No picks yet</h3>
            <p className="text-sm text-neutral-400 dark:text-neutral-600">Complete your bracket or press <strong className="text-emerald-500">Simulate</strong> to auto-fill.</p>
          </div>
        )}

        {isComplete && (
          <div className="relative" id="bracket-summary-root">
            {layout === "classic" && (
              <div className="md:hidden flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider select-none border-b border-neutral-100 dark:border-neutral-800">
                <svg className="w-3.5 h-3.5 animate-bounce-horizontal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Swipe left/right to see the full bracket
              </div>
            )}

            <div 
              className={`p-4 sm:p-6 transition-colors duration-300 ${layout === "classic" ? "overflow-x-auto" : "overflow-hidden"}`}
              style={{
                backgroundColor: "#060c11",
                backgroundImage: "radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, transparent 85%), linear-gradient(0deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)",
                backgroundSize: "100% 100%, 28px 28px, 28px 28px"
              }}
            >
              {layout === "classic" ? (
                <div className="flex items-stretch gap-0 mx-auto" style={{ minWidth: "940px", width: "max-content" }}>
                  <BracketColumn title="Round of 32" teams={leftR32} advancers={leftR16} onPickWinner={onPickWinner ? (t) => onPickWinner("r16", t) : undefined} />
                  <BracketConnector leftMatchCount={4} />
                  <BracketColumn title="Round of 16" teams={leftR16} advancers={leftR8} onPickWinner={onPickWinner ? (t) => onPickWinner("r8", t) : undefined} />
                  <BracketConnector leftMatchCount={2} />
                  <BracketColumn title="Quarters" teams={leftR8} advancers={leftSemi} onPickWinner={onPickWinner ? (t) => onPickWinner("semi", t) : undefined} />
                  <BracketConnector leftMatchCount={1} />
                  <BracketColumn title="Semifinal" teams={[leftSemi[0] || "", ""]} advancers={semi} onPickWinner={onPickWinner ? (t) => onPickWinner("final", t) : undefined} />
                  <BracketConnector leftMatchCount={1} />
                  <CenterTrophy semi={semi} finalWinner={finalWinner} onPickWinner={onPickWinner ? (t) => onPickWinner("final", t) : undefined} />
                  <BracketConnector leftMatchCount={1} mirrored />
                  <BracketColumn title="Semifinal" teams={[rightSemi[0] || "", ""]} advancers={semi} onPickWinner={onPickWinner ? (t) => onPickWinner("final", t) : undefined} />
                  <BracketConnector leftMatchCount={1} mirrored />
                  <BracketColumn title="Quarters" teams={rightR8} advancers={rightSemi} onPickWinner={onPickWinner ? (t) => onPickWinner("semi", t) : undefined} />
                  <BracketConnector leftMatchCount={2} mirrored />
                  <BracketColumn title="Round of 16" teams={rightR16} advancers={rightR8} onPickWinner={onPickWinner ? (t) => onPickWinner("r8", t) : undefined} />
                  <BracketConnector leftMatchCount={4} mirrored />
                  <BracketColumn title="Round of 32" teams={rightR32} advancers={rightR16} onPickWinner={onPickWinner ? (t) => onPickWinner("r16", t) : undefined} />
                </div>
              ) : (
                <div className="flex flex-col gap-4 items-center w-full max-w-3xl mx-auto">
                  {/* Top Half (flows top-to-bottom) */}
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 border-b border-emerald-500/20 pb-1.5 w-full text-center">Top Half Bracket (Group A side)</div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Round of 32</div>
                    {renderMatchesRow(leftR32, leftR16, 4, "r16")}
                    <VerticalConnector />
                    <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Round of 16</div>
                    {renderMatchesRow(leftR16, leftR8, 2, "r8")}
                    <VerticalConnector />
                    <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Quarterfinals</div>
                    {renderMatchesRow(leftR8, leftSemi, 1, "semi")}
                    <VerticalConnector />
                    <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Semifinal</div>
                    <MatchCard team1={leftSemi[0] || ""} team2={rightSemi[0] || ""} winner={semi.find((a) => a === leftSemi[0] || a === rightSemi[0]) || ""} onPickWinner={onPickWinner ? (t) => onPickWinner("final", t) : undefined} />
                  </div>

                  {/* Center Trophy / Champion / Grand Final */}
                  <div className="w-full py-2 border-y border-neutral-200/50 dark:border-neutral-800/40 flex flex-col items-center bg-neutral-900/[0.02] dark:bg-neutral-950/20 rounded-xl gap-2.5">
                    <VerticalConnector />
                    <CenterTrophy semi={semi} finalWinner={finalWinner} onPickWinner={onPickWinner ? (t) => onPickWinner("final", t) : undefined} />
                    <VerticalConnector />
                  </div>

                  {/* Bottom Half (flows bottom-to-top) */}
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Semifinal</div>
                    <MatchCard team1={rightSemi[0] || ""} team2={leftSemi[0] || ""} winner={semi.find((a) => a === rightSemi[0] || a === leftSemi[0]) || ""} onPickWinner={onPickWinner ? (t) => onPickWinner("final", t) : undefined} />
                    <VerticalConnector />
                    <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Quarterfinals</div>
                    {renderMatchesRow(rightR8, rightSemi, 1, "semi")}
                    <VerticalConnector />
                    <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Round of 16</div>
                    {renderMatchesRow(rightR16, rightR8, 2, "r8")}
                    <VerticalConnector />
                    <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Round of 32</div>
                    {renderMatchesRow(rightR32, rightR16, 4, "r16")}
                    <div className="text-[10px] font-black uppercase tracking-widest text-sky-500 border-t border-sky-500/20 pt-2 w-full text-center mt-2">Bottom Half Bracket (Group B side)</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

BracketSummary.displayName = "BracketSummary";
