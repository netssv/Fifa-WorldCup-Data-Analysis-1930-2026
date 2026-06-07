"use client";
import React from "react";

interface SoccerProgressProps {
  current: number;
  total: number;
  isDark: boolean;
}

const SoccerGoalSvg: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <svg
    width="38"
    height="26"
    viewBox="0 0 38 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`opacity-80 dark:opacity-95 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}
  >
    {/* Inside Net depth fill (semi-transparent mesh background) */}
    <path
      d="M8 6H25V21.5L8 22V6Z"
      fill={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
    />
    {/* Slanted side net panels showing depth */}
    {/* Left depth panel (longer depth due to rotation angle) */}
    <path d="M4 2L8 6V22L4 25V2Z" fill={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"} />
    {/* Right depth panel (shorter depth due to rotation angle) */}
    <path d="M28 4L25 7V21.5L28 24V4Z" fill={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)"} />

    {/* Front Post Frame (Foreground - thick, rotated slightly away on the right) */}
    {/* Crossbar slanting slightly down to the right to simulate perspective yaw */}
    <path
      d="M4 25V2C4 1.44772 4.44772 1 5 1H27C27.5523 1 28 1.44772 28 2.05V24"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    {/* Back net frame (Background - thinner, shifted left to match perspective) */}
    <path
      d="M8 22V6C8 5.44772 8.44772 5 9 5H24C24.5523 5 25 5.44772 25 6V21.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.8"
    />

    {/* Depth Connector Bars (Front frame to back frame) */}
    <line x1="4" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
    <line x1="28" y1="4" x2="25" y2="7" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
    <line x1="4" y1="25" x2="8" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
    <line x1="28" y1="24" x2="25" y2="21.5" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />

    {/* Net mesh grids (slanted horizontal lines) */}
    <line x1="8" y1="9" x2="25" y2="9.5" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="8" y1="13" x2="25" y2="13.2" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="8" y1="17" x2="25" y2="17" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="8" y1="20.5" x2="25" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />

    {/* Vertical lines on back mesh */}
    <line x1="12" y1="6" x2="12" y2="22" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="16" y1="6" x2="16" y2="22" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="20" y1="6" x2="20" y2="21.7" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />

    {/* Side Net Grid lines (slanted mesh) */}
    {/* Left side */}
    <line x1="4" y1="8" x2="8" y2="11" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <line x1="4" y1="14" x2="8" y2="16" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <line x1="4" y1="20" x2="8" y2="21" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    
    {/* Right side */}
    <line x1="28" y1="9" x2="25" y2="11" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <line x1="28" y1="15" x2="25" y2="16.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <line x1="28" y1="20.5" x2="25" y2="21" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
  </svg>
);

export const SoccerProgress: React.FC<SoccerProgressProps> = ({ current, total, isDark }) => {
  const pct = total <= 1 ? 50 : Math.min(99, Math.round((current / total) * 100));

  // Ball is "at the goal" when progress hits 99%
  const ballAtGoal = pct >= 99;

  return (
    <div className="w-full space-y-2">
      {/* Counter row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Pulsing green dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
            Simulating
          </span>
        </div>
        <div className="flex items-center gap-1 tabular-nums">
          <span className={`text-base font-black ${isDark ? "text-white" : "text-neutral-900"}`}>
            {current.toLocaleString()}
          </span>
          <span className={`text-sm ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>/</span>
          <span className={`text-sm font-semibold ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
            {total.toLocaleString()}
          </span>
          <span className={`text-xs ml-1 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>runs</span>
        </div>
      </div>

      {/* Soccer field bar */}
      <div
        className={`relative w-full h-8 overflow-hidden border ${
          isDark ? "border-emerald-900/60 bg-emerald-950/30" : "border-emerald-300 bg-emerald-50"
        }`}
        title={`${pct}% complete`}
      >
        {/* Grass texture stripes */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${
                i % 2 === 0
                  ? isDark ? "bg-emerald-900/20" : "bg-emerald-100/60"
                  : isDark ? "bg-emerald-900/10" : "bg-emerald-50/60"
              }`}
            />
          ))}
        </div>

        {/* Filled progress fill */}
        <div
          className="absolute inset-y-0 left-0 transition-all duration-300 ease-out"
          style={{
            width: `${pct}%`,
            background: isDark
              ? "linear-gradient(90deg, rgba(16,185,129,0.35) 0%, rgba(20,184,166,0.25) 100%)"
              : "linear-gradient(90deg, rgba(16,185,129,0.25) 0%, rgba(20,184,166,0.15) 100%)",
          }}
        />

        {/* Center line */}
        <div
          className={`absolute inset-y-0 left-1/2 w-px ${
            isDark ? "bg-emerald-700/40" : "bg-emerald-400/50"
          }`}
        />

        {/* Rolling soccer ball */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-out z-10"
          style={{ left: `clamp(4px, calc(${pct}% - 14px), calc(100% - 52px))` }}
        >
          <span
            className="text-lg select-none"
            style={{
              display: "inline-block",
              animation: "soccerRoll 1.6s linear infinite",
              filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
            }}
          >
            ⚽
          </span>
        </div>

        {/* Goal Net Graphic with Yaw Perspective */}
        <div
          className="absolute right-1 top-1/2 -translate-y-1/2 select-none z-0"
          title={ballAtGoal ? "GOAL! 🥅" : "Goal net waiting..."}
        >
          {/* Goal flash burst when ball arrives */}
          {ballAtGoal && (
            <span
              className="absolute -left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-yellow-400 pointer-events-none"
              style={{ animation: "goalFlash 0.8s ease-out forwards" }}
            >
              GOAL!
            </span>
          )}
          <SoccerGoalSvg isDark={isDark} />
        </div>
      </div>
    </div>
  );
};
