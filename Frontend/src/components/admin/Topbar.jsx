import React, { useState } from "react";
import { Search, Bell } from "lucide-react";

/**
 * Shared top bar for all admin pages.
 * title: page heading shown top-left (e.g. "Unified Visiting Faculty Management, IIPS, DAVV")
 * breadcrumb: array of strings, e.g. ["Admin", "Faculty Management"]
 * onSearch: optional callback(value) fired as the user types
 */
export default function Topbar({
  title = "Unified Visiting Faculty Management, IIPS, DAVV",
  breadcrumb = [],
  onSearch,
  showSearch = true,
}) {
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {breadcrumb.length > 0 && (
            <nav className="text-xs text-slate-400 mb-1 flex items-center gap-1 truncate">
              {breadcrumb.map((crumb, idx) => (
                <span key={crumb} className="flex items-center gap-1">
                  {idx > 0 && <span>/</span>}
                  <span className={idx === breadcrumb.length - 1 ? "text-slate-600 font-medium" : ""}>
                    {crumb}
                  </span>
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-blue-600 font-semibold text-base sm:text-lg truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {showSearch && (
            <div className="relative hidden sm:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search..."
                className="w-56 lg:w-72 pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
                <p className="font-semibold text-slate-700 mb-2">Notifications</p>
                <p className="text-slate-400 text-xs py-6 text-center">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
