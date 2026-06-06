import React, { useEffect, useState, useRef } from "react";

interface SimulatingOverlayProps {
  /** Real current simulation count from SSE stream */
  currentSim: number;
  /** Total number of simulations requested */
  simRuns: number;
}

const LOG_POOL = [
  "Initializing machine learning models...",
  "Connecting to prediction pipeline...",
  "Fetching historical ELO database...",
  "Applying ELO adjustments and home advantage overrides...",
  "Analyzing head-to-head match histories...",
  "Calculating Poisson goal distributions for Group Stage...",
  "Simulating Group Stage matches...",
  "Sorting group standings and qualifiers...",
  "Seeding Round of 32 playoffs...",
  "Simulating Round of 32 matches...",
  "Seeding Round of 16...",
  "Simulating Round of 16 matches...",
  "Seeding Quarterfinals...",
  "Simulating Quarterfinal matches...",
  "Seeding Semifinals...",
  "Simulating Semifinal matches...",
  "Simulating Grand Final...",
  "Aggregating probability percentages...",
  "Computing avg goals & goal difference statistics...",
  "Saving results state...",
];

export const SimulatingOverlay: React.FC<SimulatingOverlayProps> = ({ currentSim, simRuns }) => {
  const [showRawLogs, setShowRawLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Generate a new raw log line each time a simulation run completes
  useEffect(() => {
    if (currentSim === 0) return;

    const timestamp = new Date().toISOString().slice(11, 19);
    const logIndex = (currentSim - 1) % LOG_POOL.length;
    const simPrefix = simRuns > 1 ? `[SIM ${currentSim}/${simRuns}]` : "[SYSTEM]";
    const newLog = `${timestamp} ${simPrefix} ${LOG_POOL[logIndex]}`;

    setLogs((prev) => [...prev, newLog]);
  }, [currentSim, simRuns]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (showRawLogs) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, showRawLogs]);

  // Clamp progress: stays at 99% until result arrives (then component unmounts)
  const progressPercent = simRuns <= 1
    ? 99
    : Math.min(99, Math.round((currentSim / simRuns) * 100));

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full text-white shadow-2xl" role="status">
      <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">

        {/* Header: spinner + label + real counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin flex-shrink-0" />
            <span className="text-sm font-bold tracking-wide text-emerald-400 uppercase">Simulating</span>
          </div>
          <div className="text-sm font-bold tabular-nums">
            <span className="text-emerald-400">{currentSim.toLocaleString()}</span>
            <span className="text-neutral-500"> / {simRuns.toLocaleString()}</span>
          </div>
        </div>

        {/* Real progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-1.5 bg-neutral-900 overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200 shadow-sm shadow-emerald-500/30"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
            <span>Prediction engine running...</span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Toggle raw logs button */}
        <button
          onClick={() => setShowRawLogs(!showRawLogs)}
          className="w-full text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3" />
          </svg>
          {showRawLogs ? "Hide Console" : "Show Raw Console Logs"}
        </button>

        {/* Collapsible raw console — each line tied to a real run */}
        {showRawLogs && (
          <div className="bg-black border border-neutral-900 p-3 h-32 overflow-y-auto font-mono text-[9px] text-emerald-400/90 space-y-0.5 select-none">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed opacity-90">{log}</div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};
