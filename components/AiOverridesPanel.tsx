import React from "react";
import { Tooltip } from "./AiTooltip";

interface OverridesProps {
  customEnabled: boolean;
  setCustomEnabled: (val: boolean) => void;
  teamA: string;
  teamB: string;
  eloA: number; setEloA: (val: number) => void;
  eloB: number; setEloB: (val: number) => void;
  formA: number; setFormA: (val: number) => void;
  formB: number; setFormB: (val: number) => void;
  penaltyA: number; setPenaltyA: (val: number) => void;
  penaltyB: number; setPenaltyB: (val: number) => void;
  bigMatchA: number; setBigMatchA: (val: number) => void;
  bigMatchB: number; setBigMatchB: (val: number) => void;
  knockoutA: number; setKnockoutA: (val: number) => void;
  knockoutB: number; setKnockoutB: (val: number) => void;
  isAutoFilling: boolean;
  autoFillError: string;
  onAutoFill: () => void;
}

export const AiOverridesPanel: React.FC<OverridesProps> = (p) => {
  return (
    <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="custom-ai-overrides"
            checked={p.customEnabled}
            onChange={(e) => p.setCustomEnabled(e.target.checked)}
            className="w-4 h-4 accent-emerald-500 cursor-pointer"
          />
          <label htmlFor="custom-ai-overrides" className="text-sm font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
            Custom AI Parameter Overrides
          </label>
          <div className="group relative">
            <span className="text-[10px] text-neutral-400 cursor-help border-b border-dashed border-neutral-300 dark:border-neutral-600">
              What's this?
            </span>
            <div className="absolute left-0 top-5 z-40 hidden group-hover:block w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-3 text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              When enabled, you can manually override the AI's default statistical parameters for each team. 
              This lets you simulate scenarios like "what if Brazil had even better recent form?" without changing the data.
              <br/><br/>
              <strong className="text-emerald-600 dark:text-emerald-400">Use AI Auto Fill</strong> to populate values directly from the API.
            </div>
          </div>
        </div>

        {/* AI Auto Fill Button */}
        <button
          type="button"
          onClick={p.onAutoFill}
          disabled={p.isAutoFilling}
          className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 transition-all duration-200 shadow-sm hover:shadow-violet-400/30 active:scale-95 cursor-pointer"
        >
          {p.isAutoFilling ? (
            <>
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Fetching AI Data…
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
              </svg>
              AI Auto Fill
            </>
          )}
        </button>
      </div>

      {p.autoFillError && (
        <p className="text-xs text-red-500 dark:text-red-400 mb-3 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          {p.autoFillError}
        </p>
      )}

      {/* Sliders panel */}
      {p.customEnabled && (
        <div className="space-y-4 p-4 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800 rounded-none">
          {/* Column headers */}
          <div className="grid grid-cols-2 gap-6 text-center border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">{p.teamA}</span>
            <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400">{p.teamB}</span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Slider label="ELO Rating" val={p.eloA} onChange={p.setEloA} min={1000} max={2200} step={10} />
            <Slider label="ELO Rating" val={p.eloB} onChange={p.setEloB} min={1000} max={2200} step={10} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Slider label="Recent Form" val={p.formA} onChange={p.setFormA} min={0} max={1} step={0.05} pct />
            <Slider label="Recent Form" val={p.formB} onChange={p.setFormB} min={0} max={1} step={0.05} pct />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Slider label="Penalty Win Rate" val={p.penaltyA} onChange={p.setPenaltyA} min={0} max={1} step={0.05} pct />
            <Slider label="Penalty Win Rate" val={p.penaltyB} onChange={p.setPenaltyB} min={0} max={1} step={0.05} pct />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Slider label="Big-Match Record" val={p.bigMatchA} onChange={p.setBigMatchA} min={0} max={1} step={0.05} pct />
            <Slider label="Big-Match Record" val={p.bigMatchB} onChange={p.setBigMatchB} min={0} max={1} step={0.05} pct />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Slider label="Knockout Win Rate" val={p.knockoutA} onChange={p.setKnockoutA} min={0} max={1} step={0.05} pct />
            <Slider label="Knockout Win Rate" val={p.knockoutB} onChange={p.setKnockoutB} min={0} max={1} step={0.05} pct />
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Atomic Slider with Tooltip ───────────────────────────────────── */
interface SliderProps {
  label: string;
  val: number;
  onChange: (val: number) => void;
  min: number; max: number; step: number;
  pct?: boolean;
}

const Slider: React.FC<SliderProps> = ({ label, val, onChange, min, max, step, pct }) => (
  <div className="space-y-1 text-left">
    <div className="flex justify-between items-center text-xs font-bold text-neutral-500 dark:text-neutral-400 gap-1">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="truncate">{label}</span>
        <Tooltip paramKey={label} />
      </div>
      <span className="text-neutral-800 dark:text-white flex-shrink-0">
        {pct ? `${Math.round(val * 100)}%` : val}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={val}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-none appearance-none cursor-pointer accent-emerald-500"
    />
  </div>
);
