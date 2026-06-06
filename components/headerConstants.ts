import { Round } from "../lib/bracketLogic";

export const ROUND_OPTIONS: { value: Round | "all"; label: string }[] = [
  { value: "all",    label: "Entire Tournament" },
  { value: "groups", label: "Groups Only" },
  { value: "r32",   label: "Round of 32" },
  { value: "r16",   label: "Round of 16" },
  { value: "r8",    label: "Quarterfinals" },
  { value: "semi",  label: "Semifinals" },
  { value: "final", label: "Final Winner" },
];

export const LOG_POOL = [
  "Initializing ML prediction models...",
  "Fetching historical ELO database...",
  "Applying ELO adjustments & home advantage overrides...",
  "Analyzing head-to-head match histories...",
  "Computing Poisson goal distributions for Group Stage...",
  "Simulating Group Stage matches...",
  "Sorting group standings and qualifiers...",
  "Seeding Round of 32 brackets...",
  "Simulating Round of 32 matches...",
  "Seeding Round of 16 brackets...",
  "Simulating Round of 16 matches...",
  "Running Quarterfinal simulations...",
  "Running Semifinal simulations...",
  "Simulating Grand Final...",
  "Aggregating win probability percentages...",
  "Computing avg goals & goal difference stats...",
  "Saving final prediction state...",
];

// Generic simulation-level insights — NOT country-specific.
// Results vary based on live data and custom AI configuration,
// so insights here describe the simulation process, not predicted winners.
export const INSIGHTS_POOL = [
  "📊 ELO scoring model active — team ratings recalculated per match outcome.",
  "⚡ Poisson distribution applied to predict expected goals per group match.",
  "🧤 Penalty shootout logic engaged for knockout stages with equal probabilities.",
  "🔁 Monte Carlo method: each run is fully independent for unbiased sampling.",
  "📈 Form factor applied — recent match performance weighs on win probability.",
  "⚔️ Head-to-head historical records influence simulated rivalry match outcomes.",
  "🏟️ Home advantage ELO boost calculated for 2026 host nations: USA, Canada & Mexico.",
  "🔢 Chaos factor injects controlled randomness — upsets become more frequent.",
  "📉 Goal difference drives tiebreaker logic in Group Stage standings.",
  "🎯 Win probability converges closer to expected value with more simulation runs.",
  "🌍 48-team format: 12 groups of 4, top 2 + best 8 third-place qualify.",
  "⚙️ Boost override active — custom ELO adjustments applied to selected team.",
  "📦 Aggregating win counts across all runs to determine final champion probability.",
  "🧠 ML model considers avg goals, ELO delta, form, and knockout pressure index.",
  "🏆 Tournament winner is determined by the most frequent champion across all runs.",
];
