"use client";
import React from "react";

export const FifaTitleHeader: React.FC = () => {
  return (
    <div className="relative text-center py-10 overflow-hidden">
      {/* Subtle animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-pulse pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none" />

      {/* Trophy icon */}
      <div className="flex justify-center mb-3">
        <svg className="w-10 h-10 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L8 6H4v4c0 3.3 2.1 6.2 5.1 7.4L9 19H7v2h10v-2h-2l-.1-1.6C17.9 16.2 20 13.3 20 10V6h-4L12 2zm0 2.8L14.2 7H17v3c0 2.6-1.6 4.8-4 5.7L12 16.5l-1-0.8C8.6 14.8 7 12.6 7 10V7h2.8L12 4.8z"/>
        </svg>
      </div>

      {/* Official FIFA wordmark style */}
      <h1 className="relative font-black uppercase tracking-[0.15em] leading-none">
        <span className="block text-3xl sm:text-5xl md:text-6xl text-white dark:text-white">
          <span className="text-emerald-400">FIFA</span>
          {" "}
          <span className="text-white">World Cup</span>
        </span>
        <span className="block text-2xl sm:text-4xl md:text-5xl mt-1">
          <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            2026
          </span>
          {" "}
          <span className="text-white/90">Bracket Predictor</span>
        </span>
      </h1>

      {/* Official subtitle with FIFA-style dividers */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/50" />
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
          USA &middot; Canada &middot; Mexico &middot; Official Simulator
        </span>
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/50" />
      </div>
    </div>
  );
};
