import { useState } from "react";
import { Link } from "react-router-dom";
import { initialPendingFaculty } from "./mockdata";
import ApproveFacultyModal from "../../components/admin/ApproveFacultyModal";
import RejectFacultyModal from "../../components/admin/RejectFacultyModal";
import FacultyInfoModal from "../../components/admin/FacultyInfoModal";
import StatusBanner from "../../components/admin/StatusBanner";
import { IconCheck, IconX, IconEye, IconArrowRight } from "../../components/admin/icons";

const ADMIN_NAME = "Dr. Pradeep";
const SESSION_LABEL = "Session 2026-27";
const OVERVIEW_MONTH = "December 2024";

export default function Dashboard() {
  const [pending, setPending] = useState(initialPendingFaculty);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [banner, setBanner] = useState(null); // { tone, title, subtitle }

  const removeFromQueue = (facultyId) =>
    setPending((list) => list.filter((f) => f.id !== facultyId));

  const handleApproveSubmit = (faculty, uvfin) => {
    removeFromQueue(faculty.id);
    setApproveTarget(null);
    setViewTarget(null);
    setBanner({
      tone: "success",
      title: `Approved · User ID: ${uvfin}`,
      subtitle: `Credentials emailed to ${faculty.personal.email}`,
    });
  };

  const handleRejectConfirm = (faculty, remarks) => {
    removeFromQueue(faculty.id);
    setRejectTarget(null);
    setViewTarget(null);
    setBanner({
      tone: "error",
      title: `Rejected: Feedback Sent to ${faculty.personal.fullName.split(" ")[0]} ${faculty.personal.fullName.split(" ").slice(-1)}`,
      subtitle: `Credentials emailed to ${faculty.personal.email} — Reason: "${remarks}"`,
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome {ADMIN_NAME}</h1>
          <p className="text-sm text-slate-500">here&apos;s the overview for {OVERVIEW_MONTH}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
          {SESSION_LABEL}
        </span>
      </div>

      {banner ? (
        <div className="mb-6">
          <StatusBanner {...banner} onDismiss={() => setBanner(null)} />
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              Faculty Remaining for Registration approval
            </h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {pending.length}
            </span>
          </div>
          <Link
            to="/admin/faculty"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View All <IconArrowRight />
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="border-t border-slate-100 px-6 py-12 text-center text-sm text-slate-400">
            No pending faculty registrations right now.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-t border-slate-100 text-[11px] font-medium tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">FACULTY NAME</th>
                <th className="px-6 py-3 font-medium">UVFIN</th>
                <th className="px-6 py-3 font-medium">QUALIFICATION</th>
                <th className="px-6 py-3 font-medium">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((f) => (
                <tr key={f.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                        {f.name.replace(/^(Prof\.|Dr\.)\s*/, "").charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{f.name}</p>
                        <p className="text-xs text-slate-400">{f.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {f.uvfin}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{f.qualification}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setApproveTarget(f)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        <IconCheck /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectTarget(f)}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                      >
                        <IconX /> Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewTarget(f)}
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                      >
                        <IconEye /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ApproveFacultyModal
        faculty={approveTarget}
        onCancel={() => setApproveTarget(null)}
        onSubmit={handleApproveSubmit}
      />
      <RejectFacultyModal
        faculty={rejectTarget}
        onCancel={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />
      <FacultyInfoModal
        faculty={viewTarget}
        onClose={() => setViewTarget(null)}
        onApprove={(f) => {
          setViewTarget(null);
          setApproveTarget(f);
        }}
        onReject={(f) => {
          setViewTarget(null);
          setRejectTarget(f);
        }}
      />
    </div>
  );
}