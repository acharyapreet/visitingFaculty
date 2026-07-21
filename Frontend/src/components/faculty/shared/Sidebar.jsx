import {
  LayoutGrid,
  CalendarCheck,
  History,
  FileText,
  LogOut,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { view: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { view: "mark-attendance", label: "Mark Attendance", icon: CalendarCheck },
  { view: "attendance-history", label: "Attendance History", icon: History },
  { view: "view-bill", label: "View Bill", icon: FileText },
];

function NavItems({ onNavigate, currentView, onClose }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ view, label, icon: Icon }) => (
        <button
          key={view}
          onClick={() => {
            onNavigate(view);
            if (onClose) onClose();
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
            currentView === view
              ? "bg-[#004DD2] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function Sidebar({ onNavigate, currentView = "dashboard", onSignOut }) {
  const [open, setOpen] = useState(false);
  const [facultyName, setFacultyName] = useState("Loading...");
  const [facultyRole, setFacultyRole] = useState("Faculty");

  // Fetch the dynamic user data on mount
  useEffect(() => {
    const sessionStr = localStorage.getItem('iipsCurrentSession');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        // Uses fullName if available, otherwise falls back to their User ID
        setFacultyName(session.fullName || "Visiting Faculty");
        if (session.role) {
          setFacultyRole(session.role.charAt(0).toUpperCase() + session.role.slice(1));
        }
      } catch (e) {
        console.error("Error parsing session data", e);
      }
    }
  }, []);

  // Dynamically calculate initials from the fetched name
  const initials = facultyName
    .replace("Dr. ", "")
    .replace("Prof. ", "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004DD2] text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight text-[#004DD2]">IIPS</p>
            <p className="text-[11px] leading-tight text-slate-500">Faculty Portal</p>
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute inset-x-0 top-[61px] z-50 border-b border-slate-200 bg-white px-4 pb-4 shadow-lg lg:hidden">
          <NavItems onNavigate={onNavigate} currentView={currentView} onClose={() => setOpen(false)} />
          <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-[#004DD2]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{facultyName}</p>
              <p className="text-xs text-slate-500">{facultyRole}</p>
            </div>
          </div>
          <button onClick={onSignOut} className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004DD2] text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-[#004DD2]">IIPS</p>
            <p className="text-xs leading-tight text-slate-500">Faculty Portal</p>
          </div>
        </div>

        <NavItems onNavigate={onNavigate} currentView={currentView} />

        <div className="mt-auto">
          <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-[#004DD2]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{facultyName}</p>
              <p className="text-xs text-slate-500">{facultyRole}</p>
            </div>
          </div>
          <button onClick={onSignOut} className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}