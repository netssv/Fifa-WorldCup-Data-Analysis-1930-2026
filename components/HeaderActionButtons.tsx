import React from "react";

interface HeaderActionButtonsProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onSave: () => void;
  onReset: () => void;
}

const ThemeToggleIcon: React.FC<{ isDark: boolean }> = ({ isDark }) =>
  isDark ? (
    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464-4.95a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm-9.9 9.9a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm8.486-.707a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM4 11a1 1 0 100-2H3a1 1 0 100 2h1zm14-1a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM8.95 4.346a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zm8.486 8.486a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z"
        clipRule="evenodd"
      />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  );

/** Save, Reset, and Theme toggle buttons */
export const HeaderActionButtons: React.FC<HeaderActionButtonsProps> = ({
  isDark,
  onToggleTheme,
  onSave,
  onReset,
}) => (
  <div className="grid grid-cols-3 gap-2 w-full">
    {/* Theme Toggle */}
    <button
      onClick={onToggleTheme}
      className="py-2 px-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-150 dark:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-650 dark:text-neutral-300 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center rounded-sm"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <ThemeToggleIcon isDark={isDark} />
    </button>

    {/* Save Button */}
    <button
      onClick={onSave}
      className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 transition-all duration-150 text-xs cursor-pointer active:scale-95 hover:shadow-md hover:shadow-green-600/20 flex items-center justify-center rounded-sm"
    >
      Save
    </button>

    {/* Reset Button */}
    <button
      onClick={onReset}
      className="bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold py-2 px-3 border border-red-500/20 hover:border-red-500/40 transition-all duration-150 text-xs cursor-pointer active:scale-95 flex items-center justify-center rounded-sm"
    >
      Reset
    </button>
  </div>
);
