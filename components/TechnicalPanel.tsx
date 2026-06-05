import React from "react";

export const TechnicalPanel: React.FC = () => (
  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-none p-6 space-y-6">
    <div>
      <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-1.5 flex items-center gap-2">
        <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Technical Verification & Datasets
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Information about the active machine learning architecture and underlying datasets loaded in the backend.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Active Model Stack */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 rounded-none p-4.5 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
          Active Model Stack (V5)
        </span>
        <div className="space-y-2 text-sm text-neutral-650 dark:text-neutral-350">
          <p>
            <strong>ML Regressor:</strong>{" "}
            <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs">
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
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 rounded-none p-4.5 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
          Training & Feature Datasets
        </span>
        <div className="space-y-2 text-sm text-neutral-650 dark:text-neutral-350">
          <p>
            <strong>Matches:</strong>{" "}
            <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs">
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

    {/* Integrated Advanced Feature Datasets (V5 Active Pipeline) */}
    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-5">
      <h4 className="text-sm font-bold text-neutral-800 dark:text-white mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Integrated Advanced Feature Datasets (V5 Active Pipeline)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <RoadmapCard
          title="1. Squad Value"
          desc="Transfermarkt squad values."
          url="https://www.transfermarkt.com"
          details="Market valuation of the 26-man squads compiled from recent transfers and performance metrics. Helps the AI stack understand depth of talent."
        />
        <RoadmapCard
          title="2. EA FC Ratings"
          desc="Top-23 squad player ratings."
          url="https://www.ea.com/games/ea-sports-fc"
          details="Individual attribute and overall player ratings aggregated to team averages to quantify technical ability levels."
        />
        <RoadmapCard
          title="3. Venue Altitude"
          desc="Host stadium elevation wear factors."
          url="https://www.fifa.com"
          details="Elevation (meters) of match venues. High altitudes affect aerobic capacity and ball flight dynamics, modeled as fatigue multipliers."
        />
        <RoadmapCard
          title="4. xG Statistics"
          desc="Underlying expected goals parameters."
          url="https://fbref.com"
          details="Expected Goals (xG) metrics from qualifying cycles, capturing shot quality and chance generation instead of raw scorelines."
        />
        <RoadmapCard
          title="5. Market Odds"
          desc="Live bookmaker decimal odds implied probabilities."
          url="https://www.oddsportal.com"
          details="Implied win probabilities calculated from global bookmaker consensus, integrating market sentiment into the prediction blend."
        />
        <RoadmapCard
          title="6. Coach Experience"
          desc="National coach tenure and tournament records."
          url="https://www.transfermarkt.com"
          details="Quantitative coaching index evaluating historical World Cup matches managed, squad stability tenure, and championship win rates."
        />
        <RoadmapCard
          title="7. Fatigue & Match Load"
          desc="Days since last match and club match overload."
          url="https://fifpro.org"
          details="Cumulative minutes played by key starters during the preceding domestic season, predicting fatigue decay rates during match schedules."
        />
        <RoadmapCard
          title="8. Pressure & Key Matches"
          desc="Penalty shootout win rate, records vs top-20."
          url="https://www.fifa.com"
          details="Historic penalty shootout efficiency and head-to-head records against top 20 Elo oppositions, adjusting knockout match predictions."
        />
      </div>
    </div>
  </div>
);

const RoadmapCard: React.FC<{
  title: string;
  desc: string;
  url: string;
  details: string;
}> = ({ title, desc, url, details }) => {
  const [visible, setVisible] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!visible) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible]);

  return (
    <div className="p-3 bg-white dark:bg-neutral-950 border border-green-500/20 rounded-none relative overflow-visible group/card">
      <div className="absolute top-0 right-0 bg-green-500 text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-bl-md tracking-wider">
        Live
      </div>
      <div className="flex items-center gap-1.5 mb-1 mr-6" ref={containerRef}>
        <h5 className="font-bold text-neutral-700 dark:text-neutral-350 truncate">{title}</h5>
        <div className="relative inline-flex items-center">
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="w-3.5 h-3.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-[9px] font-black flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer flex-shrink-0"
            aria-label={`More info: ${title}`}
          >
            ?
          </button>
          {visible && (
            <div className="absolute left-0 bottom-6 z-50 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-3 text-[11px] text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed normal-case">
              <div className="font-bold text-xs text-neutral-800 dark:text-neutral-200 mb-1">{title}</div>
              <p className="mb-2 text-left">{details}</p>
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 mt-1.5 flex justify-between items-center">
                <span className="text-[10px] text-neutral-400">Data Source:</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                >
                  Visit Site
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <div className="absolute left-2.5 -bottom-1.5 w-3.5 h-3.5 bg-white dark:bg-neutral-900 border-r border-b border-neutral-200 dark:border-neutral-700 rotate-[45deg]" />
            </div>
          )}
        </div>
      </div>
      <p className="text-neutral-400 text-[11px] leading-tight">{desc}</p>
    </div>
  );
};
