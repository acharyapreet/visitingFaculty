import React from "react";

/**
 * Generic dashboard summary card.
 * icon: lucide icon component
 * value / label: main stat
 * tone: "blue" | "green" | "amber" | "red" | "slate"
 */
const toneMap = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function DashboardCard({ icon: Icon, label, value, tone = "blue", suffix }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      {Icon && (
        <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-xl font-semibold text-slate-800 truncate">
          {value}
          {suffix && <span className="text-sm font-normal text-slate-400 ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
