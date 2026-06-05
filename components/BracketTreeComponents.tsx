"use client";
import React from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
export { CenterTrophy } from "./CenterTrophy";

// ── Team Slot ─────────────────────────────────────────────────────────
interface TeamSlotProps {
  team: string;
  isWinner: boolean;
  onClick?: () => void;
}

export const TeamSlot: React.FC<TeamSlotProps> = ({ team, isWinner, onClick }) => {
  const flag = team ? TEAM_FLAGS[team] : null;
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      title={onClick && team ? `Pick ${team} as winner` : undefined}
      className={`flex items-center gap-2 px-2.5 py-2 transition-all duration-200 ${
        onClick && team ? "cursor-pointer" : ""
      } ${
        isWinner
          ? "bg-emerald-500/20 border-l-[3px] border-emerald-400"
          : onClick && team
          ? "border-l-[3px] border-transparent hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-400"
          : "border-l-[3px] border-transparent"
      }`}
    >
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
  onPickWinner?: (team: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ team1, team2, winner, onPickWinner }) => (
  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded shadow-sm hover:shadow-md hover:border-emerald-400/50 dark:hover:border-emerald-500/40 transition-all duration-200 w-36 sm:w-40 overflow-hidden group">
    <TeamSlot
      team={team1}
      isWinner={!!winner && winner === team1}
      onClick={onPickWinner && team1 ? () => onPickWinner(team1) : undefined}
    />
    <div className="border-t border-neutral-100 dark:border-neutral-800" />
    <TeamSlot
      team={team2}
      isWinner={!!winner && winner === team2}
      onClick={onPickWinner && team2 ? () => onPickWinner(team2) : undefined}
    />
  </div>
);

// ── SVG Bracket Connector ─────────────────────────────────────────────
interface BracketConnectorProps {
  leftMatchCount: number;
  // When true, the connector is horizontally mirrored for the right branch
  mirrored?: boolean;
}

export const BracketConnector: React.FC<BracketConnectorProps> = ({ leftMatchCount, mirrored }) => {
  const rightMatchCount = Math.ceil(leftMatchCount / 2);
  const leftYs = Array.from({ length: leftMatchCount }, (_, i) =>
    ((2 * i + 1) / (2 * leftMatchCount)) * 100
  );
  const rightYs = Array.from({ length: rightMatchCount }, (_, j) =>
    ((2 * j + 1) / (2 * rightMatchCount)) * 100
  );

  return (
    <div
      className="self-stretch flex-shrink-0 w-10 text-emerald-500/70 dark:text-emerald-400/70"
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
    >
      <svg width="100%" height="100%" preserveAspectRatio="none">
        {rightYs.map((rightY, j) => {
          const leftTop = leftYs[j * 2] ?? rightY;
          const leftBottom = leftYs[j * 2 + 1] ?? rightY;
          return (
            <g key={j}>
              {/* Horizontal from left card to midpoint */}
              <line x1="0%" y1={`${leftTop}%`} x2="50%" y2={`${leftTop}%`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              {/* Vertical bracket bar */}
              <line x1="50%" y1={`${leftTop}%`} x2="50%" y2={`${leftBottom}%`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              {/* Horizontal bottom back to midpoint */}
              <line x1="0%" y1={`${leftBottom}%`} x2="50%" y2={`${leftBottom}%`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              {/* Trunk line to next column */}
              <line x1="50%" y1={`${rightY}%`} x2="100%" y2={`${rightY}%`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Bracket Column ─────────────────────────────────────────────────────
interface BracketColumnProps {
  title: string;
  teams: string[];
  advancers: string[];
  onPickWinner?: (team: string) => void;
}

export const BracketColumn: React.FC<BracketColumnProps> = ({ title, teams, advancers, onPickWinner }) => {
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
          return (
            <MatchCard
              key={i}
              team1={t1}
              team2={t2}
              winner={winner}
              onPickWinner={onPickWinner}
            />
          );
        })}
      </div>
    </div>
  );
};

