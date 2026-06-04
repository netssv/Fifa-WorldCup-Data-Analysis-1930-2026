import React, { useState, useRef, useEffect } from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
import { Stage } from "../lib/apiClient";
import { useTeamWinProbs } from "../hooks/useTeamWinProbs";

/* ── TeamSelector — custom dropdown with search + win% badge ─────── */
interface TeamSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  teams: string[];
  accentColor?: "emerald" | "blue";
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  label, value, onChange, teams, accentColor = "emerald",
}) => {
  const winProbs = useTeamWinProbs();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ring = accentColor === "blue" ? "focus:ring-blue-500" : "focus:ring-emerald-500";
  const badgeColor = accentColor === "blue"
    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
    : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300";

  const filtered = teams.filter((t) =>
    t.toLowerCase().includes(query.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (team: string) => {
    onChange(team);
    setOpen(false);
    setQuery("");
  };

  const prob = winProbs[value];

  return (
    <div className="space-y-1.5 relative" ref={ref}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          {label}
        </label>
        {prob !== undefined && (
          <span className={`text-[10px] font-black px-2 py-0.5 ${badgeColor}`}>
            {(prob * 100).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-none px-3 py-2.5 text-sm font-semibold text-left flex items-center justify-between gap-2 focus:ring-2 ${ring} focus:outline-none transition-colors hover:border-slate-300 dark:hover:border-slate-700`}
      >
        <span className="flex items-center gap-2 truncate">
          <span className="truncate">{value}</span>
        </span>
        <svg className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none shadow-2xl overflow-hidden animate-slide-down">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search team…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 rounded-none px-3 py-1.5 text-sm focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-slate-400 text-center">No teams found</li>
            ) : (
              filtered.map((team) => {
                const p = winProbs[team];
                const isSelected = team === value;
                return (
                  <li key={team}>
                    <button
                      type="button"
                      onClick={() => select(team)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 text-left ${
                        isSelected ? "bg-emerald-50 dark:bg-emerald-900/20 font-bold" : "font-medium"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-slate-800 dark:text-slate-200">{team}</span>
                      </span>
                      {p !== undefined ? (
                        <span className={`text-[10px] font-black rounded-none px-1.5 py-0.5 flex-shrink-0 ${
                          p > 0.15 ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" :
                          p > 0.08 ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" :
                          "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                          {(p * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 dark:text-slate-700">—%</span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ── StageSelector ────────────────────────────────────────────────── */
export const StageSelector: React.FC<{ value: Stage; onChange: (value: Stage) => void }> = ({ value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
      Stage / Pressure
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Stage)}
      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-none px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors"
    >
      <option value="group">Group Stage</option>
      <option value="r32">Round of 32</option>
      <option value="r16">Round of 16</option>
      <option value="r8">Quarterfinals</option>
      <option value="semi">Semifinals</option>
      <option value="final">Final Match</option>
    </select>
  </div>
);
