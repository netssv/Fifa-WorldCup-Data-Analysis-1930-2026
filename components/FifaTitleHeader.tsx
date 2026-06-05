"use client";
import React from "react";

/** Pulsing dot that orbits the center */
const OrbitDot: React.FC<{ delay: string }> = ({ delay }) => (
  <span
    className="absolute w-2 h-2 rounded-full bg-emerald-400/80 animate-orbit top-1/2 left-1/2 -ml-1 -mt-1 z-20"
    style={{ animationDelay: delay }}
  />
);

/** Floating trophy with soft diffused glow and centered orbiting particles */
const FloatingTrophy: React.FC = () => (
  <div className="relative flex justify-center mb-6">
    {/* Inner wrapper containing trophy, halo, and orbits floating in unison */}
    <div className="relative w-28 h-28 flex items-center justify-center animate-float">
      {/* Soft diffused halo glow */}
      <span className="absolute w-20 h-20 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-md border border-emerald-500/10 z-0" />

      {/* Orbiting particles */}
      <OrbitDot delay="0s" />
      <OrbitDot delay="-3s" />

      {/* Trophy icon */}
      <svg
        className="w-12 h-12 text-amber-400 relative z-10 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L8 6H4v4c0 3.3 2.1 6.2 5.1 7.4L9 19H7v2h10v-2h-2l-.1-1.6C17.9 16.2 20 13.3 20 10V6h-4L12 2zm0 2.8L14.2 7H17v3c0 2.6-1.6 4.8-4 5.7L12 16.5l-1-.8C8.6 14.8 7 12.6 7 10V7h2.8L12 4.8z" />
      </svg>
    </div>
  </div>
);

/** Animated shimmer sweep on the "WORLD CUP" text */
const ShimmerTitle: React.FC = () => (
  <h1 className="relative font-black uppercase tracking-[0.15em] leading-none select-none">
    {/* Row 1: FIFA — colored + World Cup adaptive */}
    <span className="block text-3xl sm:text-5xl md:text-6xl">
      <span className="text-emerald-500 dark:text-emerald-400">FIFA</span>
      {" "}
      <span
        className="text-neutral-800 dark:text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          backgroundRepeat: "no-repeat",
          WebkitBackgroundClip: "text",
        }}
      >
        WORLD CUP
      </span>
    </span>

    {/* Row 2: 2026 (gold shimmer) + AI Predictor */}
    <span className="block text-2xl sm:text-4xl md:text-5xl mt-1">
      <span
        className="animate-text-shimmer"
        style={{
          background:
            "linear-gradient(90deg, #F59E0B 0%, #FDE68A 40%, #F59E0B 60%, #D97706 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        2026
      </span>
      {" "}
      <span className="text-neutral-700 dark:text-neutral-200">
        AI BRACKET PREDICTOR
      </span>
    </span>
  </h1>
);

/** Divider line with host country badges */
const HostBadges: React.FC = () => (
  <div className="flex items-center justify-center gap-3 mt-5">
    <span className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-500/40" />
    <div className="flex items-center gap-2">
      {[
        { flag: "🇺🇸", name: "USA" },
        { flag: "🇨🇦", name: "Canada" },
        { flag: "🇲🇽", name: "Mexico" },
      ].map(({ flag, name }, i) => (
        <React.Fragment key={name}>
          {i > 0 && (
            <span className="text-neutral-300 dark:text-neutral-600 text-xs">·</span>
          )}
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <span className="text-sm">{flag}</span>
            {name}
          </span>
        </React.Fragment>
      ))}
    </div>
    <span className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-500/40" />
  </div>
);

export const FifaTitleHeader: React.FC = () => (
  <div className="relative text-center py-10 overflow-hidden">
    {/* Soft radial glow — blends with any background, no visible box */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(16,185,129,0.07) 0%, transparent 100%)",
      }}
    />

    <FloatingTrophy />
    <ShimmerTitle />
    <HostBadges />
  </div>
);
