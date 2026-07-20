import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import axios from "axios";

/**
 * Shared top bar for all admin pages.
 * title: page heading shown top-left (e.g. "Unified Visiting Faculty Management, IIPS, DAVV")
 * breadcrumb: array of strings, e.g. ["Admin", "Faculty Management"]
 */
export default function Topbar({
  title = "Unified Visiting Faculty Management, IIPS, DAVV",
  breadcrumb = [],
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending faculty count on mount
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
        const config = {
          headers: {
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json"
          }
        };
        
        // Using the pendingFaculty endpoint to get the count
        const res = await axios.get("http://localhost:5000/api/admin/pendingFaculty", config);
        
        // API returns { success: true, count: X, data: [...] }
        setPendingCount(res.data?.count || 0);
      } catch (error) {
        console.error("Failed to fetch pending faculty count", error);
        setPendingCount(0);
      }
    };

    fetchPendingCount();
  }, []);

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
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {/* Clean, simple red dot without the number */}
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
            </button>
            
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
                <p className="font-semibold text-slate-700 mb-2 border-b border-slate-100 pb-2">Notifications</p>
                <div className="py-5 text-center">
                  <p className="text-slate-600">
                    You have <strong className="text-blue-600 text-base">{pendingCount}</strong> pending faculty approval{pendingCount !== 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}