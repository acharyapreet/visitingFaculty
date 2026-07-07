import React, { useState } from "react";
import Topbar from "./Topbar";

const tabs = ["General", "Security", "Email", "User ID Format", "Audit Log"];

const systemInfo = [
  { label: "System Version", value: "VFM v2.0.1" },
  { label: "Total Admin Requests", value: "5" },
  { label: "Approved Admins", value: "1" },
  { label: "Pending Reviews", value: "3" },
  { label: "Last Activity", value: "24 Dec 2024, 10:45 AM" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <Topbar
        title="Settings"
        subtitle="System-wide configuration, security and audit log"
      />

      <div className="px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-400 mb-6">
          System-wide configuration, security and audit log
        </p>

        {/* Tabs */}
        <div className="inline-flex bg-gray-100 rounded-full p-1 mb-6">
          {tabs.map((tab) => {
            const isAudit = tab === "Audit Log";
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {isAudit && (
                  <span className="text-gray-400 font-normal"> (3)</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex-1 max-w-2xl">
            <h3 className="font-bold text-gray-900 mb-6">Super Admin Account</h3>

            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Display Name
            </label>
            <input
              defaultValue="Super Admin"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-5 text-gray-800 outline-none focus:ring-2 focus:ring-purple-200"
            />

            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Email Address
            </label>
            <input
              defaultValue="superadmin@davv.ac.in"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-5 text-gray-800 outline-none focus:ring-2 focus:ring-purple-200"
            />

            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Mobile
            </label>
            <input
              defaultValue="+91 73123 00000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-6 text-gray-800 outline-none focus:ring-2 focus:ring-purple-200"
            />

            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Update Profile
            </button>
          </div>

          {/* Right card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex-1 max-w-md h-fit">
            <h3 className="font-bold text-gray-900 mb-6">System Information</h3>
            <div className="flex flex-col divide-y divide-gray-100">
              {systemInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3.5 first:pt-0"
                >
                  <span className="text-gray-400 text-sm">{item.label}</span>
                  <span className="text-gray-900 font-semibold text-sm">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
