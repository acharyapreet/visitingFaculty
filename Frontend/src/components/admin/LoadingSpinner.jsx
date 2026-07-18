import React from "react";

/**
 * Reusable loading spinner.
 * size: "sm" | "md" | "lg"
 * fullPage: renders centered within a full-height container
 */
export default function LoadingSpinner({ size = "md", label = "Loading...", fullPage = false }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-blue-600 border-t-transparent animate-spin`}
        role="status"
        aria-label={label}
      />
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="flex items-center justify-center py-24 w-full">{spinner}</div>;
  }

  return spinner;
}
