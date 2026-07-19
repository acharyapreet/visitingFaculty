import React, { useState } from "react";
import { Check, X, Eye, AlertTriangle, ShieldCheck, Briefcase } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import FacultyModal from "./FacultyModal";

/**
 * Table of faculty awaiting registration approval.
 * Props:
 *  faculty: array of pending faculty
 *  loading: boolean
 *  onChanged: called after a successful approve/reject to let parent refresh
 */
export default function PendingFacultyTable({ faculty = [], loading, onChanged }) {
  // Use a single state to control the modal and which view to open
  const [modalConfig, setModalConfig] = useState(null); 

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-slate-400 border-b border-slate-100">
              <th className="px-6 py-3">Faculty Name</th>
              <th className="px-6 py-3">UVFIN</th>
              <th className="px-6 py-3">Qualification</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="py-10">
                  <LoadingSpinner label="Loading pending faculty..." />
                </td>
              </tr>
            )}

            {!loading && faculty.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                  No faculty pending approval right now.
                </td>
              </tr>
            )}

            {!loading &&
              faculty.map((f) => (
                <tr key={f.id || f.user_id} className="border-b border-slate-50 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-semibold">
                        {f.name?.charAt(0) ?? "F"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{f.name}</p>
                        <p className="text-xs text-slate-400">{f.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                      {f.uvfin || f.uvfinId || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{f.qualification}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalConfig({ userId: f.id || f.user_id, view: "approve" })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => setModalConfig({ userId: f.id || f.user_id, view: "reject" })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        <X size={14} /> Reject
                      </button>
                      <button
                        onClick={() => setModalConfig({ userId: f.id || f.user_id, view: "profile" })}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:underline transition-colors"
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* RENDER OUR REAL MODAL HERE */}
      {modalConfig && (
        <FacultyModal 
          userId={modalConfig.userId}
          initialView={modalConfig.view} 
          onClose={() => setModalConfig(null)} 
          onActionSuccess={() => {
            setModalConfig(null);
            if (onChanged) onChanged();
          }}
        />
      )}
    </div>
  );
}