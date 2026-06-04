import React from "react";

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
          Active Model Stack (V5)
        </span>
        <div className="space-y-2 text-sm text-slate-650 dark:text-slate-350">
          <p>
            <strong>ML Regressor:</strong>{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              RandomForestRegressor (n_estimators=100)
            </code>
          </p>
          <p>
            <strong>Prediction Blend:</strong> 35% Random Forest predicted goals,
            65% ELO & Form expected goals formula (Ensemble blend).
          </p>
          <p>
            <strong>Poisson simulation:</strong> 0 to 6 goal grid mass resolution for draws and win rates.
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
            <strong>Matches:</strong>{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              clean_fifa_worldcup_matches.csv
            </code>
          </p>
          <p>
            <strong>FIFA ELO / Form / H2H:</strong> Baseline team capabilities and head-to-head match histories.
          </p>
          <p>
            <strong>Sim parameters:</strong> Fully dynamic parameter overrides enabled for custom simulations.
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
        Integrated Advanced Feature Datasets (V5 Active Pipeline)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <RoadmapCard title="1. Squad Value" desc="Transfermarkt squad values." />
        <RoadmapCard title="2. EA FC Ratings" desc="Top-23 squad player ratings." />
        <RoadmapCard title="3. Venue Altitude" desc="Host stadium elevation wear factors." />
        <RoadmapCard title="4. xG Statistics" desc="Underlying expected goals parameters." />
        <RoadmapCard title="5. Market Odds" desc="Live bookmaker decimal odds implied probabilities." />
        <RoadmapCard title="6. Coach Experience" desc="National coach tenure and tournament records." />
        <RoadmapCard title="7. Fatigue & Match Load" desc="Days since last match and club match overload." />
        <RoadmapCard title="8. Pressure & Key Matches" desc="Penalty shootout win rate, records vs top-20." />
      </div>
    </div>
  </div>
);

const RoadmapCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="p-3 bg-white dark:bg-slate-950 border border-green-500/20 rounded-lg relative overflow-hidden">
    <div className="absolute top-0 right-0 bg-green-500 text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-bl-md tracking-wider">
      Live
    </div>
    <h5 className="font-bold text-slate-700 dark:text-slate-350 mb-1">{title}</h5>
    <p className="text-slate-400 text-[11px] leading-tight">{desc}</p>
  </div>
);
