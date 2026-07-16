import { useState } from "react";
import { IconShieldCheck, IconX } from "./icons";

export default function ApproveFacultyModal({ faculty, onCancel, onSubmit }) {
  const [uvfin, setUvfin] = useState("");
  const [checks, setChecks] = useState({ identity: true, endorsement: true });
  const [touched, setTouched] = useState(false);

  if (!faculty) return null;

  const isValid = uvfin.trim().length > 0 && checks.identity && checks.endorsement;

  const handleSubmit = () => {
    if (!isValid) {
      setTouched(true);
      return;
    }
    onSubmit(faculty, uvfin.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <IconShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Approve Faculty Registration</h2>
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
          <div className="mb-5 grid grid-cols-2 gap-y-3 rounded-xl bg-slate-50 px-4 py-4">
            <div className="col-span-2">
              <p className="text-[11px] font-medium tracking-wide text-slate-400">FACULTY MEMBER</p>
              <p className="text-base font-semibold text-slate-900">{faculty.name}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">QUALIFICATION</p>
              <p className="text-sm font-medium text-slate-800">{faculty.qualification}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">DEPARTMENT</p>
              <p className="text-sm font-medium text-slate-800">{faculty.department}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">REG. DATE</p>
              <p className="text-sm font-medium text-slate-800">{faculty.regDate}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">STATUS</p>
              <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                {faculty.status}
              </span>
            </div>
          </div>

          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Assign UVFIN ID</label>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-blue-600">
              MANDATORY
            </span>
          </div>
          <input
            type="text"
            value={uvfin}
            onChange={(e) => setUvfin(e.target.value)}
            placeholder="UVF-2k26-001"
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 ${
              touched && !uvfin.trim()
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
            }`}
          />
          <p className="mt-1.5 mb-5 text-xs text-slate-400">
            This unique identifier will be used for all academic and financial records.
          </p>

          <div className="rounded-xl border border-slate-200 border-dashed px-4 py-4">
            <p className="mb-3 text-sm font-medium text-slate-700">Pre-approval Checks</p>
            <label className="mb-2 flex items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={checks.identity}
                onChange={(e) => setChecks((c) => ({ ...c, identity: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
              />
              Identity documents verified
            </label>
            <label className="flex items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={checks.endorsement}
                onChange={(e) => setChecks((c) => ({ ...c, endorsement: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
              />
              Departmental head endorsement confirmed
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Submit Approval
            <IconShieldCheck className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}