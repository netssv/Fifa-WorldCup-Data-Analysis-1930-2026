"use client";
import React from "react";

interface ExportPanelProps {
  userName: string;
  onNameChange: (name: string) => void;
  onExport: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  userName,
  onNameChange,
  onExport,
}) => (
  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 max-w-xl">
    <h3 className="text-base font-bold text-neutral-800 dark:text-white mb-1">Export Predictions</h3>
    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
      Download your full bracket as a JSON file to share or analyze.
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder="Your name (optional)"
        value={userName}
        onChange={(e) => onNameChange(e.target.value)}
        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 text-sm flex-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      />
      <button
        onClick={onExport}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 text-sm transition-all duration-150 active:scale-95 hover:shadow-md"
      >
        Export JSON
      </button>
    </div>
  </div>
);
