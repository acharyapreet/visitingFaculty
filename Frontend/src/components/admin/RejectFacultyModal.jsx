import { useState } from "react";
import { IconAlertTriangle, IconX } from "./icons";

export default function RejectFacultyModal({ faculty, onCancel, onConfirm }) {
  const [remarks, setRemarks] = useState("");
  const [touched, setTouched] = useState(false);

  if (!faculty) return null;

  const isValid = remarks.trim().length > 0;

  const handleConfirm = () => {
    if (!isValid) {
      setTouched(true);
      return;
    }
    onConfirm(faculty, remarks.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
              <IconAlertTriangle />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Reject Faculty Registration</h2>
              <p className="text-sm text-slate-500">This action cannot be undone easily.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <IconX />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{faculty.name}</p>
            <p className="text-sm text-slate-500">{faculty.qualification.replace(/[()]/g, "")}</p>
            <p className="mt-1 text-xs text-slate-400">Appearing since: {faculty.appearingSince}</p>
          </div>

          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Rejection Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            placeholder="Explain the reason for rejection (e.g., 'Incomplete documentation', 'Invalid credentials')..."
            className={`w-full resize-none rounded-xl border bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
              touched && !isValid
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
            }`}
          />
          {touched && !isValid ? (
            <p className="mt-1.5 text-xs text-red-500">Please provide a rejection reason.</p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">
              Provide a clear explanation that will be sent to the faculty member.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}