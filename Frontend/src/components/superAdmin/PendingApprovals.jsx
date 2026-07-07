import React, { useState } from "react";
import Topbar from "./Topbar";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";

const tabs = [
  { key: "pending", label: "Pending", count: 3 },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const requests = [
  {
    id: "AR001",
    initial: "D",
    name: "Dr. Vikram Sharma",
    email: "vikram.sharma@davv.ac.in",
    department: "Computer Science",
    designation: "Head of Department",
    employeeId: "DAVV-EMP-1042",
    submitted: "20 Dec 2024",
    status: "Pending",
    avatarBg: "bg-purple-100",
    avatarColor: "text-purple-600",
  },
  {
    id: "AR002",
    initial: "P",
    name: "Prof. Kavita Mishra",
    email: "kavita.mishra@davv.ac.in",
    department: "Mathematics",
    designation: "Assistant Professor",
    employeeId: "DAVV-EMP-0983",
    submitted: "19 Dec 2024",
    status: "Pending",
    avatarBg: "bg-purple-100",
    avatarColor: "text-purple-600",
  },
];

export default function PendingApprovalsPage() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <Topbar
        title="Pending Admin Approvals"
        subtitle="Review, approve or reject admin registration requests"
      />

      <div className="px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Admin Registration Approvals
        </h1>
        <p className="text-gray-400 mb-6">
          Review, approve, or reject pending admin account requests
        </p>

        {/* Tabs */}
        <div className="inline-flex bg-gray-100 rounded-full p-1 mb-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.count && (
                  <span className="bg-amber-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div className="flex items-center flex-1 min-w-[260px] border border-gray-200 rounded-full px-4 py-2.5 gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                Search by name, email or Employee ID...
              </span>
            </div>
            <span className="text-sm text-gray-400 whitespace-nowrap">3 records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 border-b border-gray-100">
                  <th className="py-3 pr-4 font-semibold">REGISTRATION ID</th>
                  <th className="py-3 pr-4 font-semibold">ADMIN NAME</th>
                  <th className="py-3 pr-4 font-semibold">DEPARTMENT</th>
                  <th className="py-3 pr-4 font-semibold">EMPLOYEE ID</th>
                  <th className="py-3 pr-4 font-semibold">SUBMITTED</th>
                  <th className="py-3 pr-4 font-semibold">STATUS</th>
                  <th className="py-3 pr-4 font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0 align-top">
                    <td className="py-5 pr-4 text-gray-700 text-sm">{r.id}</td>
                    <td className="py-5 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${r.avatarBg} ${r.avatarColor} flex items-center justify-center font-semibold text-sm shrink-0`}
                        >
                          {r.initial}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{r.name}</div>
                          <div className="text-gray-400 text-xs">{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 pr-4 text-sm">
                      <div className="text-gray-800">{r.department}</div>
                      <div className="text-gray-400 text-xs">{r.designation}</div>
                    </td>
                    <td className="py-5 pr-4 text-gray-700 text-sm">{r.employeeId}</td>
                    <td className="py-5 pr-4 text-gray-700 text-sm">{r.submitted}</td>
                    <td className="py-5 pr-4">
                      <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-5 pr-4">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 text-gray-500 text-sm font-medium hover:text-gray-700">
                          <Eye className="w-4 h-4" />
                          Details
                        </button>
                        <button className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
