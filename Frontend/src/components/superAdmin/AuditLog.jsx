import React, { useState, useEffect } from "react";
import { Download, Printer } from "lucide-react";
import axios from "axios";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("Select...");

  useEffect(() => {
    // Replace with your actual Audit Log endpoint
    // fetchLogs(); 
  }, []);

  const handlePrint = () => window.print();

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Sr.,Action,Admin Name,User ID,Performed By,Date,Remarks"].join(",") + "\n" +
      logs.map(l => Object.values(l).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "audit_log.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">Audit Log</h3>
        <div className="flex gap-3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 outline-none"
          >
            <option>Select...</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <button onClick={exportToCSV} className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-400 uppercase border-b border-gray-100">
            <tr>
              <th className="py-3">Sr.</th>
              <th className="py-3">Action</th>
              <th className="py-3">Admin Name</th>
              <th className="py-3">User ID Issued</th>
              <th className="py-3">Performed By</th>
              <th className="py-3">Date</th>
              <th className="py-3">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {/* Map through your dynamic logs here */}
          </tbody>
        </table>
      </div>
    </div>
  );
}