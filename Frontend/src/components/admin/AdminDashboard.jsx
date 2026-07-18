import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Users, Clock } from "lucide-react";

// Components
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import PendingFacultyTable from "./PendingFacultyTable";
import DashboardCard from "./DashboardCard";
import adminApi from "../../api/adminApi";

// Her other pages (imported so we can route to them dynamically)
import FacultyManagement from "./FacultyManagement";
import SubjectAllocation from "./SubjectAllocation";
import AttendanceRecords from "./AttendanceRecords";
import BillGeneration from "./BillGeneration";

const SESSION = "2026-27";

export default function AdminDashboard({ onSignOut }) {
  // 1. BULLETPROOF ROUTER FOR ADMIN TABS
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  // Dashboard Specific State
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Use your global session instead of her hardcoded "adminUser"
  const admin = JSON.parse(localStorage.getItem("iipsCurrentSession") || "{}") || { name: "Admin" };

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.getPendingFaculty();
      setPendingFaculty(Array.isArray(data) ? data : data?.faculty ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load pending faculty.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchPending();
    }
  }, [fetchPending, activeTab]);

  const filteredFaculty = useMemo(() => {
    if (!search.trim()) return pendingFaculty;
    const q = search.toLowerCase();
    return pendingFaculty.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.uvfin?.toLowerCase().includes(q) ||
        f.uvfinId?.toLowerCase().includes(q)
    );
  }, [pendingFaculty, search]);

  const monthLabel = useMemo(
    () => new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    []
  );

  // 2. DYNAMIC CONTENT RENDERER
  const renderContent = () => {
    switch (activeTab) {
      case 'faculty-management': return <FacultyManagement />;
      case 'subject-allocation': return <SubjectAllocation />;
      case 'attendance-records': return <AttendanceRecords />;
      case 'bill-generation': return <BillGeneration />;
      case 'dashboard':
      default:
        return (
          <main className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Welcome {admin.name || "Admin"}
                </h1>
                <p className="text-sm text-slate-400">Here's the overview for {monthLabel}</p>
              </div>
              <button className="self-start sm:self-auto px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-600">
                Session {SESSION}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                icon={Users}
                label="Pending Registrations"
                value={pendingFaculty.length}
                tone="amber"
              />
              <DashboardCard icon={Clock} label="Session" value={SESSION} tone="blue" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-800">
                    Faculty Remaining for Registration approval
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                    {pendingFaculty.length}
                  </span>
                </div>
                {/* CHANGED: Replaced <a> tag with button to prevent page reload */}
                <button
                  onClick={() => setActiveTab('faculty-management')}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-500 px-6 py-4">{error}</p>
              )}

              <PendingFacultyTable
                faculty={filteredFaculty}
                loading={loading}
                onChanged={fetchPending}
              />
            </div>
          </main>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Pass routing props down to the Sidebar so it can control the navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={onSignOut} />
      <div className="flex-1 min-w-0">
        <Topbar onSearch={setSearch} />
        {renderContent()}
      </div>
    </div>
  );
}