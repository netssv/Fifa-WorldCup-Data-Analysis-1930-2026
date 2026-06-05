"use client";
import React from "react";
import { TEAM_FLAGS } from "../lib/bracketData";

// ── Team Slot in a match card ─────────────────────────────────────────
interface TeamSlotProps {
  team: string;
  isWinner: boolean;
}

export const TeamSlot: React.FC<TeamSlotProps> = ({ team, isWinner }) => {
  const flag = team ? TEAM_FLAGS[team] : null;
  return (
    <div className={`flex items-center gap-2 px-2.5 py-2 transition-colors duration-200 ${
      isWinner
        ? "bg-emerald-500/20 border-l-[3px] border-emerald-400"
        : "border-l-[3px] border-transparent"
    }`}>
      <div className="w-5 h-3.5 flex-shrink-0">
        {flag
          ? <img src={flag} alt={team} crossOrigin="anonymous" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
          : <div className="w-5 h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
        }
      </div>
      <span className={`text-[11px] truncate max-w-[90px] font-medium leading-none ${
        isWinner
          ? "text-emerald-600 dark:text-emerald-300 font-bold"
          : team
          ? "text-neutral-700 dark:text-neutral-300"
          : "text-neutral-400 dark:text-neutral-600 italic"
      }`}>
        {team || "TBD"}
      </span>
      {isWinner && (
        <svg className="w-3 h-3 text-emerald-500 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
};

// ── Match Card ────────────────────────────────────────────────────────
interface MatchCardProps {
  team1: string;
  team2: string;
  winner: string;
}

export const MatchCard: React.FC<MatchCardProps> = ({ team1, team2, winner }) => (
  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded shadow-sm hover:shadow-md hover:border-emerald-400/50 dark:hover:border-emerald-500/40 transition-all duration-200 w-36 sm:w-40 overflow-hidden">
    <TeamSlot team={team1} isWinner={!!winner && winner === team1} />
    <div className="border-t border-neutral-100 dark:border-neutral-800" />
    <TeamSlot team={team2} isWinner={!!winner && winner === team2} />
  </div>
);

// ── Connector (SVG-based, theme-aware) ────────────────────────────────
export const Connector: React.FC = () => (
  <div className="flex items-center self-stretch flex-shrink-0 w-8">
    <div className="w-full border-t-2 border-dashed border-emerald-500/50 dark:border-emerald-400/50" />
  </div>
);

// ── Bracket Column ─────────────────────────────────────────────────────
interface BracketColumnProps {
  title: string;
  teams: string[];
  advancers: string[];
}

export const BracketColumn: React.FC<BracketColumnProps> = ({ title, teams, advancers }) => {
  const matchCount = Math.floor(teams.length / 2);
  return (
    <div className="flex flex-col" style={{ minWidth: "144px" }}>
      <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 text-center mb-3 whitespace-nowrap px-1">
        {title}
      </div>
      <div className="flex flex-col flex-1 gap-3" style={{ justifyContent: "space-around" }}>
        {Array.from({ length: matchCount }).map((_, i) => {
          const t1 = teams[i * 2] || "";
          const t2 = teams[i * 2 + 1] || "";
          const winner = advancers.find((a) => a === t1 || a === t2) || "";
          return <MatchCard key={i} team1={t1} team2={t2} winner={winner} />;
        })}
      </div>
    </div>
  );
};

// ── Center Champion + Final ───────────────────────────────────────────
interface CenterTrophyProps {
  semi: string[];
  finalWinner: string;
}

export const CenterTrophy: React.FC<CenterTrophyProps> = ({ semi, finalWinner }) => (
  <div className="flex flex-col items-center justify-center px-4 sm:px-6 flex-shrink-0 gap-4">
    <div className="flex flex-col items-center gap-1">
      <svg
        className="w-14 h-14 sm:w-20 sm:h-20 text-yellow-500 drop-shadow-lg"
        viewBox="0 0 24 24" fill="currentColor"
        style={{ filter: "drop-shadow(0 0 16px rgba(234,179,8,0.4))" }}
      >
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
      </svg>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">Champion</span>
    </div>

    {/* Champion card */}
    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-[2px] rounded-lg shadow-2xl shadow-yellow-500/20">
      <div className="bg-white dark:bg-neutral-955 px-5 py-3 rounded-[7px] flex items-center gap-3 min-w-[140px] justify-center">
        {finalWinner && TEAM_FLAGS[finalWinner]
          ? <img src={TEAM_FLAGS[finalWinner]} alt={finalWinner} crossOrigin="anonymous" className="w-9 h-6 object-cover rounded-sm shadow-sm" />
          : <div className="w-9 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-sm" />
        }
        <span className="font-black text-base sm:text-lg text-neutral-900 dark:text-white tracking-wide truncate max-w-[110px]">
          {finalWinner || "TBD"}
        </span>
      </div>
    </div>

    {/* Final match */}
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 w-44 sm:w-52 shadow-lg">
      <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 text-center mb-2">Grand Final</div>
      {[semi[0], semi[1]].map((team, idx) => {
        const flag = team ? TEAM_FLAGS[team] : null;
        const isChamp = !!finalWinner && finalWinner === team;
        return (
          <React.Fragment key={idx}>
            {idx === 1 && <div className="text-center text-[10px] text-neutral-400 dark:text-neutral-600 font-bold my-1.5">VS</div>}
            <div className={`flex items-center gap-2 p-2 rounded ${isChamp ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40" : "bg-neutral-50 dark:bg-neutral-800"}`}>
              {flag ? <img src={flag} alt={team} crossOrigin="anonymous" className="w-6 h-4 object-cover rounded-sm" /> : <div className="w-6 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-sm" />}
              <span className={`text-xs font-semibold truncate ${isChamp ? "text-yellow-700 dark:text-yellow-300" : "text-neutral-700 dark:text-neutral-300"}`}>
                {team || "TBD"}
              </span>
              {isChamp && (
                <svg className="ml-auto w-3.5 h-3.5 text-yellow-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/>
                </svg>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  </div>
);
