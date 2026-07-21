import React, { useState, useEffect } from "react";
import Topbar from "./Topbar";
import { Download, Printer, ClipboardList, CheckCircle2, XCircle, X } from "lucide-react"; // Added icons for Toast
import axios from "axios";

const tabs = ["General", "Security", "Audit Log"];

const systemInfo = [
  { label: "System Version", value: "VFM v2.0.1" },
  { label: "Total Admin Requests", value: "5" },
  { label: "Approved Admins", value: "1" },
  { label: "Pending Reviews", value: "3" },
  { label: "Last Activity", value: "24 Dec 2024, 10:45 AM" },
];

export default function Settings() {
  // --- BULLETPROOF TAB MEMORY ---
  const [activeTab, setActiveTab] = useState(() => {
    const savedSettingsTab = localStorage.getItem("iipsSettingsTab");
    return savedSettingsTab || "General";
  });

  useEffect(() => {
    localStorage.setItem("iipsSettingsTab", activeTab);
  }, [activeTab]);
  // ------------------------------

  // --- CUSTOM TOAST NOTIFICATION STATE ---
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    // Auto-hide after 3.5 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };
  // ---------------------------------------

  const [auditFilter, setAuditFilter] = useState("Select...");
  const [logs, setLogs] = useState([]);

  // --- Security Tab States ---
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // --- General Tab States ---
  const [profileData, setProfileData] = useState({
    full_name: "", 
    email: "",
    phone_number: ""
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Pre-fill profile data from current session on load, leaving empty if no data exists
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
    if (session && Object.keys(session).length > 0) {
      setProfileData({
        full_name: session.name || session.full_name || "",
        email: session.email || "",
        phone_number: session.phone_number || ""
      });
    }
  }, []);

// --- 1. PROFILE UPDATE HANDLER ---
  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true);
    try {
      const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
      
      const currentUserId = session.userId || session.user_id || session.id; 
      
      if (!session.token || !currentUserId) {
         throw new Error("No active session found. Please log in again.");
      }

      const response = await axios.put(
        `http://localhost:5000/api/auth/update/${currentUserId}`,
        profileData,
        { headers: { Authorization: `Bearer ${session.token}` } }
      );

      if (response.data.success) {
        showToast("Profile updated successfully!", "success");
        session.name = profileData.full_name;
        localStorage.setItem('iipsCurrentSession', JSON.stringify(session));
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast(err.response?.data?.message || err.message || "Failed to update profile.", "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

// --- 2. CHANGE PASSWORD HANDLER ---
  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return showToast("Please fill in all password fields.", "error");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showToast("New passwords do not match!", "error");
    }
    if (passwords.newPassword.length < 8) {
      return showToast("New password must be at least 8 characters.", "error");
    }

    setIsUpdatingPassword(true);
    try {
      const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
      
      const currentUserId = session.userId || session.user_id || session.id;

      if (!session.token || !currentUserId) {
        throw new Error("No active session found. Please log in again.");
      }

      const response = await axios.put(
        `http://localhost:5000/api/auth/changePassword`,
        {
          user_id: currentUserId,
          oldPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        },
        { headers: { Authorization: `Bearer ${session.token}` } }
      );

      if (response.data.success) {
        showToast("Password changed successfully!", "success");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); 
      }
    } catch (err) {
      console.error("Error changing password:", err);
      showToast(err.response?.data?.message || err.message || "Failed to change password.", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Fetch data for the Audit Log
  const fetchAuditLogs = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
      if (!session.token) return;

      const response = await axios.get("http://localhost:5000/api/super_admin/allAdmin", {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      const processedLogs = response.data.data.filter(
        admin => admin.AdminApproval?.status === 'approved' || admin.AdminApproval?.status === 'rejected' || admin.is_approved
      );
      setLogs(processedLogs);
    } catch (err) {
      console.error("Error loading logs", err);
    }
  };

  useEffect(() => {
    if (activeTab === "Audit Log") fetchAuditLogs();
  }, [activeTab]);

  const getLogStatus = (log) => {
    if (log.AdminApproval?.status) {
      return log.AdminApproval.status.charAt(0).toUpperCase() + log.AdminApproval.status.slice(1);
    }
    return log.is_approved ? "Approved" : "Rejected";
  };

  const filteredLogs = logs.filter(log => {
    if (auditFilter === "Select...") return true;
    return getLogStatus(log) === auditFilter;
  });

  const exportToCSV = () => {
    const headers = ["Sr.", "Action", "Admin Name", "User ID", "Date", "Remarks"];
    const csvContent = [
      headers.join(","), 
      ...filteredLogs.map((l, i) => [
        i + 1, 
        getLogStatus(l), 
        l.full_name || "Unknown", 
        l.user_id, 
        new Date(l.updated_at).toLocaleDateString(), 
        (l.AdminApproval?.rejection_reason || "-").replace(/,/g, "") 
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`;
    a.click();
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex-1 bg-gray-50 min-h-screen relative">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #audit-log-container, #audit-log-container * { visibility: visible; }
          #audit-log-container { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* --- FLOATING TOAST NOTIFICATION --- */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-xl border animate-in slide-in-from-top-4 fade-in duration-300 ${
          toast.type === "success" 
            ? "bg-white border-green-100 text-green-800" 
            : "bg-white border-red-100 text-red-800"
        }`}>
          {toast.type === "success" ? (
            <div className="bg-green-100 text-green-600 rounded-full p-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="bg-red-100 text-red-600 rounded-full p-1">
              <XCircle className="w-5 h-5" />
            </div>
          )}
          <p className="text-sm font-semibold pr-4">{toast.message}</p>
          <button 
            onClick={() => setToast({ ...toast, show: false })} 
            className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="no-print">
        <Topbar 
            title="Settings" 
            subtitle="System-wide configuration, security and audit log" 
            showSearch={false} 
          />
      </div>

      <div className="px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 no-print">Settings</h1>
        <p className="text-gray-400 mb-6 no-print">System-wide configuration, security and audit log</p>

        {/* Tabs */}
        <div className="inline-flex bg-gray-100 rounded-full p-1 mb-6 no-print">
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
                {isAudit && <span className="text-gray-400 font-normal"> ({filteredLogs.length})</span>}
              </button>
            );
          })}
        </div>

        {/* DYNAMIC CONTENT AREA */}
        {activeTab === "General" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex-1 max-w-2xl">
              <h3 className="font-bold text-gray-900 mb-6">Super Admin Account</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Display Name</label>
                  <input 
                    value={profileData.full_name} 
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" 
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</label>
                  <input 
                    value={profileData.email} 
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" 
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Mobile</label>
                  <input 
                    value={profileData.phone_number} 
                    onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                    placeholder="Enter mobile number"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" 
                  />
                </div>
                
                <button 
                  onClick={handleProfileUpdate}
                  disabled={isUpdatingProfile}
                  className="bg-[#004DD2] hover:bg-[#003bb3] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex-1 max-w-md h-fit">
              <h3 className="font-bold text-gray-900 mb-6">System Information</h3>
              <div className="flex flex-col divide-y divide-gray-100">
                {systemInfo.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3.5 first:pt-0">
                    <span className="text-gray-400 text-sm">{item.label}</span>
                    <span className="text-gray-900 font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Security" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex-1 max-w-2xl">
              <h3 className="font-bold text-gray-900 mb-6">Change Password</h3>
              <div className="space-y-5">
                
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                      placeholder="••••••••" 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 hover:text-[#004DD2] transition-colors focus:outline-none">
                      {showCurrentPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      placeholder="Minimum 8 characters" 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 hover:text-[#004DD2] transition-colors focus:outline-none">
                      {showNewPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                      placeholder="Re-enter password" 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 hover:text-[#004DD2] transition-colors focus:outline-none">
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleChangePassword}
                  disabled={isUpdatingPassword}
                  className="bg-[#004DD2] hover:bg-[#003bb3] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUpdatingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex-1 max-w-md h-fit">
              <h3 className="font-bold text-gray-900 mb-6">Session & Access</h3>
              <div className="space-y-6">
                {[
                  { label: "Session Timeout", sub: "Auto-logout after inactivity" },
                  { label: "Two-Factor Auth", sub: "OTP via registered email" },
                  { label: "Login Attempts", sub: "Lock after 5 failed attempts" }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.sub}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#8B5CF6] text-[#8B5CF6] rounded cursor-pointer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Audit Log" && (
          <div id="audit-log-container" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6 no-print">
              <h3 className="font-bold text-gray-900">Audit Log</h3>
              <div className="flex gap-3">
                <select value={auditFilter} onChange={(e) => setAuditFilter(e.target.value)} className="border px-4 py-2 rounded-full text-sm outline-none focus:border-blue-500">
                  <option>Select...</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
                <button onClick={exportToCSV} className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-2">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <ClipboardList className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-gray-900 font-semibold mb-1">No Audit Logs Found</h4>
                  <p className="text-gray-500 text-sm max-w-sm">
                    There are currently no records of admin approvals or rejections in the system.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-400 border-b border-gray-100 uppercase">
                      <th className="py-3">Sr.</th>
                      <th className="py-3">Action</th>
                      <th className="py-3">Admin Name</th>
                      <th className="py-3">User ID Issued</th>
                      <th className="py-3">Performed By</th>
                      <th className="py-3">Date</th>
                      <th className="py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredLogs.length > 0 ? filteredLogs.map((log, i) => {
                      const status = getLogStatus(log);
                      return (
                        <tr key={log.user_id || i} className="border-b border-gray-50">
                          <td className="py-4 text-gray-500">{i + 1}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              status === 'Approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-4 font-medium text-gray-900">{log.full_name || "Unknown"}</td>
                          <td className="py-4 text-purple-600 font-semibold">{status === 'Approved' ? log.user_id : "—"}</td>
                          <td className="py-4 text-gray-600">Super Admin</td>
                          <td className="py-4 text-gray-600">{new Date(log.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="py-4 text-gray-400">{log.AdminApproval?.rejection_reason || '—'}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-500 text-sm">No records match the selected filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}