import React from "react";
import {
  LayoutGrid,
  Users,
  BookOpen,
  ClipboardCheck,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";

// Changed 'to' paths to 'id' strings that match the switch cases in AdminDashboard.jsx
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "faculty-management", label: "Faculty Management", icon: Users },
  { id: "subject-allocation", label: "Subject Allocation", icon: BookOpen },
  { id: "attendance-records", label: "Attendance Records", icon: ClipboardCheck },
  { id: "bill-generation", label: "Bill Generation", icon: FileText },
  { id: "reports", label: "Reports", icon: BarChart2 },
  { id: "settings", label: "Settings", icon: Settings },
];

// Added our custom router props
export default function Sidebar({ activeTab, setActiveTab, onSignOut }) {
  
  // Read from your unified session state instead of the old "adminUser" key
  const admin = JSON.parse(localStorage.getItem("iipsCurrentSession") || "{}") || {
    name: "Admin User",
    role: "Administrator",
    avatar: null,
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
          <GraduationCap size={20} />
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-slate-900 text-sm">IIPS</p>
          <p className="text-xs text-slate-400">Admin Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-slate-400">
          MAIN MENU
        </p>
        <ul className="space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              {/* Changed NavLink to a standard button that updates our activeTab state */}
              <button
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer / Profile */}
      <div className="border-t border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          {admin.avatar ? (
            <img
              src={admin.avatar}
              alt={admin.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
              {admin.name?.charAt(0) ?? "A"}
            </div>
          )}
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-800">{admin.name || "Admin"}</p>
            {/* Standardized role display based on your global auth */}
            <p className="text-xs text-slate-400 capitalize">{admin.role || "Administrator"}</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 px-2 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}