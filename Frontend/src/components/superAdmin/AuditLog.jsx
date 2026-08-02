import React, { useState, useEffect } from "react";
import { Download, Printer } from "lucide-react";
import axios from "axios";

// Notice we added { searchQuery } here as a prop!
export default function AuditLog({ searchQuery = "" }) {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("Select...");

  useEffect(() => {
    // Replace with your actual Audit Log endpoint
    // const fetchLogs = async () => { ... }
    // fetchLogs(); 
  }, []);

  // 1. Define the status checker
  const getLogStatus = (log) => {
    if (log.AdminApproval?.status) {
      return log.AdminApproval.status.charAt(0).toUpperCase() + log.AdminApproval.status.slice(1);
    }
    return log.is_approved ? "Approved" : "Rejected";
  };

  // 2. Define the filtered logs logic so the component doesn't crash
  const filteredLogs = logs.filter((log) => {
    const status = getLogStatus(log);
    
    // Check dropdown filter
    const matchesDropdown = filter === "Select..." || status === filter;
    
    // Check search query
    const lowerQuery = (searchQuery || "").toLowerCase();
    const matchesSearch = !searchQuery || (
      (log.full_name && log.full_name.toLowerCase().includes(lowerQuery)) ||
      (log.user_id && log.user_id.toLowerCase().includes(lowerQuery)) ||
      (status.toLowerCase().includes(lowerQuery))
    );

    return matchesDropdown && matchesSearch;
  });

  const handlePrint = () => window.print();

  const exportToCSV = () => {
    const headers = ["Sr.", "Action", "Program Incharge Name", "User ID", "Performed By", "Date", "Remarks"];
    const csvContent = "data:text/csv;charset=utf-8," + 
      headers.join(",") + "\n" +
      filteredLogs.map((l, i) => [
        i + 1, 
        getLogStatus(l), 
        l.full_name || "Unknown", 
        l.user_id, 
        "Super Admin",
        l.updated_at ? new Date(l.updated_at).toLocaleDateString() : "-", 
        (l.AdminApproval?.rejection_reason || "-").replace(/,/g, "") 
      ].join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "audit_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">Audit Log</h3>
        <div className="flex gap-3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 outline-none focus:border-[#004DD2]"
          >
            <option>Select...</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <button onClick={exportToCSV} className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 border-b border-gray-100 uppercase">
              <th className="py-3">Sr.</th>
              <th className="py-3">Action</th>
              <th className="py-3">Program Incharge Name</th>
              <th className="py-3">User ID Issued</th>
              <th className="py-3">Performed By</th>
              <th className="py-3">Date</th>
              <th className="py-3">Remarks</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-16 text-center text-gray-500 text-sm">
                  {searchQuery ? (
                    <>No Program Incharges found matching "{searchQuery}".</>
                  ) : (
                    "No audit logs found in the system."
                  )}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, i) => {
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
                    <td className="py-4 text-gray-600">
                      {log.updated_at ? new Date(log.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                    </td>
                    <td className="py-4 text-gray-400">{log.AdminApproval?.rejection_reason || '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}