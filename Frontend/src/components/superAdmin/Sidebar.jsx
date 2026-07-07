import React from "react";
import { ShieldCheck, ClipboardList, Users, Settings, LogOut } from "lucide-react";

const navItems = [
  { key: "pending", label: "Pending Approvals", icon: ClipboardList, badge: 3 },
  { key: "admins", label: "All Admins", icon: Users },
  { key: "settings", label: "Settings", icon: Settings, dot: true },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="w-full md:w-[280px] shrink-0 bg-white border-r border-gray-200 flex flex-col justify-between min-h-screen">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-purple-600 font-bold text-lg leading-tight">DAVV</div>
            <div className="text-gray-400 text-sm leading-tight">Super Admin</div>
          </div>
        </div>

        {/* Menu */}
        <div className="px-4 pt-5">
          <p className="text-xs font-semibold tracking-wider text-gray-400 px-2 mb-3">
            SUPER ADMIN MENU
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = active === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-full border text-[15px] font-medium transition-colors
                    ${
                      isActive
                        ? "bg-purple-50 border-gray-900 text-purple-600"
                        : "bg-white border-transparent text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-purple-600" : "text-gray-400"
                      }`}
                    />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="bg-amber-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {item.dot && (
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 border-t border-gray-100 pt-5">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-gray-900 font-semibold text-sm leading-tight">
              Super Admin
            </div>
            <div className="text-gray-400 text-xs leading-tight">
              System Administrator
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-2 text-red-500 font-semibold text-sm hover:text-red-600">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
