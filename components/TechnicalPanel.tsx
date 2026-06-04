import React from "react";

/** Static panel showing the active ML stack, datasets, and features integration */
export const TechnicalPanel: React.FC = () => (
  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 space-y-6">
    <div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5 flex items-center gap-2">
        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Technical Verification & Datasets
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Information about the active machine learning architecture and underlying datasets loaded in the backend.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Active Model Stack */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4.5 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
          Active Model Stack (V2)
        </span>
        <div className="space-y-2 text-sm text-slate-650 dark:text-slate-350">
          <p>
            <strong>ML Regressor:</strong>{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              RandomForestRegressor (n_estimators=100)
            </code>
          </p>
          <p>
            <strong>Prediction Goal Blend:</strong> 35% Random Forest predicted goals,
            65% ELO & Form expected goals formula (Ensemble blend).
          </p>
          <p>
            <strong>Probability Curve:</strong> Poisson PMF simulation across goal grids
            (0 to 6 goals) to estimate probabilities and resolve draws.
          </p>
        </div>
      </div>

      {/* Datasets Used */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4.5 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
          Training & Feature Datasets
        </span>
        <div className="space-y-2 text-sm text-slate-650 dark:text-slate-350">
          <p>
            <strong>Historical Matches:</strong>{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              clean_fifa_worldcup_matches.csv
            </code>{" "}
            (contains over 970 historical World Cup matches from 1930 to 2022).
          </p>
          <p>
            <strong>FIFA World Rankings / ELO Ratings:</strong> Standardized FIFA ratings
            mapped for all 48 teams in Group stage setup.
          </p>
          <p>
            <strong>Recent Form & Head-to-Head:</strong> Stored statistics mapped from
            recent fixtures.
          </p>
        </div>
      </div>
    </div>

    {/* Roadmap for Increasing Confidence */}
    <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Integrated Advanced Feature Datasets (V2 Model Status)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <RoadmapCard
          title="1. Squad Value (Transfermarkt)"
          description="Integrated. Player market valuations are aggregated per squad. Highly correlated with cup advancement."
          active={true}
        />
        <RoadmapCard
          title="2. EA FC 26 Player Ratings"
          description="Integrated. Ratings of the top 23 squad players in the latest database are mapped to evaluate team potential."
          active={true}
        />
        <RoadmapCard
          title="3. Venue Altitude & Climate"
          description="Integrated. Altitude parameters mapped for all 2026 host venues (e.g. Mexico City at 2,240m) to calculate wear factors."
          active={true}
        />
      </div>
    </div>
  </div>
);

/* ── Atomic sub-component ──────────────────────────────────────────── */

const RoadmapCard: React.FC<{ title: string; description: string; active?: boolean }> = ({
  title,
  description,
  active = false,
}) => (
  <div className={`p-3 bg-white dark:bg-slate-950 border rounded-lg transition-colors relative overflow-hidden ${
    active ? "border-green-500/30 dark:border-green-500/20" : "border-slate-200/60 dark:border-slate-800"
  }`}>
    {active && (
      <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-md tracking-wider">
        Active
      </div>
    )}
    <h5 className="font-bold text-slate-700 dark:text-slate-350 mb-1">{title}</h5>
    <p className="text-slate-400">{description}</p>
  </div>
);
