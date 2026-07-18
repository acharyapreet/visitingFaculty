import { NavLink } from "react-router-dom";
import {
  IconGrid,
  IconUsers,
  IconClipboardCheck,
  IconCalendarCheck,
  IconReceipt,
  IconBarChart,
  IconLogOut,
} from "./icons";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: IconGrid },
  { to: "/admin/faculty", label: "Faculty Management", icon: IconUsers },
  { to: "/admin/subject-allocation", label: "Subject Allocation", icon: IconClipboardCheck },
  { to: "/admin/attendance", label: "Attendance Records", icon: IconCalendarCheck },
  { to: "/admin/billing", label: "Bill Generation", icon: IconReceipt },
  { to: "/admin/reports", label: "Reports", icon: IconBarChart },
];

export default function AdminSidebar({ portalLabel = "Admin Portal", adminName = "Admin User", adminRole = "Administrator", onSignOut }) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <IconGrid className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[15px] font-semibold leading-tight text-slate-900">IIPS</p>
            <p className="text-xs leading-tight text-slate-500">{portalLabel}</p>
          </div>
        </div>

        <p className="mb-2 px-2 text-[11px] font-medium tracking-wide text-slate-400">MAIN MENU</p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {adminName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium leading-tight text-slate-900">{adminName}</p>
            <p className="text-xs leading-tight text-slate-500">{adminRole}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          <IconLogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}