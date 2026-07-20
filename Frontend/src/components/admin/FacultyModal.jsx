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
import axios from "axios";

export default function FacultyModal({ userId, onClose, onActionSuccess, initialView = "profile" }) {
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Navigation State
  const [currentView, setCurrentView] = useState(initialView); 
  
  // Action States (Approvals & Rejections)
  const [uvfin, setUvfin] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // New Action States (Approved Faculty specific)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showUvfinInput, setShowUvfinInput] = useState(false);
  const [newUvfin, setNewUvfin] = useState("");
  const [uvfinLoading, setUvfinLoading] = useState(false);

  // Helper to fetch Auth Token
  const getAuthHeaders = () => {
    const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
    return { Authorization: `Bearer ${session.token}` };
  };

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
    setActionLoading(true);
    try {
      await adminApi.approveFaculty(faculty.id || faculty.user_id, uvfin);
      onActionSuccess && onActionSuccess({ action: 'approved' });
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
      await adminApi.rejectFaculty(faculty.id || faculty.user_id, rejectReason);
      onActionSuccess && onActionSuccess({ action: 'rejected' });
      onClose();
    } catch (err) {
      alert("Rejection failed: " + (err.response?.data?.message || err.message || "Unknown Error"));
    } finally {
      setActionLoading(false);
    }
  };

  // --- NEW HANDLERS: TOGGLE STATUS & UPDATE UVFIN ---
  
  const handleToggleStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const action = faculty.is_active ? "deactivate" : "activate";
      const facultyId = faculty.id || faculty.user_id;
      
      await axios.put(`http://localhost:5000/api/account-status/admin/faculty/${facultyId}/${action}`, {}, {
        headers: getAuthHeaders()
      });
      
      setFaculty(prev => ({ ...prev, is_active: !prev.is_active }));
      onActionSuccess && onActionSuccess({ action: 'status_changed' });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update account status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateUvfin = async () => {
    if (!newUvfin.trim()) return;
    setUvfinLoading(true);
    try {
      const facultyId = faculty.id || faculty.user_id;
      await axios.put(`http://localhost:5000/api/admin/updateFaculty/${facultyId}`, { uvfin: newUvfin }, {
        headers: getAuthHeaders()
      });
      
      // Update local state gracefully 
      setFaculty(prev => ({
        ...prev,
        uvfin: newUvfin,
        FacultyApproval: { ...prev.FacultyApproval, uvfin: newUvfin }
      }));
      setShowUvfinInput(false);
      onActionSuccess && onActionSuccess({ action: 'uvfin_updated' });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign UVFIN.");
    } finally {
      setUvfinLoading(false);
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
              disabled={actionLoading}
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
  
  // Calculate specific conditions for UI rendering
  const isPending = (!faculty?.is_approved || faculty?.status === 'pending');
  const isApproved = (faculty?.is_approved || faculty?.status === 'approved' || faculty?.FacultyApproval?.status === 'approved');
  const missingUvfin = isApproved && !faculty?.FacultyApproval?.uvfin && !faculty?.uvfin;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141B2B]/40 backdrop-blur-sm p-4">
      <div className="bg-[#FFFFFF] w-full max-w-[540px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#C3C5D8] shrink-0 z-10">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#004DD2]" />
            <h2 className="text-[18px] font-semibold text-[#141B2B]">
              {isApproved ? "Faculty Profile & Actions" : "Approve Faculty Registration"}
            </h2>
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
                  
                  {isApproved && (faculty?.FacultyApproval?.uvfin || faculty?.uvfin) && (
                    <p className="text-[13px] font-semibold text-[#004DD2] mt-1">
                      UVFIN: {faculty?.FacultyApproval?.uvfin || faculty?.uvfin}
                    </p>
                  )}
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
                    {isPending ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#FFEDD5] text-[#92400E]">
                        Pending Verification
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold ${faculty?.is_active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {faculty?.is_active ? 'Active Account' : 'Inactive Account'}
                      </span>
                    )}
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

        {/* --- FOOTER: PENDING ACTIONS --- */}
        {!loading && !error && isPending && (
          <div className="border-t border-[#C3C5D8] bg-[#FFFFFF] p-5 px-7 shrink-0 rounded-b-2xl flex gap-4">
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
        )}

        {/* --- FOOTER: APPROVED ACTIONS (STATUS & UVFIN) --- */}
        {!loading && !error && isApproved && (
          <div className="border-t border-[#C3C5D8] bg-[#F8F9FA] p-5 px-7 shrink-0 rounded-b-2xl flex flex-wrap items-center justify-between gap-4">
            
            {/* Status Toggle Button */}
            <button 
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus}
              className={`px-5 py-2.5 rounded-[8px] text-[14px] font-semibold flex items-center gap-2 transition-colors ${
                faculty?.is_active 
                  ? "bg-white border border-[#BA1A1A] text-[#BA1A1A] hover:bg-red-50" 
                  : "bg-white border border-[#16A34A] text-[#16A34A] hover:bg-green-50"
              }`}
            >
              {isUpdatingStatus ? (
                <LoadingSpinner size="sm" />
              ) : faculty?.is_active ? (
                <XCircle size={18} /> 
              ) : (
                <CheckCircle2 size={18} />
              )}
              {faculty?.is_active ? "Deactivate Faculty" : "Activate Faculty"}
            </button>

            {/* Optional UVFIN Addition */}
            {missingUvfin && (
              showUvfinInput ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newUvfin} 
                    onChange={e => setNewUvfin(e.target.value)} 
                    placeholder="Enter UVFIN..."
                    autoFocus
                    className="w-36 px-3 py-2 border border-[#C3C5D8] rounded-[6px] text-[13px] font-medium focus:outline-none focus:border-[#004DD2]"
                  />
                  <button 
                    onClick={handleUpdateUvfin}
                    disabled={uvfinLoading || !newUvfin.trim()}
                    className="px-4 py-2 bg-[#004DD2] text-white text-[13px] font-medium rounded-[6px] hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {uvfinLoading ? "Saving..." : "Save"}
                  </button>
                  <button 
                    onClick={() => { setShowUvfinInput(false); setNewUvfin(""); }}
                    className="p-1.5 text-[#585F6C] hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowUvfinInput(true)}
                  className="px-5 py-2.5 bg-[#004DD2] hover:bg-blue-700 text-[#FFFFFF] font-semibold rounded-[8px] text-[14px] flex items-center gap-2 transition-colors"
                >
                  <Briefcase size={16} /> Assign UVFIN
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}