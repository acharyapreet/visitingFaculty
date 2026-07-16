const VARIANTS = {
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-500",
  Allocated: "bg-blue-50 text-blue-600",
  "Allocate Subject": "bg-red-50 text-red-600",
  "Pending Verification": "bg-amber-100 text-amber-700",
};

export default function StatusBadge({ label, className = "" }) {
  const variant = VARIANTS[label] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${variant} ${className}`}>
      {label}
    </span>
  );
}