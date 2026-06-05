"use client";

import { useRef, useCallback, useImperativeHandle, useState } from "react";
import { BracketState, calculateMaxPoints, padArray } from "../lib/bracketLogic";
import type React from "react";
import { captureElementToCanvas } from "../lib/captureHelper";

export interface BracketSummaryHandle {
  exportPNG: () => void;
  exportPDF: () => void;
}

interface UseBracketSummaryProps {
  state: BracketState;
  ref: React.ForwardedRef<BracketSummaryHandle>;
}


export function useBracketSummary({ state, ref }: UseBracketSummaryProps) {
  const bracketRef = useRef<HTMLDivElement>(null);
  const maxPoints = calculateMaxPoints(state);
  const [layout, setLayout] = useState<"classic" | "compact">("compact");

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

  // Compact: 1100px gives the max-w-3xl (768px) content 166px of margin each side → centered
  // Classic: 1800px covers the full horizontal bracket tree without clipping
  const exportWidth = layout === "classic" ? 1800 : 1100;

  const handleExport = useCallback(
    async (format: "png" | "pdf") => {
      if (!bracketRef.current) return;

      try {
        const canvas = await captureElementToCanvas(bracketRef.current, exportWidth);

        if (format === "png") {
          const link = document.createElement("a");
          link.download = "fifa2026-bracket.png";
          link.href = canvas.toDataURL("image/png");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const { jsPDF } = await import("jspdf");
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
          const pageW = pdf.internal.pageSize.getWidth();
          const pageH = pdf.internal.pageSize.getHeight();
          const imgH = pageW / (canvas.width / canvas.height);
          const yOffset = Math.max(0, (pageH - imgH) / 2);
          pdf.addImage(imgData, "PNG", 0, yOffset, pageW, imgH);
          pdf.save("fifa2026-bracket.pdf");
        }
      } catch (err) {
        console.error(`Export ${format.toUpperCase()} failed:`, err);
        alert(
          `Export ${format.toUpperCase()} failed: ` +
            (err instanceof Error ? err.message : String(err))
        );
      }
    },
    [exportWidth]
  );

  useImperativeHandle(ref, () => ({
    exportPNG: () => handleExport("png"),
    exportPDF: () => handleExport("pdf"),
  }));

  return {
    bracketRef, maxPoints, layout, setLayout,
    leftR32, leftR16, leftR8, leftSemi,
    rightR32, rightR16, rightR8, rightSemi,
    semi, finalWinner, isComplete,
  };
}
