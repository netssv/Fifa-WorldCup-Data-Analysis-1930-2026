"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Round } from "../lib/bracketLogic";
import { AdvancedSettingsPanel } from "./AdvancedSettingsPanel";
import { ProgressBar } from "./ProgressBar";
import { SimRunsSelector } from "./SimRunsSelector";
import { HeaderActionButtons } from "./HeaderActionButtons";
import { SoccerProgress } from "./SoccerProgress";
import { ROUND_OPTIONS, LOG_POOL, INSIGHTS_POOL } from "./headerConstants";
import { fetchDataSources } from "../lib/apiClient";

// Returns HH:MM:SS in the user's local timezone (not UTC)
const localTime = () =>
  new Date().toLocaleTimeString("en-GB", { hour12: false });

interface BracketHeaderProps {
  completedRoundsCount: number;
  aiLoading: boolean;
  onAiAutoFill: (upToRound: Round | "all") => void;
  onSave: () => void;
  onReset: () => void;
  chaosFactor: number;
  setChaosFactor: (v: number) => void;
  boostTeam: string;
  setBoostTeam: (v: string) => void;
  boostAmount: number;
  setBoostAmount: (v: number) => void;
  simRuns: number;
  setSimRuns: (v: number) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  simProgress: { current: number; total: number };
}

export const BracketHeader: React.FC<BracketHeaderProps> = ({
  completedRoundsCount,
  aiLoading,
  onAiAutoFill,
  onSave,
  onReset,
  chaosFactor,
  setChaosFactor,
  boostTeam,
  setBoostTeam,
  boostAmount,
  setBoostAmount,
  simRuns,
  setSimRuns,
  isDark,
  onToggleTheme,
  simProgress,
}) => {
  const [targetRound, setTargetRound]     = useState<Round | "all">("all");
  const [showSettings, setShowSettings]   = useState(false);
  const [showRawLogs, setShowRawLogs]     = useState(false);
  const [logs, setLogs]                   = useState<string[]>([]);
  const logsContainerRef                  = useRef<HTMLDivElement>(null);
  const [consoleHeight, setConsoleHeight] = useState(192);
  const isDraggingRef                     = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const startY = e.clientY;
    const startHeight = consoleHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(120, Math.min(600, startHeight + deltaY));
      setConsoleHeight(newHeight);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [consoleHeight]);

  const hasActiveOverrides =
    chaosFactor > 0 || (boostTeam !== "" && boostAmount > 0) || simRuns > 1;

  const handleToggleSettings = useCallback(
    () => setShowSettings((prev) => !prev),
    []
  );

  useEffect(() => {
    if (!aiLoading || simProgress.current === 0) return;
    const ts      = localTime();
    const logIdx  = (simProgress.current - 1) % LOG_POOL.length;
    const prefix  = simProgress.total > 1
      ? `[SIM ${simProgress.current}/${simProgress.total}]`
      : "[SYSTEM]";
    const baseLog = `${ts} ${prefix} ${LOG_POOL[logIdx]}`;

    if (simProgress.current % 4 === 0) {
      const insightIdx = Math.floor(Math.random() * INSIGHTS_POOL.length);
      setLogs((prev) => [...prev, baseLog, `${ts} [INSIGHT] ${INSIGHTS_POOL[insightIdx]}`]);
    } else {
      setLogs((prev) => [...prev, baseLog]);
    }
  }, [simProgress.current, aiLoading, simProgress.total]);

  useEffect(() => {
    if (!aiLoading) return;
    const ts = localTime();
    // Show base config immediately
    const baseLines = [
      `${ts} [CONFIG] Initializing AI simulation tournament pipeline...`,
      `${ts} [CONFIG] Total Simulation Runs: ${simRuns}`,
      `${ts} [CONFIG] Target Scope: ${targetRound.toUpperCase()}`,
      `${ts} [CONFIG] Chaos Factor (Predictive Randomness): ${Math.round(chaosFactor * 100)}%`,
      boostTeam
        ? `${ts} [CONFIG] Boost Team: ${boostTeam} (+${boostAmount} ELO)`
        : `${ts} [CONFIG] Boost Team: None`,
      `${ts} [CONFIG] ──────────────────────────────────────────────────`,
      `${ts} [DATA]   Fetching active data sources from backend...`,
    ];
    setLogs(baseLines);

    // Fetch real data source status from the API
    fetchDataSources()
      .then((sources) => {
        const icon = (loaded: boolean) => loaded ? "✅" : "⚠️ ";
        const fmt  = (s: { loaded: boolean; teams: number; label: string }) =>
          `${icon(s.loaded)} ${s.label}${s.loaded ? ` (${s.teams} teams)` : " — not loaded"}`;
        const dataLines = [
          `${ts} [DATA]   ── Feature Sets ─────────────────────────────`,
          `${ts} [DATA]   ${fmt(sources.squad_value)}`,
          `${ts} [DATA]   ${fmt(sources.ea_fc_ratings)}`,
          `${ts} [DATA]   ${fmt(sources.xg_stats)}`,
          `${ts} [DATA]   ${fmt(sources.market_odds)}`,
          `${ts} [DATA]   ${fmt(sources.coach_exp)}`,
          `${ts} [DATA]   ${fmt(sources.fatigue)}`,
          `${ts} [DATA]   ${fmt(sources.pressure)}`,
          `${ts} [DATA]   RF Models: ${sources.models_loaded ? "✅ Loaded" : "⚠️  Not loaded — using statistical fallback"}`,
          `${ts} [CONFIG] ──────────────────────────────────────────────────`,
        ];
        setLogs((prev) => [...prev, ...dataLines]);
      })
      .catch(() => {
        setLogs((prev) => [...prev, `${ts} [WARN]  Could not fetch data source status from backend.`]);
      });
  }, [aiLoading, simRuns, targetRound, chaosFactor, boostTeam, boostAmount]);

  useEffect(() => {
    if (showRawLogs && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, showRawLogs]);

  return (
    <div
      className={`relative border shadow-xl overflow-visible transition-colors duration-300 ${
        isDark
          ? "bg-neutral-900/95 text-white border-neutral-800"
          : "bg-white text-neutral-900 border-neutral-200"
      }`}
    >
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 px-5 py-4">
        <ProgressBar
          completedRoundsCount={completedRoundsCount}
          hasActiveOverrides={hasActiveOverrides}
        />

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {aiLoading ? (
            <div className="flex-1 min-w-[280px] max-w-[400px]">
              <SoccerProgress
                current={simProgress.current}
                total={simProgress.total}
                isDark={isDark}
              />
            </div>
          ) : (
            <>
              <select
                value={targetRound}
                onChange={(e) => setTargetRound(e.target.value as Round | "all")}
                className={`border text-xs font-semibold px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors w-full sm:w-auto ${
                  isDark
                    ? "bg-neutral-800 border-neutral-700 text-neutral-200 hover:border-neutral-600"
                    : "bg-neutral-100 border-neutral-300 text-neutral-700 hover:border-neutral-400"
                }`}
              >
                {ROUND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className={isDark ? "bg-neutral-900" : "bg-white"}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <SimRunsSelector
                simRuns={simRuns}
                setSimRuns={setSimRuns}
                aiLoading={false}
                showSettings={showSettings}
                onToggleSettings={handleToggleSettings}
              />
            </>
          )}

          {aiLoading ? (
            <button
              onClick={() => setShowRawLogs((v) => !v)}
              className={`flex-shrink-0 text-[10px] uppercase font-bold tracking-wider px-3 py-2 border transition-all cursor-pointer flex items-center gap-1.5 ${
                showRawLogs
                  ? isDark
                    ? "bg-emerald-950/50 border-emerald-700 text-emerald-400"
                    : "bg-emerald-50 border-emerald-400 text-emerald-700"
                  : isDark
                    ? "bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-emerald-700 hover:text-emerald-400"
                    : "bg-neutral-100 border-neutral-300 text-neutral-500 hover:border-emerald-400 hover:text-emerald-600"
              }`}
              title="Show raw simulation console"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3" />
              </svg>
              {showRawLogs ? "Hide Logs" : "Raw Logs"}
            </button>
          ) : (
            <button
              onClick={() => onAiAutoFill(targetRound)}
              className="relative bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 transition-all duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:shadow-lg hover:shadow-emerald-600/25 group overflow-hidden w-full sm:w-auto"
              title="Simulate Tournament with AI"
            >
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span>Simulate</span>
            </button>
          )}

          <div className="relative h-8 hidden sm:flex items-center justify-center px-2">
            <div className={`w-px h-8 ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`} />
            <span
              className={`absolute text-[10px] select-none transition-all duration-300 ${
                aiLoading
                  ? "animate-spin text-emerald-500 scale-110"
                  : "text-neutral-400 hover:scale-125 cursor-help"
              }`}
              title={aiLoading ? "Simulating bracket..." : "System ready"}
            >
              ⚽
            </span>
          </div>

          <HeaderActionButtons
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            onSave={onSave}
            onReset={onReset}
          />
        </div>
      </div>

      <div
        className={`w-full overflow-hidden transition-all duration-300 ease-in-out border-t ${
          aiLoading && showRawLogs ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0 border-t-0"
        } ${
          isDark
            ? "bg-neutral-950 border-neutral-800"
            : "bg-neutral-50 border-neutral-200"
        }`}
      >
        <div
          ref={logsContainerRef}
          className={`overflow-y-auto px-5 py-3 font-mono text-xs space-y-1 select-none custom-scrollbar transition-colors duration-300 ${
            isDark ? "text-emerald-400" : "text-emerald-800"
          }`}
          style={{ height: `${consoleHeight}px` }}
        >
          {logs.length === 0 ? (
            <span className="text-neutral-500 italic">Waiting for first run...</span>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed hover:text-emerald-300 transition-colors">{log}</div>
            ))
          )}
        </div>
        {/* Full-width drag handle bar */}
        <div
          onMouseDown={handleMouseDown}
          className={`w-full h-2.5 cursor-ns-resize flex items-center justify-center border-t select-none transition-colors group ${
            isDark
              ? "border-neutral-800 bg-neutral-900/50 hover:bg-emerald-950/40 active:bg-emerald-900/40"
              : "border-neutral-200 bg-neutral-100/50 hover:bg-emerald-50 active:bg-emerald-100"
          }`}
          title="Drag to resize console"
        >
          <div className="w-8 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-emerald-500/60 transition-colors" />
        </div>
      </div>

      {showSettings && !aiLoading && (
        <AdvancedSettingsPanel
          chaosFactor={chaosFactor}
          setChaosFactor={setChaosFactor}
          boostTeam={boostTeam}
          setBoostTeam={setBoostTeam}
          boostAmount={boostAmount}
          setBoostAmount={setBoostAmount}
        />
      )}
    </div>
  );
};
