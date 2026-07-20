import { useState, useEffect } from "react";
import { FileText, BookX } from "lucide-react";
import PageHeader from "./shared/PageHeader";
import Sidebar from "./shared/Sidebar"; 

// Import your sub-pages here:
import MarkAttendance from "./MarkAttendance";
import AttendanceHistory from "./AttendanceHistory";
import ViewBill from "./ViewBill";

// 1. We extract your Dashboard Homepage UI into its own local component
function DashboardOverview({ facultyInfo, allocatedSubjects, onNavigate }) {
  return (
    <div className="flex flex-1 flex-col min-w-0">
      <PageHeader title="Unified Visiting Faculty Management, IIPS, DAVV" />
      <div className="px-4 py-6 sm:px-8">
        <h2 className="text-2xl font-bold text-slate-900">{facultyInfo.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {facultyInfo.month} · Session {facultyInfo.session}
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">My Allocated Subjects</h3>
            <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-medium text-slate-600">
              Session {facultyInfo.session}
            </span>
          </div>

          {allocatedSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
                <BookX className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Subjects Allocated</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                You have not been assigned any subjects for the current session yet. Please check back later once the administrator has allocated your courses.
              </p>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-slate-500">
               {/* Map your allocated subjects table here as shown previously */}
               Your allocated subjects will appear here.
            </div>
          )}
        </div>

        <button 
          disabled={allocatedSubjects.length === 0}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm font-semibold text-[#004DD2] transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          Download Schedule PDF
        </button>
      </div>
    </div>
  );
}


// 2. The Main Layout Container
export default function FacultyDashboard({ onSignOut }) {
  // Local state to manage sub-navigation within the Faculty Portal
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const [allocatedSubjects, setAllocatedSubjects] = useState([]);
  const [facultyInfo, setFacultyInfo] = useState({
    name: "Loading...",
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    session: "2026-27"
  });

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
    if (session.userId) {
      setFacultyInfo(prev => ({ 
        ...prev, 
        id: session.userId,
        name: session.fullName 
      }));
    }
  }, []);

  // Helper function to render the correct view based on Sidebar clicks
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview facultyInfo={facultyInfo} allocatedSubjects={allocatedSubjects} onNavigate={setActiveTab} />;
      case "mark-attendance":
        return <MarkAttendance />;
      case "attendance-history":
        return <AttendanceHistory />;
      case "view-bill":
        return <ViewBill />;
      default:
        return <DashboardOverview facultyInfo={facultyInfo} allocatedSubjects={allocatedSubjects} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#F8F9FB]">
      <Sidebar 
        onNavigate={setActiveTab} 
        currentView={activeTab} 
        onSignOut={onSignOut} 
      />
      
      {/* Right Content Area dynamically changes based on renderContent() */}
      <div className="flex flex-1 flex-col min-w-0">
        {renderContent()}
      </div>
    </div>
  );
}