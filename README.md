# FIFA World Cup 2026 Predictor & AI Lab

An advanced **Machine Learning** project that predicts and simulates the **FIFA World Cup 2026** results, from group stages to the final champion! ⚽🔥

This repository features a trained Python ML model stack coupled with a premium, fully interactive web dashboard built in React, Next.js, and TypeScript to visualize predictions, custom strategy overrides, and statistical simulation runs.

---

## 🚀 Key Features & Interactive Lab

### 1️⃣ Interactive Tournament Bracket

- **Dual Views:** Switch between a swipeable **Compact (Vertical)** timeline and a **Classic (Horizontal)** tree.
- **Premium Export System:** Render and download your full prediction brackets as high-fidelity **PNG** or **PDF** files with clean formatting (no scrollbars, no clipped margins, and zero overlaps even on mobile viewports).

### 2️⃣ Tournament Simulation Engine

- **Deterministic Single Runs:** Select `1 Run (Fast)` for pure, data-driven predictions. The UI clearly displays predicted match outcomes and championship flags.
- **Probabilistic Multi-Runs:** Run `100` to `5000+` simulation cycles. The simulator aggregates tournament outcomes to generate realistic win rates and statistical distributions.
- **Most Representative Simulation Path (New):** Instead of selecting a random representative run or only focusing on the final champion, the simulator tracks the frequency/probability of each team reaching every single stage (groups, round of 32, round of 16, quarterfinals, semifinals, and final) across all runs. It scores each run based on these cumulative frequencies, ensuring the returned summary bracket represents the path with the highest probability/representativeness while maintaining 100% logical tree integrity.
- **Chaos Factor Selector:** Introduce a custom chaos slider (0% to 100%) to elevate the likelihood of upsets and simulate unpredictable matches.
- **Favored Team ELO Boost:** Select any team to grant them a custom ELO advantage (up to +500 ELO) to model home-court advantage, crowd support, or bias.
- **UX Simplicity:** Custom buttons open settings instantly, and a single "Reset to Defaults" option restores clean data-driven models.

### 3️⃣ Feature Pipeline & Verification Inspector

- **ML Blend (V6):** Integrates 35% Random Forest predicted goals with a 65% ELO & Form expected goals formula, resolved via Poisson grid mass simulation.
- **Integrated Advanced Datasets:** Click-to-toggle information tooltips featuring direct reference links (e.g., Transfermarkt, EA Sports FC, FBref, FIFPRO) to inspect the 10 underlying feature pipelines:
  1. **Squad Value** (depth of talent valuations)
  2. **EA FC Ratings** (aggregated player card ratings)
  3. **Venue Altitude** (wear factors of stadium elevations)
  4. **xG Statistics** (qualifier expected goals performance)
  5. **Market Odds** (implied bookmaker consensus probabilities)
  6. **Coach Experience** (manager tenure and championship indexes)
  7. **Fatigue & Match Load** (cumulative season workloads)
  8. **Pressure & Shootouts** (historic penalty win rates and top-20 records)
  9. **Macroeconomics & Social Factors** (World Bank GDP per capita PPP + population weighted by football cultural index)
  10. **Elite Attackers Talent** (Goldman Sachs methodology: counting players per national squad in top-50 European goalscorer rankings, capped at 4)

### 4️⃣ Premium UX & Animations

- **Unified Floating Trophy:** Floating gold trophy header animated in tandem with centered orbiting particles and a soft diffused halo glow.
- **Harmonious Dark Mode:** Responsive layout using a deep soccer-pitch theme with vibrant emerald, violet, and gold accents.

---

## 🛠️ Technology Stack

### Frontend & Dashboard (Web App)

- **Framework:** React / Next.js / TypeScript
- **Styling:** Tailwind CSS (curated HSL palettes, glassmorphism, responsive grid layouts)
- **Libraries:** `html-to-image` (offscreen headless renderer for PNG exports), `jspdf` (for PDF reports)

### Machine Learning & Data Pipeline (Python API)

- **Core:** Python / Pandas / NumPy
- **Scraping:** BeautifulSoup (Wikipedia historical match data 1930-2022)
- **Modeling:** XGBoost Poisson regression for goal prediction
- **Simulation:** Statistical probability modeling, Poisson match simulation, and penalty shootout resolution
- **Evaluation:** Holdout calibration metrics, Elo & market odds benchmark comparison, and feature importance explainability

### API Enhancements

- **Match explainability:** `POST /predict/match` now returns benchmark probability baselines and model confidence.
- **Feature importance:** `GET /model/feature-importance` exposes the top ranked XGBoost features for home and away goal models.
- **Seeded brackets:** `GET /predict/bracket/full` and `/predict/bracket/stream` now accept an optional `seed` parameter for reproducible simulations.
- **Evaluation:** Holdout calibration metrics, Elo/odds baseline comparison, and probability reliability checks

---

## 🔒 API Limits & Costs

- **No Paid APIs:** This project does not use any paid services or external subscription-based APIs.
- **No Call Limits:** All predictions and simulations (even up to 1,000,000 runs only locally) are computed using optimized Python code and pre-trained models.
- **Free & Public Data Sources:** The macroeconomic data is retrieved once from the free, public [World Bank API](http://api.worldbank.org/v2/) and cached locally. All historical data, ELO ratings, squad values, and betting odds benchmarks are bundled directly inside the project's static data files, meaning zero external dependency rate limits or API key requirements at runtime.
