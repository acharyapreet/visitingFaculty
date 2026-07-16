import { IconMail, IconX } from "./icons";

/**
 * tone: "success" | "error"
 */
export default function StatusBanner({ tone = "success", title, subtitle, onDismiss }) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-600"
      : "bg-red-500";

  return (
    <div className={`flex items-center justify-between rounded-2xl ${toneClasses} px-5 py-4 text-white shadow-sm`}>
      <div className="flex items-center gap-3">
        <IconMail className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {subtitle ? <p className="text-xs text-white/85">{subtitle}</p> : null}
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
        aria-label="Dismiss"
      >
        <IconX />
      </button>
    </div>
  );
}