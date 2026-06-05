"use client";

import React, { useRef, useCallback, useImperativeHandle } from "react";
import { BracketState, calculateMaxPoints, padArray } from "../lib/bracketLogic";

export interface BracketSummaryHandle {
  exportPNG: () => void;
  exportPDF: () => void;
}

interface UseBracketSummaryProps {
  state: BracketState;
  ref: React.ForwardedRef<BracketSummaryHandle>;
}

/**
 * Wraps window.getComputedStyle in a Proxy that intercepts lab/oklch/oklab/lch
 * color values and converts them to browser-resolved RGB before html2canvas sees them.
 * Returns a cleanup function that restores the original getComputedStyle.
 */
function patchGetComputedStyleForExport(): () => void {
  const original = window.getComputedStyle.bind(window);
  const labPattern = /\b(lab|oklch|oklab|lch)\s*\(/i;

  // Temp element used to resolve lab() → rgb() via the browser's native engine
  const tempEl = document.createElement("div");
  tempEl.style.display = "none";
  document.body.appendChild(tempEl);

  const resolveToRgb = (colorStr: string): string => {
    try {
      tempEl.style.color = "";
      tempEl.style.color = colorStr;
      // Use the ORIGINAL getComputedStyle — not our proxy
      const resolved = original(tempEl).color;
      if (resolved && !labPattern.test(resolved)) return resolved;
    } catch { /* fallback below */ }
    return "rgb(128, 128, 128)";
  };

  window.getComputedStyle = (el: Element, pseudoEl?: string | null) => {
    const style = original(el, pseudoEl);
    return new Proxy(style, {
      get(target, prop) {
        if (prop === "getPropertyValue") {
          return (propertyName: string) => {
            const val = target.getPropertyValue(propertyName);
            if (val && labPattern.test(val)) return resolveToRgb(val);
            return val;
          };
        }
        const val = target[prop as any];
        if (typeof val === "function") return (val as any).bind(target);
        if (typeof val === "string" && labPattern.test(val)) return resolveToRgb(val);
        return val;
      }
    }) as any;
  };

  return () => {
    window.getComputedStyle = original;
    tempEl.parentNode?.removeChild(tempEl);
  };
}

export function useBracketSummary({ state, ref }: UseBracketSummaryProps) {
  const bracketRef = useRef<HTMLDivElement>(null);
  const maxPoints = calculateMaxPoints(state);

  const r32 = padArray(state.r32, 16), r16 = padArray(state.r16, 8);
  const r8 = padArray(state.r8, 4), semi = padArray(state.semi, 2);
  const finalWinner = state.final || "";

  const leftR32 = r32.slice(0, 8), leftR16 = r16.slice(0, 4);
  const leftR8 = r8.slice(0, 2), leftSemi = semi.slice(0, 1);
  const rightR32 = r32.slice(8, 16), rightR16 = r16.slice(4, 8);
  const rightR8 = r8.slice(2, 4), rightSemi = semi.slice(1, 2);

  const isComplete = r32.filter(Boolean).length > 0;

  const handleExportImage = useCallback(async () => {
    if (!bracketRef.current) return;
    const cleanup = patchGetComputedStyleForExport();
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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export image failed:", err);
      alert("Export PNG failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      cleanup();
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (!bracketRef.current) return;
    const cleanup = patchGetComputedStyleForExport();
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
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgHeight = pageWidth / ratio;
      const yOffset = Math.max(0, (pageHeight - imgHeight) / 2);
      pdf.addImage(imgData, "PNG", 0, yOffset, pageWidth, imgHeight);
      pdf.save("fifa2026-bracket.pdf");
    } catch (err) {
      console.error("Export PDF failed:", err);
      alert("Export PDF failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      cleanup();
    }
  }, []);

  useImperativeHandle(ref, () => ({
    exportPNG: handleExportImage,
    exportPDF: handleExportPDF,
  }));

  return {
    bracketRef, maxPoints,
    leftR32, leftR16, leftR8, leftSemi,
    rightR32, rightR16, rightR8, rightSemi,
    semi, finalWinner, isComplete,
  };
}
