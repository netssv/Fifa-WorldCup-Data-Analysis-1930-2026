"use client";
import React from "react";

interface ExportPanelProps {
  userName: string;
  onNameChange: (name: string) => void;
  onExportJSON: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  userName,
  onNameChange,
  onExportJSON,
  onExportPNG,
  onExportPDF,
}) => (
  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 max-w-xl">
    <h3 className="text-base font-bold text-neutral-800 dark:text-white mb-1">Export Predictions</h3>
    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
      Download your full bracket as JSON, PNG image, or PDF document.
    </p>

    {/* Name input + JSON export */}
    <div className="flex flex-col sm:flex-row gap-3 mb-3">
      <input
        type="text"
        placeholder="Your name (optional)"
        value={userName}
        onChange={(e) => onNameChange(e.target.value)}
        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 text-sm flex-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      />
      <button
        onClick={onExportJSON}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 text-sm transition-all duration-150 active:scale-95 hover:shadow-md"
      >
        Export JSON
      </button>
    </div>

    {/* Visual export — PNG & PDF */}
    <div className="flex gap-2">
      <button
        onClick={onExportPNG}
        className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold px-4 py-2 text-xs transition-all duration-150 active:scale-95"
        title="Download bracket as PNG image"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Download PNG
      </button>
      <button
        onClick={onExportPDF}
        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 text-xs transition-all duration-150 active:scale-95 shadow-sm"
        title="Download bracket as PDF document"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Download PDF
      </button>
    </div>
  </div>
);
