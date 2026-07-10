import { NavLink } from "react-router-dom";
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
import { useState } from "react";
import { currentFaculty } from "../data/FacultyData";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/mark-attendance", label: "Mark Attendance", icon: CalendarCheck },
  { to: "/attendance-history", label: "Attendance History", icon: History },
  { to: "/view-bill", label: "View Bill", icon: FileText },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`
          }
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const initials = currentFaculty.name
    .replace("Dr. ", "")
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight text-brand-600">IIPS</p>
            <p className="text-[11px] leading-tight text-slate-500">Faculty Portal</p>
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-b border-slate-200 bg-white px-4 pb-4 lg:hidden">
          <NavItems onNavigate={() => setOpen(false)} />
          <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{currentFaculty.name}</p>
              <p className="text-xs text-slate-500">{currentFaculty.role}</p>
            </div>
          </div>
          <button className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-brand-600">IIPS</p>
            <p className="text-xs leading-tight text-slate-500">Faculty Portal</p>
          </div>
        </div>

        <NavItems />

        <div className="mt-auto">
          <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{currentFaculty.name}</p>
              <p className="text-xs text-slate-500">{currentFaculty.role}</p>
            </div>
          </div>
          <button className="mt-3 flex items-center gap-2 px-2 text-sm font-medium text-red-600 hover:text-red-700">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
