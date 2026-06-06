import React from "react";

export const FifaFooter: React.FC = () => {
  return (
    <footer className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-500 dark:text-neutral-400 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-left md:text-right max-w-7xl mx-auto px-1">
        <div className="text-left space-y-1">
          <p className="font-semibold text-neutral-600 dark:text-neutral-300">Under the Hood</p>
          <p className="max-w-xl leading-relaxed">
            Frontend built with Next.js 16, React 19, and Tailwind CSS. Machine Learning backend powered by Python, FastAPI, Pandas, Scikit-learn, and XGBoost models running on Railway.
          </p>
        </div>
        <div className="text-right md:self-end">
          <p className="text-neutral-400 dark:text-neutral-500">
            copyleft rodrigo martel
          </p>
        </div>
      </div>
    </footer>
  );
};
