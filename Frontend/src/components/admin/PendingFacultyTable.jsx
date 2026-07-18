import React, { useState } from "react";
import { Check, X, Eye, AlertTriangle, ShieldCheck, Briefcase } from "lucide-react";
import adminApi from "../../api/adminApi";
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
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [viewId, setViewId] = useState(null);

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
                        onClick={() => setApproveTarget(f)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(f)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600"
                      >
                        <X size={14} /> Reject
                      </button>
                      <button
                        onClick={() => setViewId(f.id || f.user_id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:underline"
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

      {approveTarget && (
        <ApproveModal
          faculty={approveTarget}
          onClose={() => setApproveTarget(null)}
          onSuccess={() => {
            setApproveTarget(null);
            onChanged?.();
          }}
        />
      )}

      {rejectTarget && (
        <RejectModal
          faculty={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onSuccess={() => {
            setRejectTarget(null);
            onChanged?.();
          }}
        />
      )}

      {viewId && <FacultyModal userId={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
}

function ApproveModal({ faculty, onClose, onSuccess }) {
  const [uvfin, setUvfin] = useState("");
  const [identityVerified, setIdentityVerified] = useState(true);
  const [hodConfirmed, setHodConfirmed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!uvfin.trim()) {
      setError("UVFIN ID is mandatory.");
      return;
    }
    if (!identityVerified || !hodConfirmed) {
      setError("Please confirm all pre-approval checks.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await adminApi.approveFaculty(faculty.id || faculty.user_id, "approved", { uvfin });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve faculty.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Approve Faculty Registration</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2">
              <p className="text-xs text-slate-400">Faculty Member</p>
              <p className="font-semibold text-slate-800">{faculty.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Qualification</p>
              <p className="font-medium text-slate-700">{faculty.qualification}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Department</p>
              <p className="font-medium text-slate-700">{faculty.department || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Reg. Date</p>
              <p className="font-medium text-slate-700">{faculty.regDate || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                Pending Verification
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Assign UVFIN ID</label>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                MANDATORY
              </span>
            </div>
            <div className="relative">
              <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={uvfin}
                onChange={(e) => setUvfin(e.target.value)}
                placeholder="UVF-2k26-001"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              This unique identifier will be used for all academic and financial records.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-700 mb-3">Pre-approval Checks</p>
            <label className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <input
                type="checkbox"
                checked={identityVerified}
                onChange={(e) => setIdentityVerified(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600"
              />
              Identity documents verified
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={hodConfirmed}
                onChange={(e) => setHodConfirmed(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600"
              />
              Departmental head endorsement confirmed
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Approval"}
            <Check size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ faculty, onClose, onSuccess }) {
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!remarks.trim()) {
      setError("Rejection remarks are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await adminApi.approveFaculty(faculty.id || faculty.user_id, "rejected", { remarks });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject faculty.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Reject Faculty Registration</h2>
              <p className="text-xs text-slate-400">This action cannot be undone easily.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-slate-800">{faculty.name}</p>
            <p className="text-sm text-slate-500">{faculty.qualification}</p>
            {faculty.regDate && (
              <p className="text-xs text-slate-400 mt-1">Appearing since: {faculty.regDate}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Rejection Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              placeholder="Explain the reason for rejection (e.g., 'Incomplete documentation', 'Invalid credentials')..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <p className="text-xs text-slate-400 mt-1">
              Provide a clear explanation that will be sent to the faculty member.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60"
          >
            {submitting ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}
