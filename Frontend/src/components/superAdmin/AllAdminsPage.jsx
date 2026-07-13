import React, { useState, useEffect } from "react";
import Topbar from "./Topbar";
import { Users, UserCheck, ClipboardList, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import axios from "axios";

// Add onNavigate prop to handle Topbar badge clicks
export default function AllAdminsPage({ onNavigate }) {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for search

  useEffect(() => {
    fetchAllAdmins();
  }, []);

  const fetchAllAdmins = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
      const response = await axios.get(`http://localhost:5000/api/super_admin/approvedAdmin`, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      setAdmins(response.data.data || []);
    } catch (err) {
      console.error("Error fetching all admins:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter admins based on the search term
  const filteredAdmins = admins.filter(admin => {
    if (!searchTerm) return true;
    const adminName = admin.full_name || "";
    return adminName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // --- CSV Export Logic ---
  const exportToCSV = () => {
    const headers = ["Name", "Email", "User ID", "Department", "Role", "Status"];
    
    // Export only the filtered list
    const csvContent = [
      headers.join(","),
      ...filteredAdmins.map(a => [a.full_name, a.email, a.user_id, a.department, a.role, a.status].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admins_list_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`;
    a.click();
  };

  // Calculate Stats Dynamically based on TOTAL fetched admins
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(a => a.status === 'approved' || a.is_approved).length;
  const pendingAdmins = admins.filter(a => a.status === 'pending').length;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <Topbar 
        title="All Admin Accounts" 
        subtitle="Active and approved VFM System administrators"
        onPendingClick={() => onNavigate("pending")} // Navigates to pending page
        onSearch={(value) => setSearchTerm(value)} // Updates search state
      />
      
      <div className="px-8 py-8">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">All Admin Accounts</h1>
            <p className="text-gray-400">Active and approved VFM System administrators</p>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 border border-gray-200 rounded-full px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <StatCard label="Total Admins" value={totalAdmins} icon={Users} bg="bg-blue-50" color="text-blue-500" />
          <StatCard label="Active Accounts" value={activeAdmins} icon={UserCheck} bg="bg-green-50" color="text-green-500" />
          <StatCard label="Pending Review" value={pendingAdmins} icon={ClipboardList} bg="bg-amber-50" color="text-amber-500" />
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-purple-600" /></div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 border-b border-gray-100">
                    <th className="py-3 pr-4">ADMIN NAME</th>
                    <th className="py-3 pr-4">USER ID</th>
                    <th className="py-3 pr-4">DEPARTMENT</th>
                    <th className="py-3 pr-4">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((a) => (
                      <tr key={a.user_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-sm uppercase">
                              {a.full_name ? a.full_name[0] : 'A'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{a.full_name}</div>
                              <div className="text-gray-400 text-xs">{a.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-purple-600 font-semibold text-sm">{a.user_id}</td>
                        <td className="py-4 pr-4 text-gray-700 text-sm">{a.department || 'N/A'}</td>
                        <td className="py-4 pr-4">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                            a.status === 'approved' || a.is_approved ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {a.status || (a.is_approved ? 'approved' : 'pending')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-gray-500 text-sm">
                        No administrators found matching "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Stats
function StatCard({ label, value, icon: Icon, bg, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}