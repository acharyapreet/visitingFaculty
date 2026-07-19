import React, { useEffect, useState } from "react";
import { 
  X, 
  ShieldCheck, 
  User, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Check,
  Briefcase,
  AlertTriangle
} from "lucide-react";
import adminApi from "../../api/adminApi";
import LoadingSpinner from "./LoadingSpinner";

export default function FacultyModal({ userId, onClose, onActionSuccess ,initialView = "profile" }) {
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Navigation State to switch between Profile, Approve, and Reject views
  const [currentView, setCurrentView] = useState(initialView); // "profile" | "approve" | "reject"
  

  // Action States
  const [uvfin, setUvfin] = useState("");
  const [checks, setChecks] = useState({ docs: false, head: false });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!userId) return;

    (async () => {
      setLoading(true);
      try {
        const data = await adminApi.getFacultyById(userId);
        if (active) setFaculty(data?.data ?? data?.faculty ?? data);
      } catch (err) {
        if (active) setError("Failed to load faculty profile.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [userId]);

  const displayName = faculty?.full_name || faculty?.name || "Unknown Faculty";

const handleApproveSubmit = async () => {
    if (!checks.docs || !checks.head) return alert("Please confirm all pre-approval checks.");
    
    setActionLoading(true);
    try {
      // FIX: Changed faculty.email back to userId for the API call
      await adminApi.approveFaculty(userId, uvfin);
      
      // SEND DATA TO DASHBOARD BANNER
      if (onActionSuccess) {
        onActionSuccess({
          type: 'approve',
          name: displayName,
          // Keep faculty.email here so the banner still displays it correctly!
          email: faculty?.email || "Unknown Email", 
          uvfin: uvfin || 'Pending'
        });
      } 
      onClose();
    } catch (err) {
      alert("Approval failed: " + (err.response?.data?.message || err.message || "Unknown Error"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return alert("Please provide a reason for rejection.");
    
    setActionLoading(true);
    try {
      // FIX: Changed faculty.email back to userId for the API call
      await adminApi.rejectFaculty(userId, rejectReason);
      
      // SEND DATA TO DASHBOARD BANNER
      if (onActionSuccess) {
        onActionSuccess({
          type: 'reject',
          name: displayName,
          email: faculty?.email || "Unknown Email"
        });
      }
      onClose();
    } catch (err) {
      alert("Rejection failed: " + (err.response?.data?.message || err.message || "Unknown Error"));
    } finally {
      setActionLoading(false);
    }
  };


  // --------------------------------------------------------
  // VIEW 1: APPROVE REGISTRATION (Figma Match)
  // --------------------------------------------------------
  if (currentView === "approve") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141B2B]/40 backdrop-blur-sm p-4">
        <div className="bg-[#FFFFFF] w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-[#C3C5D8]">
            <div className="flex items-center gap-3">
              <div className="bg-[#004DD2] text-white p-1.5 rounded-lg shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-[18px] font-semibold text-[#141B2B]">Approve Faculty Registration</h2>
            </div>
            <button onClick={onClose} className="text-[#585F6C] hover:bg-slate-100 p-1.5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-[#F8F9FA] border border-[#C3C5D8] rounded-[12px] p-5">
              <p className="text-[11px] font-semibold text-[#585F6C] uppercase tracking-wide mb-3">Faculty Member</p>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#585F6C] uppercase mb-1">Qualification</p>
                  <p className="text-[14px] font-medium text-[#141B2B]">{faculty?.qualification || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#585F6C] uppercase mb-1">Department</p>
                  <p className="text-[14px] font-medium text-[#141B2B]">—</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#585F6C] uppercase mb-1">Reg. Date</p>
                  <p className="text-[14px] font-medium text-[#141B2B]">—</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#585F6C] uppercase mb-1">Status</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFEDD5] text-[#92400E]">
                    Pending Verification
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[14px] font-semibold text-[#141B2B]">Assign UVFIN ID</label>
                {/* THIS HAS BEEN CHANGED TO OPTIONAL */}
                <span className="bg-slate-100 text-[#585F6C] text-[10px] font-bold px-2 py-0.5 rounded">OPTIONAL</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase size={16} className="text-[#585F6C]" />
                </div>
                <input
                  type="text"
                  value={uvfin}
                  onChange={(e) => setUvfin(e.target.value)}
                  placeholder="Can be allocated later..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-[8px] border border-[#C3C5D8] focus:border-[#004DD2] focus:ring-1 focus:ring-[#004DD2] outline-none text-[14px] transition-all"
                />
              </div>
              <p className="text-[12px] text-[#585F6C] mt-2">
                This unique identifier will be used for all academic and financial records.
              </p>
            </div>

            <div className="border border-[#C3C5D8] rounded-[12px] p-5">
              <h4 className="text-[14px] font-semibold text-[#141B2B] mb-3">Pre-approval Checks</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={checks.docs}
                    onChange={(e) => setChecks({ ...checks, docs: e.target.checked })}
                    className="w-4 h-4 text-[#004DD2] rounded border-[#C3C5D8] focus:ring-[#004DD2]"
                  />
                  <span className="text-[14px] text-[#585F6C] group-hover:text-[#141B2B] transition-colors">Identity documents verified</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={checks.head}
                    onChange={(e) => setChecks({ ...checks, head: e.target.checked })}
                    className="w-4 h-4 text-[#004DD2] rounded border-[#C3C5D8] focus:ring-[#004DD2]"
                  />
                  <span className="text-[14px] text-[#585F6C] group-hover:text-[#141B2B] transition-colors">Departmental head endorsement confirmed</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 pt-0">
            <button 
              onClick={() => setCurrentView("profile")}
              className="flex-1 px-4 py-2.5 text-[#585F6C] bg-white border border-[#C3C5D8] hover:bg-slate-50 rounded-[8px] text-[14px] font-semibold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleApproveSubmit}
              disabled={actionLoading || !checks.docs || !checks.head}
              className="flex-1 px-4 py-2.5 bg-[#004DD2] hover:bg-blue-700 text-white rounded-[8px] text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              Submit Approval <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // VIEW 2: REJECT REGISTRATION
  // --------------------------------------------------------
  if (currentView === "reject") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141B2B]/40 backdrop-blur-sm p-4">
        <div className="bg-[#FFFFFF] w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-start justify-between p-6 border-b border-[#C3C5D8]">
            <div className="flex gap-4">
              <div className="bg-red-50 text-[#DC3545] p-2.5 rounded-full shrink-0">
                <AlertTriangle size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#141B2B]">Reject Faculty Registration</h2>
                <p className="text-[12px] font-medium text-[#585F6C] mt-1">This action cannot be undone easily.</p>
              </div>
            </div>
            <button onClick={onClose} className="text-[#585F6C] hover:bg-slate-100 p-1.5 shrink-0 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-[#F8F9FA] border border-[#C3C5D8] rounded-[8px] p-4">
              <p className="text-[14px] text-[#585F6C] font-medium">
                {faculty?.qualification || "Qualification details missing"}
              </p>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-[#141B2B] mb-2">
                Rejection Remarks <span className="text-[#DC3545]">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain the reason for rejection (e.g., 'Incomplete documentation', 'Invalid credentials')..."
                className="w-full p-4 rounded-[8px] border border-[#C3C5D8] focus:border-[#DC3545] focus:ring-1 focus:ring-[#DC3545] outline-none text-[14px] min-h-[120px] resize-none transition-all"
              />
              <p className="text-[12px] text-[#585F6C] mt-2 font-medium">
                Provide a clear explanation that will be sent to the faculty member.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-6 pt-0">
            <button 
              onClick={() => setCurrentView("profile")}
              className="flex-1 px-4 py-2.5 text-[#585F6C] bg-white border border-[#C3C5D8] hover:bg-slate-50 rounded-[8px] text-[14px] font-bold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleRejectSubmit}
              disabled={actionLoading || !rejectReason.trim()}
              className="flex-1 px-4 py-2.5 bg-[#DC3545] hover:bg-red-700 text-white rounded-[8px] text-[14px] font-bold transition-colors disabled:opacity-50"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // VIEW 3: MAIN PROFILE VIEW (Default)
  // --------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141B2B]/40 backdrop-blur-sm p-4">
      <div className="bg-[#FFFFFF] w-full max-w-[540px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#C3C5D8] shrink-0 z-10">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#004DD2]" />
            <h2 className="text-[18px] font-semibold text-[#141B2B]">Approve Faculty Registration</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#585F6C] hover:text-[#141B2B] hover:bg-slate-100 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-7 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#C3C5D8] [&::-webkit-scrollbar-thumb]:rounded-full">
          {loading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner label="Loading Profile..." /></div>
          ) : error ? (
            <div className="py-12 text-center text-[#BA1A1A]">{error}</div>
          ) : (
            <>
              <div className="bg-[#F1F3FF] border border-[#C3C5D8] rounded-[12px] p-6">
                <div className="mb-6">
                  <p className="text-[11px] font-semibold text-[#585F6C] uppercase tracking-wide mb-1">Faculty Member</p>
                  <h3 className="text-[20px] font-bold text-[#141B2B] capitalize">Prof. {displayName}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-y-5">
                  <div>
                    <p className="text-[11px] font-semibold text-[#585F6C] uppercase tracking-wide mb-1">Qualification</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">{faculty?.qualification || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#585F6C] uppercase tracking-wide mb-1">Department</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">—</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#585F6C] uppercase tracking-wide mb-1">Reg. Date</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">—</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#585F6C] uppercase tracking-wide mb-1">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#FFEDD5] text-[#92400E]">
                      Pending Verification
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#C3C5D8] rounded-[12px] p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-[#004DD2]" />
                    <h3 className="text-[16px] font-semibold text-[#141B2B]">Personal Information</h3>
                  </div>
                  <button className="text-[13px] font-semibold text-[#004DD2] hover:underline">Edit</button>
                </div>
                
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div>
                    <p className="text-[12px] text-[#585F6C] mb-1">Full Name</p>
                    <p className="text-[14px] font-medium text-[#141B2B] capitalize">{displayName}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#585F6C] mb-1">Phone Number</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">+91 {faculty?.phone_number || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#585F6C] mb-1">Email Address</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">{faculty?.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#585F6C] mb-1">Date of Birth</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">—</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[12px] text-[#585F6C] mb-1">Residential Address</p>
                    <p className="text-[14px] font-medium text-[#141B2B] leading-relaxed">{faculty?.address || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#C3C5D8] rounded-[12px] p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-[#004DD2]" />
                    <h3 className="text-[16px] font-semibold text-[#141B2B]">Academic & Professional</h3>
                  </div>
                  <button className="text-[13px] font-semibold text-[#004DD2] hover:underline">Edit</button>
                </div>
                
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <div>
                    <p className="text-[12px] text-[#585F6C] mb-1">Highest Qualification</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">{faculty?.qualification || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#585F6C] mb-1">Department</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">—</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#585F6C] mb-1">Teaching Experience</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">—</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#585F6C] mb-1">Specialization</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">—</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[12px] text-[#585F6C] mb-1">Previous Institution</p>
                    <p className="text-[14px] font-medium text-[#141B2B]">—</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && !error && (!faculty?.is_approved || faculty?.status === 'pending') && (
          <div className="border-t border-[#C3C5D8] bg-[#FFFFFF] p-5 px-7 shrink-0 rounded-b-2xl">
            <div className="flex gap-4">
              <button 
                onClick={() => setCurrentView("approve")}
                className="px-6 py-2.5 bg-[#004DD2] hover:bg-blue-700 text-[#FFFFFF] font-semibold rounded-[8px] text-[14px] flex items-center gap-2 transition-colors"
              >
                <CheckCircle2 size={18} /> Approve Profile
              </button>
              <button 
                onClick={() => setCurrentView("reject")}
                className="px-6 py-2.5 bg-[#FFFFFF] border border-[#BA1A1A] hover:bg-red-50 text-[#BA1A1A] font-semibold rounded-[8px] text-[14px] flex items-center gap-2 transition-colors"
              >
                <XCircle size={18} /> Reject & Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}