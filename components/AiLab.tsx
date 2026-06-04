import React from "react";
import { TEAM_FLAGS } from "../lib/bracketData";
import { Stage } from "../lib/apiClient";
import { useMatchSimulator } from "../hooks/useMatchSimulator";
import { SimulationResults } from "./SimulationResults";
import { TechnicalPanel } from "./TechnicalPanel";
import { TeamCompareCard } from "./TeamCompareCard";
import { TeamPathCard } from "./TeamPathCard";

export const AiLab: React.FC = () => {
  const {
    teamA,
    setTeamA,
    teamB,
    setTeamB,
    stage,
    setStage,
    isSimulating,
    simulationResult,
    simulationError,
    runSimulation,
    availableTeams,
  } = useMatchSimulator();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Match Simulator Control Panel */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2 flex items-center gap-2.5">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Match Simulator & Feature Inspector
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Compare statistics and query Random Forest ML models to estimate match outcomes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-6">
              <TeamSelector label="Team A" value={teamA} onChange={setTeamA} teams={availableTeams} keyPrefix="a" />
              <StageSelector value={stage} onChange={setStage} />
              <TeamSelector label="Team B" value={teamB} onChange={setTeamB} teams={availableTeams} keyPrefix="b" />
            </div>

            {/* Visual Versus Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-center mb-6">
              <div className="sm:col-span-3">
                <TeamCompareCard teamName={teamA} position="left" />
              </div>
              <div className="sm:col-span-1 flex justify-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border shadow-sm ${
                  isSimulating 
                    ? "bg-green-500 border-green-400 text-white animate-pulse-rotate" 
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"
                }`}>
                  VS
                </div>
              </div>
              <div className="sm:col-span-3">
                <TeamCompareCard teamName={teamB} position="right" />
              </div>
            </div>
          </div>

          <div>
            {simulationError && (
              <p className="text-red-500 dark:text-red-400 text-xs font-semibold mt-2 mb-4 flex items-center gap-1.5 animate-bounce">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {simulationError}
              </p>
            )}

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 shadow-md hover:shadow-green-500/20"
            >
              {isSimulating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Computing Odds...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Simulate Head-to-Head</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tournament Path Probability Analyzer */}
        <TeamPathCard />
      </div>

      {simulationResult && (
        <div className="animate-slide-down">
          <SimulationResults result={simulationResult} showDrawBar={stage === "group"} />
        </div>
      )}

      <TechnicalPanel />
    </div>
  );
};

/* ── Atomic selector sub-components ────────────────────────────────── */

interface TeamSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  teams: string[];
  keyPrefix: string;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ label, value, onChange, teams, keyPrefix }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors"
    >
      {teams.map((team) => (
        <option key={`${keyPrefix}-${team}`} value={team}>
          {TEAM_FLAGS[team]} {team}
        </option>
      ))}
    </select>
  </div>
);

const StageSelector: React.FC<{ value: Stage; onChange: (value: Stage) => void }> = ({ value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
      Stage / Pressure
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Stage)}
      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors"
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
