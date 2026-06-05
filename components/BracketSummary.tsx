"use client";
import React, { useRef, useCallback } from "react";
import { BracketState, calculateMaxPoints } from "../lib/bracketLogic";
import { BracketColumn, Connector, CenterTrophy } from "./BracketTreeComponents";

interface BracketSummaryProps {
  state: BracketState;
}

const padArray = (arr: string[], len: number): string[] => {
  const res = [...arr];
  while (res.length < len) res.push("");
  return res;
};

// ── Main BracketSummary ───────────────────────────────────────────────
export const BracketSummary: React.FC<BracketSummaryProps> = ({ state }) => {
  const bracketRef = useRef<HTMLDivElement>(null);
  const maxPoints = calculateMaxPoints(state);

  const r32 = padArray(state.r32, 16);
  const r16 = padArray(state.r16, 8);
  const r8 = padArray(state.r8, 4);
  const semi = padArray(state.semi, 2);
  const finalWinner = state.final || "";

  const leftR32 = r32.slice(0, 8);
  const leftR16 = r16.slice(0, 4);
  const leftR8 = r8.slice(0, 2);
  const leftSemi = semi.slice(0, 1);

  const rightR32 = r32.slice(8, 16);
  const rightR16 = r16.slice(4, 8);
  const rightR8 = r8.slice(2, 4);
  const rightSemi = semi.slice(1, 2);

  const isComplete = r32.filter(Boolean).length > 0;

  // ── Export as PNG ───────────────────────────────────────────────────
  const handleExportImage = useCallback(async () => {
    if (!bracketRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(bracketRef.current, {
        backgroundColor: "#0b131a",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = "fifa2026-bracket.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export image failed:", err);
    }
  }, []);

  // ── Export as PDF ───────────────────────────────────────────────────
  const handleExportPDF = useCallback(async () => {
    if (!bracketRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(bracketRef.current, {
        backgroundColor: "#0b131a",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgH = pageW / ratio;
      const yOffset = Math.max(0, (pageH - imgH) / 2);
      pdf.addImage(imgData, "PNG", 0, yOffset, pageW, imgH);
      pdf.save("fifa2026-bracket.pdf");
    } catch (err) {
      console.error("Export PDF failed:", err);
    }
  }, []);

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
            Tournament Bracket
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Full visual tree of your predicted results.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Points</div>
            <div className="text-2xl font-black text-emerald-500">
              {maxPoints}<span className="text-sm text-neutral-400 font-normal"> / 138</span>
            </div>
          </div>

          {/* Export buttons */}
          {isComplete && (
            <div className="flex gap-2">
              <button
                onClick={handleExportImage}
                className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold px-3 py-2 text-xs transition-all duration-150 active:scale-95"
                title="Download as PNG image"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                PNG
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-2 text-xs transition-all duration-150 active:scale-95 shadow-sm hover:shadow-red-600/20"
                title="Download as PDF document"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!isComplete && (
        <div className="py-24 text-center">
          <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-bold text-neutral-400 dark:text-neutral-500 mb-2">No selections yet</h3>
          <p className="text-sm text-neutral-400 dark:text-neutral-600">
            Complete your bracket or press <strong className="text-emerald-500">Simulate</strong> to auto-fill.
          </p>
        </div>
      )}

      {/* ── Visual Bracket Tree ── */}
      {isComplete && (
        <div className="overflow-x-auto p-4 sm:p-6 bg-neutral-50 dark:bg-[#080f14] transition-colors duration-300" ref={bracketRef}>
          <div
            className="flex items-stretch gap-0 justify-center"
            style={{ minWidth: "940px" }}
          >
            {/* LEFT BRANCH */}
            <BracketColumn title="Round of 32" teams={leftR32} advancers={leftR16} />
            <Connector />
            <BracketColumn title="Round of 16" teams={leftR16} advancers={leftR8} />
            <Connector />
            <BracketColumn title="Quarters" teams={leftR8} advancers={leftSemi} />
            <Connector />
            <BracketColumn title="Semifinal" teams={[leftSemi[0] || "", ""]} advancers={semi} />

            {/* CENTER */}
            <CenterTrophy semi={semi} finalWinner={finalWinner} />

            {/* RIGHT BRANCH (mirrored) */}
            <BracketColumn title="Semifinal" teams={[rightSemi[0] || "", ""]} advancers={semi} />
            <Connector />
            <BracketColumn title="Quarters" teams={rightR8} advancers={rightSemi} />
            <Connector />
            <BracketColumn title="Round of 16" teams={rightR16} advancers={rightR8} />
            <Connector />
            <BracketColumn title="Round of 32" teams={rightR32} advancers={rightR16} />
          </div>
        </div>
      )}
    </div>
  );
};
