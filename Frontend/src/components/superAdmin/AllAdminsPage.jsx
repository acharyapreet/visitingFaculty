import React from "react";
import Topbar from "./Topbar";
import { Users, UserCheck, ClipboardList, Download, ChevronLeft, ChevronRight } from "lucide-react";

const stats = [
  { label: "Total Admins", value: 1, icon: Users, bg: "bg-blue-50", color: "text-blue-500" },
  { label: "Active Accounts", value: 1, icon: UserCheck, bg: "bg-green-50", color: "text-green-500" },
  { label: "Pending Review", value: 3, icon: ClipboardList, bg: "bg-amber-50", color: "text-amber-500" },
];

const admins = [
  {
    initial: "A",
    name: "Admin User (Default)",
    email: "admin@davv.ac.in",
    userId: "DAVV-ADM-2024-000",
    department: "Administration",
    designation: "System Administrator",
    approvedOn: "01 Apr 2024",
    role: "Admin",
    status: "Active",
    avatarBg: "bg-blue-100",
    avatarColor: "text-blue-600",
  },
  {
    initial: "D",
    name: "Dr. Suresh Gupta",
    email: "suresh.gupta@davv.ac.in",
    userId: "DAVV-ADM-2024-001",
    department: "Electronics",
    designation: "Professor",
    approvedOn: "19 Dec 2024",
    role: "Admin",
    status: "Active",
    avatarBg: "bg-purple-100",
    avatarColor: "text-purple-600",
  },
];

export default function AllAdminsPage() {
  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <Topbar title="All Admin Accounts" subtitle="All approved VFM System administrators" />

      <div className="px-8 py-8">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">All Admin Accounts</h1>
            <p className="text-gray-400">Active and approved VFM System administrators</p>
          </div>
          <button className="flex items-center gap-2 border border-gray-200 rounded-full px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center flex-1 min-w-[220px] border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-400">
              Search admins...
            </div>
            <div className="border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-500 min-w-[140px]">
              Select...
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 border-b border-gray-100">
                  <th className="py-3 pr-4 font-semibold">ADMIN NAME</th>
                  <th className="py-3 pr-4 font-semibold">USER ID</th>
                  <th className="py-3 pr-4 font-semibold">DEPARTMENT</th>
                  <th className="py-3 pr-4 font-semibold">DESIGNATION</th>
                  <th className="py-3 pr-4 font-semibold">APPROVED ON</th>
                  <th className="py-3 pr-4 font-semibold">ROLE</th>
                  <th className="py-3 pr-4 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.userId} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${a.avatarBg} ${a.avatarColor} flex items-center justify-center font-semibold text-sm`}
                        >
                          {a.initial}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{a.name}</div>
                          <div className="text-gray-400 text-xs">{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-purple-600 font-semibold text-sm">{a.userId}</td>
                    <td className="py-4 pr-4 text-gray-700 text-sm">{a.department}</td>
                    <td className="py-4 pr-4 text-gray-700 text-sm">{a.designation}</td>
                    <td className="py-4 pr-4 text-gray-700 text-sm">{a.approvedOn}</td>
                    <td className="py-4 pr-4">
                      <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                        {a.role}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
            <span className="text-sm text-gray-400">Showing 2 of 2 records</span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 text-sm font-semibold">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
